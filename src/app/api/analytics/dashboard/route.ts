import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || '7d';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Calculate date range
    const now = new Date();
    let start: Date;
    
    switch (dateRange) {
      case '7d':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const startDateStr = startDate || start.toISOString().split('T')[0];
    const endDateStr = endDate || now.toISOString().split('T')[0];

    // Fetch overview statistics
    const overviewQuery = `
      SELECT 
        COUNT(CASE WHEN event_type = 'page_view' THEN 1 END) as total_views,
        COUNT(CASE WHEN event_type = 'click' THEN 1 END) as total_clicks,
        COUNT(CASE WHEN event_type = 'purchase' THEN 1 END) as total_purchases,
        COUNT(DISTINCT user_ip) as unique_visitors
      FROM analytics 
      WHERE created_at >= ? AND created_at <= ?
    `;

    const overviewResult = await query(overviewQuery, [startDateStr, endDateStr]);
    const overview = overviewResult[0] || { total_views: 0, total_clicks: 0, total_purchases: 0, unique_visitors: 0 };

    // Fetch daily traffic data
    const trafficQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(CASE WHEN event_type = 'page_view' THEN 1 END) as views,
        COUNT(CASE WHEN event_type = 'click' THEN 1 END) as clicks,
        COUNT(CASE WHEN event_type = 'purchase' THEN 1 END) as purchases
      FROM analytics 
      WHERE created_at >= ? AND created_at <= ?
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    const trafficData = await query(trafficQuery, [startDateStr, endDateStr]);

    // Fetch top pages
    const topPagesQuery = `
      SELECT 
        page_url as page,
        COUNT(CASE WHEN event_type = 'page_view' THEN 1 END) as views,
        COUNT(CASE WHEN event_type = 'click' THEN 1 END) as clicks
      FROM analytics 
      WHERE created_at >= ? AND created_at <= ? AND page_url IS NOT NULL
      GROUP BY page_url
      ORDER BY views DESC
      LIMIT 10
    `;

    const topPagesData = await query(topPagesQuery, [startDateStr, endDateStr]);

    // Fetch device statistics
    const deviceQuery = `
      SELECT 
        CASE 
          WHEN user_agent LIKE '%Mobile%' THEN 'mobile'
          WHEN user_agent LIKE '%Tablet%' OR user_agent LIKE '%iPad%' THEN 'tablet'
          ELSE 'desktop'
        END as device_type,
        COUNT(*) as count
      FROM analytics 
      WHERE created_at >= ? AND created_at <= ? AND user_agent IS NOT NULL
      GROUP BY device_type
    `;

    const deviceData = await query(deviceQuery, [startDateStr, endDateStr]);

    // Fetch referrer data
    const referrerQuery = `
      SELECT 
        CASE 
          WHEN referrer = '' OR referrer IS NULL THEN 'Direct'
          WHEN referrer LIKE '%google%' THEN 'Google'
          WHEN referrer LIKE '%facebook%' THEN 'Facebook'
          WHEN referrer LIKE '%twitter%' THEN 'Twitter'
          WHEN referrer LIKE '%linkedin%' THEN 'LinkedIn'
          ELSE 'Other'
        END as source,
        COUNT(*) as visits
      FROM analytics 
      WHERE created_at >= ? AND created_at <= ? AND event_type = 'page_view'
      GROUP BY source
      ORDER BY visits DESC
    `;

    const referrerData = await query(referrerQuery, [startDateStr, endDateStr]);

    // Fetch goal completions
    const goalsQuery = `
      SELECT 
        event_type as goal_name,
        COUNT(*) as completions
      FROM analytics 
      WHERE created_at >= ? AND created_at <= ? 
        AND event_type IN ('product_view', 'add_to_cart', 'purchase', 'email_signup')
      GROUP BY event_type
    `;

    const goalsData = await query(goalsQuery, [startDateStr, endDateStr]);

    // Calculate conversion rates
    const totalViews = overview.total_views || 1;
    const conversionRate = ((overview.total_clicks || 0) / totalViews) * 100;
    const purchaseRate = ((overview.total_purchases || 0) / totalViews) * 100;

    // Process device data
    const deviceStats = {
      desktop: 0,
      mobile: 0,
      tablet: 0
    };

    const totalDevices = Array.isArray(deviceData) ? deviceData.reduce((sum: number, device: any) => sum + device.count, 0) : 0;
    if (Array.isArray(deviceData)) {
      deviceData.forEach((device: any) => {
        const percentage = (device.count / totalDevices) * 100;
        deviceStats[device.device_type as keyof typeof deviceStats] = Math.round(percentage);
      });
    }

    // Process referrer data
    const totalReferrerVisits = Array.isArray(referrerData) ? referrerData.reduce((sum: number, ref: any) => sum + ref.visits, 0) : 0;
    const referrers = Array.isArray(referrerData) ? referrerData.map((ref: any) => ({
      source: ref.source,
      visits: ref.visits,
      percentage: Math.round((ref.visits / totalReferrerVisits) * 100)
    })) : [];

    // Process goals data
    const goals = Array.isArray(goalsData) ? goalsData.map((goal: any) => ({
      name: goal.goal_name.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      completions: goal.completions,
      conversionRate: Math.round((goal.completions / totalViews) * 100 * 100) / 100
    })) : [];

    // Process top pages data
    const topPages = Array.isArray(topPagesData) ? topPagesData.map((page: any) => ({
      page: page.page,
      views: page.views,
      clicks: page.clicks,
      conversionRate: Math.round((page.clicks / page.views) * 100 * 100) / 100
    })) : [];

    const response = {
      overview: {
        totalViews: overview.total_views || 0,
        totalClicks: overview.total_clicks || 0,
        totalRevenue: (overview.total_purchases || 0) * 50, // Mock revenue calculation
        conversionRate: Math.round(conversionRate * 100) / 100,
        bounceRate: 42.1, // Mock bounce rate
        avgSessionDuration: 2.5, // Mock session duration
        uniqueVisitors: overview.unique_visitors || 0
      },
      traffic: Array.isArray(trafficData) ? trafficData.map((day: any) => ({
        date: day.date,
        views: day.views || 0,
        clicks: day.clicks || 0,
        revenue: (day.purchases || 0) * 50 // Mock revenue calculation
      })) : [],
      topPages,
      deviceStats,
      referrers,
      goals
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching analytics dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
