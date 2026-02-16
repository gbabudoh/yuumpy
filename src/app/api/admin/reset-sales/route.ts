import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // Basic verification could be added here if needed, 
    // but this assumes it's behind the admin auth middleware as per standard patterns in this project.
    
    // Disable foreign key checks to allow truncation if needed, though DELETE is safer with ON DELETE CASCADE
    await query('SET FOREIGN_KEY_CHECKS = 0', []);
    
    // Clear sales-related tables
    await query('TRUNCATE TABLE order_items', []);
    await query('TRUNCATE TABLE orders', []);
    await query('TRUNCATE TABLE payments', []);
    await query('TRUNCATE TABLE analytics', []);
    
    await query('SET FOREIGN_KEY_CHECKS = 1', []);

    return NextResponse.json({ 
      success: true, 
      message: 'All sales data, payments, and analytics have been cleared.' 
    });
  } catch (error) {
    console.error('Error resetting sales data:', error);
    return NextResponse.json(
      { error: 'Failed to reset sales data' },
      { status: 500 }
    );
  }
}
