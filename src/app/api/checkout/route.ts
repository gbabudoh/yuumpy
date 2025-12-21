import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { query } from '@/lib/database';
import bcrypt from 'bcryptjs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `YMP-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      productSlug,
      quantity = 1,
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
    if (!productId || !email || !firstName || !lastName || !addressLine1 || !city || !postcode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get product details
    const productResult = await query(
      'SELECT id, name, slug, price, image_url, purchase_type, stock_quantity FROM products WHERE id = ? AND is_active = 1',
      [productId]
    );

    if (!Array.isArray(productResult) || productResult.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = productResult[0] as any;

    // Verify this is a direct sale product
    if (product.purchase_type !== 'direct') {
      return NextResponse.json(
        { error: 'This product is not available for direct purchase' },
        { status: 400 }
      );
    }

    // Check stock if applicable
    if (product.stock_quantity !== null && product.stock_quantity < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock available' },
        { status: 400 }
      );
    }

    // Calculate totals
    const unitPrice = parseFloat(product.price);
    const subtotal = unitPrice * quantity;
    const shippingCost = 0; // Free shipping
    const taxAmount = 0; // Can be calculated based on requirements
    const totalAmount = subtotal + shippingCost + taxAmount;

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Handle customer account creation if requested
    let customerId = null;
    if (createAccount && password) {
      // Check if customer already exists
      const existingCustomer = await query(
        'SELECT id FROM customers WHERE email = ?',
        [email]
      );

      if (Array.isArray(existingCustomer) && existingCustomer.length > 0) {
        customerId = (existingCustomer[0] as any).id;
      } else {
        // Create new customer account
        const passwordHash = await bcrypt.hash(password, 10);
        const customerResult = await query(
          `INSERT INTO customers (email, password_hash, first_name, last_name, phone)
           VALUES (?, ?, ?, ?, ?)`,
          [email, passwordHash, firstName, lastName, phone || null]
        );
        customerId = (customerResult as any).insertId;

        // Save shipping address
        await query(
          `INSERT INTO customer_addresses 
           (customer_id, address_type, first_name, last_name, address_line1, address_line2, city, county, postcode, country, phone, is_default)
           VALUES (?, 'shipping', ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [customerId, firstName, lastName, addressLine1, addressLine2 || null, city, county || null, postcode, country, phone || null]
        );
      }
    }

    // Create order in database
    const orderResult = await query(
      `INSERT INTO orders (
        order_number, customer_id, customer_email, customer_first_name, customer_last_name, customer_phone,
        shipping_address_line1, shipping_address_line2, shipping_city, shipping_county, shipping_postcode, shipping_country,
        subtotal, shipping_cost, tax_amount, total_amount, currency,
        payment_status, order_status, customer_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'GBP', 'pending', 'pending', ?)`,
      [
        orderNumber,
        customerId,
        email,
        firstName,
        lastName,
        phone || null,
        addressLine1,
        addressLine2 || null,
        city,
        county || null,
        postcode,
        country,
        subtotal,
        shippingCost,
        taxAmount,
        totalAmount,
        customerNotes || null
      ]
    );

    const orderId = (orderResult as any).insertId;

    // Create order item
    await query(
      `INSERT INTO order_items (order_id, product_id, product_name, product_slug, product_image_url, quantity, unit_price, total_price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId, product.id, product.name, product.slug, product.image_url, quantity, unitPrice, subtotal]
    );

    // Create Stripe Checkout Session
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: product.name,
              images: product.image_url ? [product.image_url] : [],
            },
            unit_amount: Math.round(unitPrice * 100), // Convert to pence
          },
          quantity: quantity,
        },
      ],
      metadata: {
        order_id: orderId.toString(),
        order_number: orderNumber,
        product_id: product.id.toString(),
      },
      success_url: `${baseUrl}/checkout/success?order=${orderNumber}`,
      cancel_url: `${baseUrl}/checkout/${productSlug}?cancelled=true`,
    });

    // Update order with Stripe session ID
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
      { 
        error: 'Failed to process checkout',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
