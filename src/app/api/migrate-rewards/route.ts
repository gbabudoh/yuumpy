import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST() {
  try {
    const migrations: string[] = [];

    // Create customer_rewards table
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS customer_rewards (
          id INT PRIMARY KEY AUTO_INCREMENT,
          customer_id INT NOT NULL UNIQUE,
          points_balance INT DEFAULT 0,
          lifetime_points_earned INT DEFAULT 0,
          lifetime_points_redeemed INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
        )
      `);
      migrations.push('Created customer_rewards table');
    } catch (e: any) {
      if (e.code === 'ER_TABLE_EXISTS_ERROR') {
        migrations.push('Customer rewards table already exists');
      } else {
        throw e;
      }
    }

    // Create rewards_history table
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS rewards_history (
          id INT PRIMARY KEY AUTO_INCREMENT,
          customer_id INT NOT NULL,
          points INT NOT NULL,
          transaction_type ENUM('earned', 'redeemed', 'expired', 'adjusted') DEFAULT 'earned',
          description VARCHAR(500),
          order_id INT NULL,
          order_number VARCHAR(50) NULL,
          expires_at DATE NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
        )
      `);
      migrations.push('Created rewards_history table');
    } catch (e: any) {
      if (e.code === 'ER_TABLE_EXISTS_ERROR') {
        migrations.push('Rewards history table already exists');
      } else {
        throw e;
      }
    }

    // Create indexes
    try {
      await query(`CREATE INDEX IF NOT EXISTS idx_rewards_history_customer_id ON rewards_history(customer_id)`);
      migrations.push('Created index on customer_id');
    } catch (e: any) {
      migrations.push('Index on customer_id may already exist');
    }

    try {
      await query(`CREATE INDEX IF NOT EXISTS idx_rewards_history_created_at ON rewards_history(created_at)`);
      migrations.push('Created index on created_at');
    } catch (e: any) {
      migrations.push('Index on created_at may already exist');
    }

    try {
      await query(`CREATE INDEX IF NOT EXISTS idx_rewards_history_order_id ON rewards_history(order_id)`);
      migrations.push('Created index on order_id');
    } catch (e: any) {
      migrations.push('Index on order_id may already exist');
    }

    return NextResponse.json({
      success: true,
      message: 'Rewards migration completed',
      migrations
    });
  } catch (error: any) {
    console.error('Rewards migration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Migration failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}

