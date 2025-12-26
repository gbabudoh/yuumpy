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

export async function sendOrderDeliveredEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string
): Promise<boolean> {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Your Order Has Been Delivered!</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Order Delivered! ✅</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 16px;">Hi <strong>${customerName}</strong>,</p>
          <p>Great news! Your order <strong>${orderNumber}</strong> has been successfully delivered.</p>
          
          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p style="margin: 0; color: #065f46; font-size: 16px;">
              🎉 We hope you love your purchase! If you have any questions or need assistance, we're here to help.
            </p>
          </div>
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://yuumpy.com'}/account/orders/${orderNumber}" 
               style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-right: 10px;">
              View Order Details
            </a>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://yuumpy.com'}" 
               style="display: inline-block; background: #f3f4f6; color: #374151; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Shop Again
            </a>
          </div>
          
          <div style="margin-top: 30px; padding: 15px; background: #f9fafb; border-radius: 8px;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              💡 <strong>Tip:</strong> Leave a review to help other customers make informed decisions!
            </p>
          </div>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Questions? Contact us at <a href="mailto:support@yuumpy.com" style="color: #10b981;">support@yuumpy.com</a>
          </p>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Yuumpy" <${process.env.SMTP_FROM || 'orders@yuumpy.com'}>`,
      to: customerEmail,
      subject: `Your Order ${orderNumber} Has Been Delivered! ✅`,
      html,
    });

    console.log(`Order delivered email sent to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending order delivered email:', error);
    return false;
  }
}

export async function sendOrderCancelledEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  refundAmount?: number,
  reason?: string
): Promise<boolean> {
  try {
    const refundInfo = refundAmount 
      ? `
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e; font-size: 14px; margin-bottom: 8px;"><strong>Refund Information:</strong></p>
            <p style="margin: 0; color: #78350f; font-size: 18px; font-weight: bold;">£${Number(refundAmount).toFixed(2)} will be refunded to your original payment method.</p>
            <p style="margin: 8px 0 0 0; color: #92400e; font-size: 12px;">Refunds typically take 5-10 business days to appear in your account.</p>
          </div>
        `
      : '';

    const reasonInfo = reason 
      ? `
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;"><strong>Reason:</strong> ${reason}</p>
          </div>
        `
      : '';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Cancelled</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Order Cancelled</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 16px;">Hi <strong>${customerName}</strong>,</p>
          <p>We're sorry to inform you that your order <strong>${orderNumber}</strong> has been cancelled.</p>
          
          ${reasonInfo}
          ${refundInfo}
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://yuumpy.com'}/account/orders/${orderNumber}" 
               style="display: inline-block; background: #ef4444; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-right: 10px;">
              View Order Details
            </a>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://yuumpy.com'}" 
               style="display: inline-block; background: #f3f4f6; color: #374151; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Continue Shopping
            </a>
          </div>
          
          <div style="margin-top: 30px; padding: 15px; background: #f9fafb; border-radius: 8px;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              If you have any questions about this cancellation, please don't hesitate to contact us.
            </p>
          </div>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Questions? Contact us at <a href="mailto:support@yuumpy.com" style="color: #ef4444;">support@yuumpy.com</a>
          </p>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Yuumpy" <${process.env.SMTP_FROM || 'orders@yuumpy.com'}>`,
      to: customerEmail,
      subject: `Order ${orderNumber} Has Been Cancelled`,
      html,
    });

    console.log(`Order cancelled email sent to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending order cancelled email:', error);
    return false;
  }
}

interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  contactType: string;
  message: string;
  submittedAt: string;
}

export async function sendContactFormNotificationEmail(
  contactData: ContactFormData,
  recipientEmail: string
): Promise<boolean> {
  try {
    const isCustomerSupport = contactData.contactType === 'customer-support';
    const contactTypeLabel = isCustomerSupport 
      ? 'Customer Support' 
      : contactData.contactType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    const subject = isCustomerSupport
      ? `New Customer Support Inquiry - ${contactData.name}`
      : `New Advertising Inquiry - ${contactTypeLabel}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #9333ea 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">New ${contactTypeLabel} Inquiry</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 16px;">You have received a new ${isCustomerSupport ? 'customer support' : 'advertising'} inquiry:</p>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #111827; border-bottom: 2px solid #9333ea; padding-bottom: 10px;">Contact Information</h3>
            <p style="margin: 8px 0;"><strong>Name:</strong> ${contactData.name}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${contactData.email}" style="color: #9333ea; text-decoration: none;">${contactData.email}</a></p>
            ${contactData.phone ? `<p style="margin: 8px 0;"><strong>Phone:</strong> <a href="tel:${contactData.phone}" style="color: #9333ea; text-decoration: none;">${contactData.phone}</a></p>` : ''}
            ${contactData.company ? `<p style="margin: 8px 0;"><strong>Company:</strong> ${contactData.company}</p>` : ''}
            <p style="margin: 8px 0;"><strong>Contact Type:</strong> ${contactTypeLabel}</p>
            <p style="margin: 8px 0;"><strong>Submitted:</strong> ${new Date(contactData.submittedAt).toLocaleString()}</p>
          </div>

          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #111827; border-bottom: 2px solid #9333ea; padding-bottom: 10px;">Message</h3>
            <p style="margin: 0; white-space: pre-wrap; color: #374151;">${contactData.message}</p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <a href="mailto:${contactData.email}" style="display: inline-block; background: #9333ea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Reply to ${contactData.name}
            </a>
          </div>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            This email was sent from the Yuumpy contact form.
          </p>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Yuumpy Contact Form" <${process.env.SMTP_FROM || 'orders@yuumpy.com'}>`,
      to: recipientEmail,
      replyTo: contactData.email,
      subject: subject,
      html,
    });

    console.log(`Contact form notification email sent to ${recipientEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending contact form notification email:', error);
    return false;
  }
}

export async function sendContactFormConfirmationEmail(
  userEmail: string,
  userName: string,
  contactType: string
): Promise<boolean> {
  try {
    const isCustomerSupport = contactType === 'customer-support';
    const contactTypeLabel = isCustomerSupport 
      ? 'Customer Support' 
      : contactType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    const subject = isCustomerSupport 
      ? 'Thank you for contacting Yuumpy Support - We\'ll get back to you soon!'
      : 'Thank you for your advertising inquiry - Yuumpy';
    
    const supportEmail = isCustomerSupport 
      ? 'orders@yuumpy.com' 
      : (process.env.ADMIN_EMAIL || 'admin@yuumpy.com');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank You for Contacting Us</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #16a34a 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Thank You! 🙏</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">We've received your ${isCustomerSupport ? 'support' : 'advertising'} inquiry</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 16px;">Hi <strong>${userName}</strong>,</p>
          <p>Thank you for contacting Yuumpy! We've received your ${contactTypeLabel.toLowerCase()} inquiry and our team will review it shortly.</p>
          
          ${isCustomerSupport ? `
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>📧 Support Email:</strong> <a href="mailto:${supportEmail}" style="color: #d97706; text-decoration: none;">${supportEmail}</a>
            </p>
          </div>
          ` : ''}

          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #111827;">What happens next?</h3>
            <ul style="margin: 0; padding-left: 20px; color: #374151;">
              <li>Our team will review your inquiry</li>
              <li>We'll get back to you within 24-48 hours</li>
              <li>Check your email (including spam folder) for our response</li>
            </ul>
          </div>

          <p style="margin-top: 30px;">If you have any urgent questions, please don't hesitate to reach out to us directly.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Best regards,<br>
              <strong>The Yuumpy Team</strong>
            </p>
          </div>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            This is an automated confirmation email. Please do not reply to this message.
          </p>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Yuumpy" <${process.env.SMTP_FROM || 'orders@yuumpy.com'}>`,
      to: userEmail,
      subject: subject,
      html,
    });

    console.log(`Contact form confirmation email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending contact form confirmation email:', error);
    return false;
  }
}

// Contact form email functions
export async function sendContactAdminNotification(contactData: {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  adType: string;
  message: string;
}): Promise<boolean> {
  try {
    const isCustomerSupport = contactData.adType === 'customer-support';
    const recipientEmail = isCustomerSupport ? 'orders@yuumpy.com' : (process.env.ADMIN_EMAIL || 'admin@yuumpy.com');
    const subject = isCustomerSupport
      ? `New Customer Support Inquiry - ${contactData.name}`
      : `New Advertising Inquiry - ${contactData.adType.replace('-', ' ')}`;

    const html = `
      <h2>${isCustomerSupport ? 'Customer Support Inquiry' : 'Advertising Inquiry'}</h2>
      <p><strong>From:</strong> ${contactData.name}</p>
      <p><strong>Email:</strong> ${contactData.email}</p>
      ${contactData.company ? `<p><strong>Company:</strong> ${contactData.company}</p>` : ''}
      ${contactData.phone ? `<p><strong>Phone:</strong> ${contactData.phone}</p>` : ''}
      <p><strong>Type:</strong> ${contactData.adType}</p>
      <p><strong>Message:</strong></p>
      <p>${contactData.message}</p>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'orders@yuumpy.com',
      to: recipientEmail,
      subject,
      html,
    });

    console.log(`Admin notification sent to ${recipientEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return false;
  }
}

export async function sendContactUserConfirmation(
  userEmail: string,
  userName: string,
  adType: string
): Promise<boolean> {
  try {
    const isCustomerSupport = adType === 'customer-support';
    const subject = isCustomerSupport
      ? 'Thank you for contacting Yuumpy Support'
      : 'Thank you for your advertising inquiry';

    const html = `
      <h2>Thank you for contacting us!</h2>
      <p>Hi ${userName},</p>
      <p>We've received your ${isCustomerSupport ? 'support request' : 'advertising inquiry'} and will get back to you shortly.</p>
      <p>Best regards,<br>The Yuumpy Team</p>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'orders@yuumpy.com',
      to: userEmail,
      subject,
      html,
    });

    console.log('User confirmation sent');
    return true;
  } catch (error) {
    console.error('Error sending user confirmation:', error);
    return false;
  }
}
