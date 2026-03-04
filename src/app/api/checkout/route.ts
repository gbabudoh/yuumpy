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
  seller_id: number | null;
}

interface DBSeller {
  id: number;
  stripe_connect_id: string | null;
  stripe_onboarding_complete: boolean;
  commission_rate: string | number;
  store_name: string;
}

interface DBInsertResult {
  insertId: number;
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `YMP-${timestamp}-${random}`;
}

function getCustomerIdFromToken(request: NextRequest): number | null {
  try {
    const token = request.cookies.get('customer_token')?.value;
    if (!token) return null;
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
      items,
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
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    // Fetch all products with seller info
    const productIds = cartItems.map(item => item.id);
    const placeholders = productIds.map(() => '?').join(',');
    const productResults = await query(
      `SELECT p.id, p.name, p.slug, p.price, p.image_url, p.purchase_type, 
              p.stock_quantity, p.seller_id
       FROM products p
       WHERE p.id IN (${placeholders}) AND p.is_active = 1`,
      productIds
    ) as DBProduct[];

    if (!Array.isArray(productResults) || productResults.length === 0) {
      return NextResponse.json({ error: 'Products not found' }, { status: 404 });
    }

    // Verify items and build verified list
    const dbProducts = new Map<number, DBProduct>(productResults.map(p => [p.id, p]));
    const verifiedItems: Array<DBProduct & { quantity: number; unitPrice: number; totalPrice: number }> = [];
    let grandTotal = 0;

    for (const item of cartItems) {
      const dbProduct = dbProducts.get(item.id);
      if (!dbProduct) {
        return NextResponse.json({ error: `Product ID ${item.id} not found or inactive` }, { status: 404 });
      }
      if (dbProduct.purchase_type !== 'direct') {
        return NextResponse.json({ error: `Product "${dbProduct.name}" is not available for direct purchase` }, { status: 400 });
      }
      const q = parseInt(item.quantity.toString()) || 1;
      if (dbProduct.stock_quantity !== null && dbProduct.stock_quantity < q) {
        return NextResponse.json({ error: `Insufficient stock for "${dbProduct.name}"` }, { status: 400 });
      }
      const unitPrice = typeof dbProduct.price === 'string' ? parseFloat(dbProduct.price) : dbProduct.price;
      const itemTotal = unitPrice * q;
      grandTotal += itemTotal;
      verifiedItems.push({ ...dbProduct, quantity: q, unitPrice, totalPrice: itemTotal });
    }

    // Group items by seller_id (null = platform/Yuumpy direct)
    const sellerGroups = new Map<number | null, typeof verifiedItems>();
    for (const item of verifiedItems) {
      const sid = item.seller_id ?? null;
      if (!sellerGroups.has(sid)) sellerGroups.set(sid, []);
      sellerGroups.get(sid)!.push(item);
    }

    // Fetch seller info for all sellers in this order
    const sellerIds = [...sellerGroups.keys()].filter((id): id is number => id !== null);
    const sellers = new Map<number, DBSeller>();
    if (sellerIds.length > 0) {
      const sellerPlaceholders = sellerIds.map(() => '?').join(',');
      const sellerResults = await query(
        `SELECT id, stripe_connect_id, stripe_onboarding_complete, commission_rate, store_name
         FROM sellers WHERE id IN (${sellerPlaceholders})`,
        sellerIds
      ) as DBSeller[];
      for (const s of sellerResults) sellers.set(s.id, s);
    }

    // Handle customer account
    let customerId: number | null = getCustomerIdFromToken(request);
    if (!customerId && createAccount && password) {
      const existingCustomer = await query(
        'SELECT id FROM customers WHERE email = ?', [email]
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

    // Create one order per seller group
    const orderIds: number[] = [];
    const orderNumbers: string[] = [];
    const lineItemsForStripe: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    // Track transfer data for Stripe Connect (used in webhook after payment)
    const transferData: Array<{
      order_id: number;
      seller_id: number;
      stripe_connect_id: string;
      payout_amount: number;
    }> = [];

    for (const [sellerId, groupItems] of sellerGroups) {
      const subtotal = groupItems.reduce((sum, i) => sum + i.totalPrice, 0);
      const shippingCost = 0;
      const taxAmount = 0;
      const totalAmount = subtotal + shippingCost + taxAmount;
      const orderNumber = generateOrderNumber();

      let commissionRate = 0;
      let commissionAmount = 0;
      let sellerPayoutAmount = 0;

      if (sellerId !== null) {
        const seller = sellers.get(sellerId);
        commissionRate = seller ? (typeof seller.commission_rate === 'string' ? parseFloat(seller.commission_rate) : seller.commission_rate) : 12;
        commissionAmount = Math.round(totalAmount * commissionRate) / 100;
        sellerPayoutAmount = totalAmount - commissionAmount;
      }

      const orderResult = await query(
        `INSERT INTO orders (
          order_number, customer_id, customer_email, customer_first_name, customer_last_name, customer_phone,
          shipping_address_line1, shipping_address_line2, shipping_city, shipping_county, shipping_postcode, shipping_country,
          subtotal, shipping_cost, tax_amount, total_amount, currency,
          payment_status, order_status, customer_notes,
          seller_id, commission_amount, seller_payout_amount, escrow_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'GBP', 'pending', 'pending', ?, ?, ?, ?, ?)`,
        [
          orderNumber, customerId, email, firstName, lastName, phone || null,
          addressLine1, addressLine2 || null, city, county || null, postcode, country,
          subtotal, shippingCost, taxAmount, totalAmount, customerNotes || null,
          sellerId, commissionAmount, sellerPayoutAmount,
          sellerId !== null ? 'held' : null
        ]
      ) as DBInsertResult;

      const orderId = orderResult.insertId;
      orderIds.push(orderId);
      orderNumbers.push(orderNumber);

      // Create order items
      for (const item of groupItems) {
        await query(
          `INSERT INTO order_items (order_id, product_id, product_name, product_slug, product_image_url, quantity, unit_price, total_price, seller_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [orderId, item.id, item.name, item.slug, item.image_url, item.quantity, item.unitPrice, item.totalPrice, sellerId]
        );
      }

      // Track Stripe Connect transfer info for sellers with connected accounts
      if (sellerId !== null) {
        const seller = sellers.get(sellerId);
        if (seller?.stripe_connect_id && seller.stripe_onboarding_complete) {
          transferData.push({
            order_id: orderId,
            seller_id: sellerId,
            stripe_connect_id: seller.stripe_connect_id,
            payout_amount: sellerPayoutAmount,
          });
        }
      }

      // Build Stripe line items (prefix with seller store name if multi-seller)
      const sellerLabel = sellerId !== null ? (sellers.get(sellerId)?.store_name || 'Seller') : 'Yuumpy';
      for (const item of groupItems) {
        lineItemsForStripe.push({
          price_data: {
            currency: 'gbp',
            product_data: {
              name: sellerGroups.size > 1 ? `[${sellerLabel}] ${item.name}` : item.name,
              images: item.image_url ? [item.image_url] : [],
            },
            unit_amount: Math.round(item.unitPrice * 100),
          },
          quantity: item.quantity,
        });
      }
    }

    // Create single Stripe Checkout session for the entire cart
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: lineItemsForStripe,
      metadata: {
        order_ids: JSON.stringify(orderIds),
        order_numbers: JSON.stringify(orderNumbers),
        transfer_data: JSON.stringify(transferData),
        // Keep backward compat for single-order
        order_id: orderIds[0]?.toString(),
        order_number: orderNumbers[0],
      },
      success_url: `${baseUrl}/checkout/success?order=${orderNumbers[0]}`,
      cancel_url: productId
        ? `${baseUrl}/checkout/${productSlug}?cancelled=true`
        : `${baseUrl}/cart?cancelled=true`,
    });

    // Store session ID on all orders
    for (const oid of orderIds) {
      await query('UPDATE orders SET stripe_payment_intent_id = ? WHERE id = ?', [session.id, oid]);
    }

    return NextResponse.json({
      success: true,
      orderIds,
      orderNumbers,
      orderCount: orderIds.length,
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to process checkout', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
