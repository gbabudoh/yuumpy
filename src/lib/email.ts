import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587 (STARTTLS)
  requireTLS: process.env.SMTP_PORT === '587', // Require TLS upgrade for port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    // Do not fail on invalid certificates (useful for self-signed certs)
    rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false',
  },
});

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_image_url?: string;
}

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    county?: string;
    postcode: string;
    country: string;
  };
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<boolean> {
  try {
    const itemsHtml = data.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <strong>${item.product_name}</strong>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">£${Number(item.unit_price).toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">£${Number(item.total_price).toFixed(2)}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #16a34a 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Order Confirmed! 🎉</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Thank you for your purchase</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 16px;">Hi <strong>${data.customerName}</strong>,</p>
          <p>Your order has been confirmed and is being processed. Here are your order details:</p>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">Order Number</p>
            <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #16a34a;">${data.orderNumber}</p>
          </div>
          
          <h3 style="border-bottom: 2px solid #16a34a; padding-bottom: 10px; color: #111827;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="padding: 12px; text-align: left; font-weight: 600;">Product</th>
                <th style="padding: 12px; text-align: center; font-weight: 600;">Qty</th>
                <th style="padding: 12px; text-align: right; font-weight: 600;">Price</th>
                <th style="padding: 12px; text-align: right; font-weight: 600;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Subtotal:</span>
              <span>£${Number(data.subtotal).toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Shipping:</span>
              <span>${data.shippingCost === 0 ? 'Free' : '£' + Number(data.shippingCost).toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; border-top: 2px solid #e5e7eb; padding-top: 12px; margin-top: 12px;">
              <span>Total:</span>
              <span style="color: #16a34a;">£${Number(data.totalAmount).toFixed(2)}</span>
            </div>
          </div>
          
          <h3 style="border-bottom: 2px solid #16a34a; padding-bottom: 10px; color: #111827; margin-top: 30px;">Shipping Address</h3>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
            <p style="margin: 0;">${data.shippingAddress.line1}</p>
            ${data.shippingAddress.line2 ? `<p style="margin: 5px 0 0 0;">${data.shippingAddress.line2}</p>` : ''}
            <p style="margin: 5px 0 0 0;">${data.shippingAddress.city}${data.shippingAddress.county ? ', ' + data.shippingAddress.county : ''}</p>
            <p style="margin: 5px 0 0 0;">${data.shippingAddress.postcode}</p>
            <p style="margin: 5px 0 0 0;">${data.shippingAddress.country}</p>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background: #ecfdf5; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #065f46;">📦 We'll send you another email when your order ships!</p>
          </div>
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://yuumpy.com'}/account/orders" 
               style="display: inline-block; background: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Track Your Order
            </a>
          </div>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Questions? Contact us at <a href="mailto:support@yuumpy.com" style="color: #16a34a;">support@yuumpy.com</a>
          </p>
          <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
            © ${new Date().getFullYear()} Yuumpy. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Yuumpy" <${process.env.SMTP_FROM || 'orders@yuumpy.com'}>`,
      to: data.customerEmail,
      subject: `Order Confirmed - ${data.orderNumber}`,
      html,
    });

    console.log(`Order confirmation email sent to ${data.customerEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
}

export async function sendNewOrderNotificationEmail(data: OrderEmailData): Promise<boolean> {
  try {
    const itemsHtml = data.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.product_name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">£${Number(item.total_price).toFixed(2)}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Order Received</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1f2937; padding: 25px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🛒 New Order Received!</h1>
        </div>
        
        <div style="background: #ffffff; padding: 25px; border: 1px solid #e5e7eb; border-top: none;">
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
            <strong style="color: #92400e;">Action Required:</strong>
            <span style="color: #78350f;"> Process this order</span>
          </div>
          
          <table style="width: 100%; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0;"><strong>Order Number:</strong></td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #16a34a;">${data.orderNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Customer:</strong></td>
              <td style="padding: 8px 0; text-align: right;">${data.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Email:</strong></td>
              <td style="padding: 8px 0; text-align: right;"><a href="mailto:${data.customerEmail}">${data.customerEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Total:</strong></td>
              <td style="padding: 8px 0; text-align: right; font-size: 20px; font-weight: bold; color: #16a34a;">£${Number(data.totalAmount).toFixed(2)}</td>
            </tr>
          </table>
          
          <h3 style="border-bottom: 2px solid #1f2937; padding-bottom: 10px;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <h3 style="border-bottom: 2px solid #1f2937; padding-bottom: 10px;">Shipping Address</h3>
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
            <p style="margin: 0;"><strong>${data.customerName}</strong></p>
            <p style="margin: 5px 0 0 0;">${data.shippingAddress.line1}</p>
            ${data.shippingAddress.line2 ? `<p style="margin: 5px 0 0 0;">${data.shippingAddress.line2}</p>` : ''}
            <p style="margin: 5px 0 0 0;">${data.shippingAddress.city}${data.shippingAddress.county ? ', ' + data.shippingAddress.county : ''}</p>
            <p style="margin: 5px 0 0 0;">${data.shippingAddress.postcode}</p>
            <p style="margin: 5px 0 0 0;">${data.shippingAddress.country}</p>
          </div>
          
          <div style="margin-top: 25px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://yuumpy.com'}/admin/orders" 
               style="display: inline-block; background: #1f2937; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
              View in Admin Panel
            </a>
          </div>
        </div>
        
        <div style="background: #f9fafb; padding: 15px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="margin: 0; color: #6b7280; font-size: 12px;">
            This is an automated notification from Yuumpy
          </p>
        </div>
      </body>
      </html>
    `;

    // Send to multiple admin emails (comma-separated in env or defaults)
    const adminEmails = process.env.ADMIN_ORDER_EMAILS || 'orders@yuumpy.com,payments@egobas.com';
    
    await transporter.sendMail({
      from: `"Yuumpy Orders" <${process.env.SMTP_FROM || 'orders@yuumpy.com'}>`,
      to: adminEmails,
      subject: `🛒 New Order: ${data.orderNumber} - £${Number(data.totalAmount).toFixed(2)}`,
      html,
    });

    console.log(`New order notification sent to ${adminEmails}`);
    return true;
  } catch (error) {
    console.error('Error sending new order notification:', error);
    return false;
  }
}

export async function sendOrderShippedEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  trackingNumber: string,
  trackingUrl?: string
): Promise<boolean> {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Your Order Has Shipped!</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Your Order Has Shipped! 🚚</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 16px;">Hi <strong>${customerName}</strong>,</p>
          <p>Great news! Your order <strong>${orderNumber}</strong> is on its way to you.</p>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">Tracking Number</p>
            <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; font-family: monospace; color: #4f46e5;">${trackingNumber}</p>
          </div>
          
          ${trackingUrl ? `
          <div style="text-align: center; margin: 25px 0;">
            <a href="${trackingUrl}" 
               style="display: inline-block; background: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Track Your Package
            </a>
          </div>
          ` : ''}
          
          <div style="margin-top: 20px; padding: 15px; background: #eff6ff; border-radius: 8px;">
            <p style="margin: 0; color: #1e40af; font-size: 14px;">
              📍 You can also track your order in your <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://yuumpy.com'}/account/orders" style="color: #4f46e5;">account dashboard</a>.
            </p>
          </div>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Questions? Contact us at <a href="mailto:support@yuumpy.com" style="color: #4f46e5;">support@yuumpy.com</a>
          </p>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Yuumpy" <${process.env.SMTP_FROM || 'orders@yuumpy.com'}>`,
      to: customerEmail,
      subject: `Your Order ${orderNumber} Has Shipped! 🚚`,
      html,
    });

    console.log(`Order shipped email sent to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending order shipped email:', error);
    return false;
  }
}
