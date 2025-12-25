import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST() {
  try {
    const migrations: string[] = [];

    // Create customer_notifications table
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS customer_notifications (
          id INT PRIMARY KEY AUTO_INCREMENT,
          customer_id INT NOT NULL,
          type ENUM('order', 'reward', 'promotion', 'system', 'shipping') DEFAULT 'system',
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          link_url VARCHAR(500) NULL,
          is_read BOOLEAN DEFAULT FALSE,
          order_id INT NULL,
          order_number VARCHAR(50) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
        )
      `);
      migrations.push('Created customer_notifications table');
    } catch (e: any) {
      if (e.code === 'ER_TABLE_EXISTS_ERROR') {
        migrations.push('Customer notifications table already exists');
      } else {
        throw e;
      }
    }

    // Create indexes
    try {
      await query(`CREATE INDEX IF NOT EXISTS idx_notifications_customer_id ON customer_notifications(customer_id)`);
      migrations.push('Created index on customer_id');
    } catch (e: any) {
      migrations.push('Index on customer_id may already exist');
    }

    try {
      await query(`CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON customer_notifications(is_read)`);
      migrations.push('Created index on is_read');
    } catch (e: any) {
      migrations.push('Index on is_read may already exist');
    }

    try {
      await query(`CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON customer_notifications(created_at)`);
      migrations.push('Created index on created_at');
    } catch (e: any) {
      migrations.push('Index on created_at may already exist');
    }

    try {
      await query(`CREATE INDEX IF NOT EXISTS idx_notifications_order_id ON customer_notifications(order_id)`);
      migrations.push('Created index on order_id');
    } catch (e: any) {
      migrations.push('Index on order_id may already exist');
    }

    return NextResponse.json({
      success: true,
      message: 'Notifications migration completed',
      migrations
    });
  } catch (error: any) {
    console.error('Notifications migration error:', error);
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

