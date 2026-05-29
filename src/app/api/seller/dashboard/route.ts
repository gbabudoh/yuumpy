import { NextResponse } from 'next/server';
import { getAuthenticatedSeller } from '@/lib/seller-session';
import { query } from '@/lib/database';

export async function GET(request: Request) {
  try {
    const seller = await getAuthenticatedSeller(request);
    if (!seller) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    // Get product count
    const products = await query(
      'SELECT COUNT(*)::int as count FROM products WHERE seller_id = ? AND is_active = TRUE',
      [seller.id]
    ) as { count: number }[];

    // Get order stats
    let totalOrders = 0;
    let pendingOrders = 0;
    let totalSales = 0;
    let commissionPaid = 0;

    try {
      const orderStats = await query(
        `SELECT 
          COUNT(*)::int as total_orders,
          SUM(CASE WHEN order_status IN ('pending', 'confirmed', 'processing')::float THEN 1 ELSE 0 END) as pending_orders,
          COALESCE(SUM(seller_payout_amount)::float, 0) as total_sales,
          COALESCE(SUM(commission_amount)::float, 0) as commission_paid
        FROM orders WHERE seller_id = ?`,
        [seller.id]
      ) as { total_orders: number; pending_orders: number; total_sales: string | number; commission_paid: string | number }[];
      if (orderStats.length > 0) {
        totalOrders = orderStats[0].total_orders || 0;
        pendingOrders = orderStats[0].pending_orders || 0;
        totalSales = Number(orderStats[0].total_sales) || 0;
        commissionPaid = Number(orderStats[0].commission_paid) || 0;
      }
    } catch { /* orders table might not have seller columns yet */ }

    // Get escrow balance
    let escrowBalance = 0;
    try {
      const escrow = await query(
        'SELECT COALESCE(SUM(seller_payout_amount)::float, 0) as balance FROM escrow_transactions WHERE seller_id = ? AND status = ?',
        [seller.id, 'held']
      ) as { balance: string | number }[];
      if (escrow.length > 0) {
        escrowBalance = Number(escrow[0].balance) || 0;
      }
    } catch { /* escrow table might not exist yet */ }

    // Get review stats
    let totalReviews = 0;
    let averageRating = 0;
    try {
      const reviews = await query(
        'SELECT COUNT(*)::int as count, COALESCE(AVG(rating)::float, 0) as avg_rating FROM seller_reviews WHERE seller_id = ?',
        [seller.id]
      ) as { count: number; avg_rating: string | number }[];
      if (reviews.length > 0) {
        totalReviews = reviews[0].count || 0;
        averageRating = Number(reviews[0].avg_rating) || 0;
      }
    } catch { /* reviews table might not exist yet */ }
    
    // Get custom inquiries count
    let pendingInquiries = 0;
    try {
      const inquiries = await query(
        'SELECT COUNT(*)::int as count FROM custom_requests WHERE seller_id = ? AND status = ?',
        [seller.id, 'pending']
      ) as { count: number }[];
      pendingInquiries = inquiries[0]?.count || 0;
    } catch { /* inquiries table might not exist */ }

    return NextResponse.json({
      stats: {
        totalSales,
        totalOrders,
        pendingOrders,
        escrowBalance,
        commissionPaid,
        averageRating,
        totalProducts: products[0]?.count || 0,
        totalReviews,
        pendingInquiries,
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
}
