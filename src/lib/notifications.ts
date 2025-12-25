import { query } from '@/lib/database';

interface CreateNotificationParams {
  customerId: number;
  type: 'order' | 'reward' | 'promotion' | 'system' | 'shipping';
  title: string;
  message: string;
  linkUrl?: string;
  orderId?: number;
  orderNumber?: string;
}

/**
 * Create a notification for a customer
 */
export async function createNotification(params: CreateNotificationParams): Promise<void> {
  try {
    await query(
      `INSERT INTO customer_notifications 
       (customer_id, type, title, message, link_url, order_id, order_number) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        params.customerId,
        params.type,
        params.title,
        params.message,
        params.linkUrl || null,
        params.orderId || null,
        params.orderNumber || null
      ]
    );
  } catch (error) {
    console.error('Error creating notification:', error);
    // Don't throw - we don't want to fail the main operation if notification fails
  }
}

/**
 * Create order status notification
 */
export async function createOrderNotification(
  customerId: number,
  orderId: number,
  orderNumber: string,
  status: string,
  message?: string
): Promise<void> {
  const statusMessages: Record<string, { title: string; message: string }> = {
    confirmed: {
      title: 'Order Confirmed',
      message: `Your order #${orderNumber} has been confirmed and is being processed.`
    },
    processing: {
      title: 'Order Processing',
      message: `Your order #${orderNumber} is now being processed.`
    },
    shipped: {
      title: 'Order Shipped',
      message: `Your order #${orderNumber} has been shipped!`
    },
    delivered: {
      title: 'Order Delivered',
      message: `Your order #${orderNumber} has been delivered.`
    },
    cancelled: {
      title: 'Order Cancelled',
      message: `Your order #${orderNumber} has been cancelled.`
    }
  };

  const notification = statusMessages[status] || {
    title: 'Order Update',
    message: message || `Your order #${orderNumber} status has been updated to ${status}.`
  };

  await createNotification({
    customerId,
    type: status === 'shipped' || status === 'delivered' ? 'shipping' : 'order',
    title: notification.title,
    message: notification.message,
    linkUrl: `/account/orders/${orderNumber}`,
    orderId,
    orderNumber
  });
}

/**
 * Create reward points notification
 */
export async function createRewardNotification(
  customerId: number,
  points: number,
  orderNumber?: string
): Promise<void> {
  await createNotification({
    customerId,
    type: 'reward',
    title: 'Points Earned!',
    message: `You've earned ${points} reward points${orderNumber ? ` from order #${orderNumber}` : ''}!`,
    linkUrl: '/account/rewards',
    orderNumber
  });
}

