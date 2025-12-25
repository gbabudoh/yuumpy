import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper function to get customer ID from token
function getCustomerId(request: NextRequest): number | null {
  try {
    const token = request.cookies.get('customer_token')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.customerId || null;
  } catch (error) {
    return null;
  }
}

// GET - Get rewards balance and history
export async function GET(request: NextRequest) {
  try {
    const customerId = getCustomerId(request);
    
    if (!customerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get or create rewards record
    let rewards = await query(
      `SELECT * FROM customer_rewards WHERE customer_id = ?`,
      [customerId]
    ) as any[];

    if (!Array.isArray(rewards) || rewards.length === 0) {
      // Create rewards record if it doesn't exist
      await query(
        `INSERT INTO customer_rewards (customer_id, points_balance, lifetime_points_earned, lifetime_points_redeemed) 
         VALUES (?, 0, 0, 0)`,
        [customerId]
      );
      rewards = await query(
        `SELECT * FROM customer_rewards WHERE customer_id = ?`,
        [customerId]
      ) as any[];
    }

    const rewardsData = rewards[0] as any;

    // Get rewards history
    const history = await query(
      `SELECT * FROM rewards_history 
       WHERE customer_id = ? 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [customerId]
    ) as any[];

    return NextResponse.json({
      success: true,
      rewards: {
        pointsBalance: rewardsData.points_balance || 0,
        lifetimeEarned: rewardsData.lifetime_points_earned || 0,
        lifetimeRedeemed: rewardsData.lifetime_points_redeemed || 0
      },
      history: Array.isArray(history) ? history : []
    });
  } catch (error: any) {
    console.error('Error fetching rewards:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Award points for an order (called after order completion)
export async function POST(request: NextRequest) {
  try {
    const customerId = getCustomerId(request);
    
    if (!customerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { order_id, order_number, total_amount } = body;

    if (!order_id || !order_number || !total_amount) {
      return NextResponse.json(
        { error: 'Order ID, order number, and total amount are required' },
        { status: 400 }
      );
    }

    // Calculate points (1 point per £1 spent, rounded down)
    const pointsEarned = Math.floor(Number(total_amount));

    // Check if points already awarded for this order
    const existing = await query(
      `SELECT id FROM rewards_history WHERE order_id = ? AND transaction_type = 'earned'`,
      [order_id]
    ) as any[];

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json(
        { error: 'Points already awarded for this order', success: true },
        { status: 200 }
      );
    }

    // Get or create rewards record
    let rewards = await query(
      `SELECT * FROM customer_rewards WHERE customer_id = ?`,
      [customerId]
    ) as any[];

    if (!Array.isArray(rewards) || rewards.length === 0) {
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
        `Earned ${pointsEarned} points from order #${order_number}`,
        order_id,
        order_number,
        expiresAt
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Points awarded successfully',
      pointsEarned
    });
  } catch (error: any) {
    console.error('Error awarding points:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

