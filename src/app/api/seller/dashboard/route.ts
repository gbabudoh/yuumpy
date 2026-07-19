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

    // query() already returns [] transparently when a table doesn't exist yet
    // (pre-migration) without throwing — anything that reaches here is a
    // genuine error, so let it bubble to the outer catch instead of quietly
    // reporting zeroed-out sales figures to the seller.

    // Get order stats
    let totalOrders = 0;
    let pendingOrders = 0;
    let totalSales = 0;
    let commissionPaid = 0;

    const orderStats = await query(
      `SELECT
        COUNT(*)::int as total_orders,
        SUM(CASE WHEN order_status IN ('pending', 'confirmed', 'processing') THEN 1 ELSE 0 END)::float as pending_orders,
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

    // Get escrow balance
    let escrowBalance = 0;
    const escrow = await query(
      'SELECT COALESCE(SUM(seller_payout_amount)::float, 0) as balance FROM escrow_transactions WHERE seller_id = ? AND status = ?',
      [seller.id, 'held']
    ) as { balance: string | number }[];
    if (escrow.length > 0) {
      escrowBalance = Number(escrow[0].balance) || 0;
    }

    // Get review stats
    let totalReviews = 0;
    let averageRating = 0;
    const reviews = await query(
      'SELECT COUNT(*)::int as count, COALESCE(AVG(rating)::float, 0) as avg_rating FROM seller_reviews WHERE seller_id = ?',
      [seller.id]
    ) as { count: number; avg_rating: string | number }[];
    if (reviews.length > 0) {
      totalReviews = reviews[0].count || 0;
      averageRating = Number(reviews[0].avg_rating) || 0;
    }

    // Get custom inquiries count
    const inquiries = await query(
      'SELECT COUNT(*)::int as count FROM custom_requests WHERE seller_id = ? AND status = ?',
      [seller.id, 'pending']
    ) as { count: number }[];
    const pendingInquiries = inquiries[0]?.count || 0;

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
