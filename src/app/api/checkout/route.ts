import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { query } from '@/lib/database';
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

interface CustomerJwtPayload extends JwtPayload {
  customerId: number;
}

interface DBProduct {
  id: number;
  name: string;
  slug: string;
  price: string | number;
  image_url: string;
  purchase_type: 'affiliate' | 'direct';
  stock_quantity: number | null;
}

interface DBInsertResult {
  insertId: number;
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `YMP-${timestamp}-${random}`;
}

// Helper function to get customer ID from JWT token
function getCustomerIdFromToken(request: NextRequest): number | null {
  try {
    const token = request.cookies.get('customer_token')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as CustomerJwtPayload;
    return decoded.customerId || null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items, // Support for multiple items (cart)
      productId, // Compatibility for single product
      productSlug, // Compatibility for single product
      quantity = 1, // Compatibility for single product
      email,
      firstName,
      lastName,
      phone,
      addressLine1,
      addressLine2,
      city,
      county,
      postcode,
      country = 'United Kingdom',
      customerNotes,
      createAccount,
      password
    } = body;

    // Validate required fields
    if (!email || !firstName || !lastName || !addressLine1 || !city || !postcode) {
      return NextResponse.json(
        { error: 'Missing required customer information' },
        { status: 400 }
      );
    }

    // Normalize items to an array
    interface CartItemInput {
      id: number;
      quantity: number;
      slug?: string;
    }

    let cartItems: CartItemInput[] = items;
    if (!cartItems && productId) {
      cartItems = [{ id: productId, quantity, slug: productSlug }];
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      );
    }

    // Fetch all products in the cart to verify availability and prices
    const productIds = cartItems.map(item => item.id);
    const placeholders = productIds.map(() => '?').join(',');
    const productResults = await query(
      `SELECT id, name, slug, price, image_url, purchase_type, stock_quantity 
       FROM products 
       WHERE id IN (${placeholders}) AND is_active = 1`,
      productIds
    ) as DBProduct[];

    if (!Array.isArray(productResults) || productResults.length === 0) {
      return NextResponse.json(
        { error: 'Products not found' },
        { status: 404 }
      );
    }

    // Map database results for easy lookup and verification
    const dbProducts = new Map<number, DBProduct>(productResults.map(p => [p.id, p]));
    const verifiedItems = [];
    let subtotal = 0;

    for (const item of cartItems) {
      const dbProduct = dbProducts.get(item.id);
      if (!dbProduct) {
        return NextResponse.json(
          { error: `Product ID ${item.id} not found or inactive` },
          { status: 404 }
        );
      }

      if (dbProduct.purchase_type !== 'direct') {
        return NextResponse.json(
          { error: `Product "${dbProduct.name}" is not available for direct purchase` },
          { status: 400 }
        );
      }

      const q = parseInt(item.quantity.toString()) || 1;
      if (dbProduct.stock_quantity !== null && dbProduct.stock_quantity < q) {
        return NextResponse.json(
          { error: `Insufficient stock for "${dbProduct.name}"` },
          { status: 400 }
        );
      }

      const unitPrice = typeof dbProduct.price === 'string' ? parseFloat(dbProduct.price) : dbProduct.price;
      const itemTotal = unitPrice * q;
      subtotal += itemTotal;

      verifiedItems.push({
        ...dbProduct,
        quantity: q,
        unitPrice,
        totalPrice: itemTotal
      });
    }

    const shippingCost = 0; // Free shipping
    const taxAmount = 0; 
    const totalAmount = subtotal + shippingCost + taxAmount;

    const orderNumber = generateOrderNumber();
    let customerId: number | null = getCustomerIdFromToken(request);

    // Handle account creation
    if (!customerId && createAccount && password) {
      const existingCustomer = await query(
        'SELECT id FROM customers WHERE email = ?',
        [email]
      ) as { id: number }[];

      if (Array.isArray(existingCustomer) && existingCustomer.length > 0) {
        customerId = existingCustomer[0].id;
      } else {
        const passwordHash = await bcrypt.hash(password, 10);
        const customerResult = await query(
          `INSERT INTO customers (email, password_hash, first_name, last_name, phone)
           VALUES (?, ?, ?, ?, ?)`,
          [email, passwordHash, firstName, lastName, phone || null]
        ) as DBInsertResult;
        customerId = customerResult.insertId;

        await query(
          `INSERT INTO customer_addresses 
           (customer_id, address_type, first_name, last_name, address_line1, address_line2, city, county, postcode, country, phone, is_default)
           VALUES (?, 'shipping', ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [customerId, firstName, lastName, addressLine1, addressLine2 || null, city, county || null, postcode, country, phone || null]
        );
      }
    }

    // Create Order
    const orderResult = await query(
      `INSERT INTO orders (
        order_number, customer_id, customer_email, customer_first_name, customer_last_name, customer_phone,
        shipping_address_line1, shipping_address_line2, shipping_city, shipping_county, shipping_postcode, shipping_country,
        subtotal, shipping_cost, tax_amount, total_amount, currency,
        payment_status, order_status, customer_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'GBP', 'pending', 'pending', ?)`,
      [
        orderNumber, customerId, email, firstName, lastName, phone || null,
        addressLine1, addressLine2 || null, city, county || null, postcode, country,
        subtotal, shippingCost, taxAmount, totalAmount, customerNotes || null
      ]
    ) as DBInsertResult;

    const orderId = orderResult.insertId;

    // Create Order Items
    for (const item of verifiedItems) {
      await query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_slug, product_image_url, quantity, unit_price, total_price)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.id, item.name, item.slug, item.image_url, item.quantity, item.unitPrice, item.totalPrice]
      );
    }

    // Stripe Checkout
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const line_items = verifiedItems.map(item => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: item.name,
          images: item.image_url ? [item.image_url] : [],
        },
        unit_amount: Math.round(item.unitPrice * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items,
      metadata: {
        order_id: orderId.toString(),
        order_number: orderNumber,
      },
      success_url: `${baseUrl}/checkout/success?order=${orderNumber}`,
      cancel_url: productId ? `${baseUrl}/checkout/${productSlug}?cancelled=true` : `${baseUrl}/cart?cancelled=true`,
    });

    await query(
      'UPDATE orders SET stripe_payment_intent_id = ? WHERE id = ?',
      [session.id, orderId]
    );

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      checkoutUrl: session.url
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to process checkout', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
