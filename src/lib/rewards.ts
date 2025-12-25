import { query } from '@/lib/database';
import { createRewardNotification } from './notifications';

/**
 * Award points to a customer for a completed order
 * @param customerId - The customer ID
 * @param orderId - The order ID
 * @param orderNumber - The order number
 * @param totalAmount - The total amount of the order
 */
export async function awardPointsForOrder(
  customerId: number,
  orderId: number,
  orderNumber: string,
  totalAmount: number
): Promise<void> {
  try {
    // Calculate points (1 point per £1 spent, rounded down)
    const pointsEarned = Math.floor(Number(totalAmount));

    if (pointsEarned <= 0) {
      return; // No points to award
    }

    // Check if points already awarded for this order
    const existing = await query(
      `SELECT id FROM rewards_history WHERE order_id = ? AND transaction_type = 'earned'`,
      [orderId]
    ) as any[];

    if (Array.isArray(existing) && existing.length > 0) {
      console.log(`Points already awarded for order ${orderNumber}`);
      return; // Points already awarded
    }

    // Get or create rewards record
    let rewards = await query(
      `SELECT * FROM customer_rewards WHERE customer_id = ?`,
      [customerId]
    ) as any[];

    if (!Array.isArray(rewards) || rewards.length === 0) {
      // Create rewards record if it doesn't exist
      await query(
        `INSERT INTO customer_rewards (customer_id, points_balance, lifetime_points_earned) 
         VALUES (?, ?, ?)`,
        [customerId, pointsEarned, pointsEarned]
      );
    } else {
      // Update rewards balance
      await query(
        `UPDATE customer_rewards 
         SET points_balance = points_balance + ?, 
             lifetime_points_earned = lifetime_points_earned + ?,
             updated_at = NOW()
         WHERE customer_id = ?`,
        [pointsEarned, pointsEarned, customerId]
      );
    }

    // Add to history
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // Points expire after 1 year

    await query(
      `INSERT INTO rewards_history 
       (customer_id, points, transaction_type, description, order_id, order_number, expires_at) 
       VALUES (?, ?, 'earned', ?, ?, ?, ?)`,
      [
        customerId,
        pointsEarned,
        `Earned ${pointsEarned} points from order #${orderNumber}`,
        orderId,
        orderNumber,
        expiresAt
      ]
    );

    console.log(`Awarded ${pointsEarned} points to customer ${customerId} for order ${orderNumber}`);

    // Create notification for points earned
    createRewardNotification(customerId, pointsEarned, orderNumber).catch(err =>
      console.error('Failed to create reward notification:', err)
    );
  } catch (error) {
    console.error('Error awarding points for order:', error);
    // Don't throw - we don't want to fail the order if points fail
  }
}

