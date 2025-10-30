import { NextResponse } from 'next/server';

export async function GET() {
  const analyticsConfig = {
    googleAnalytics: {
      id: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
      configured: !!process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
      propertyId: process.env.GOOGLE_ANALYTICS_PROPERTY_ID,
      accessToken: process.env.GOOGLE_ANALYTICS_ACCESS_TOKEN ? 'Set' : 'Not Set' },
    matomo: {
      url: process.env.NEXT_PUBLIC_MATOMO_URL,
      siteId: process.env.NEXT_PUBLIC_MATOMO_SITE_ID,
      configured: !!(process.env.NEXT_PUBLIC_MATOMO_URL && process.env.NEXT_PUBLIC_MATOMO_SITE_ID),
      apiToken: process.env.MATOMO_API_TOKEN ? 'Set' : 'Not Set' },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL }
  };

  return NextResponse.json({
    success: true,
    message: 'Analytics configuration status',
    config: analyticsConfig,
    recommendations: {
      googleAnalytics: analyticsConfig.googleAnalytics.configured 
        ? 'Google Analytics is properly configured' 
        : 'Set NEXT_PUBLIC_GOOGLE_ANALYTICS_ID in your environment variables',
      matomo: analyticsConfig.matomo.configured 
        ? 'Matomo is properly configured' 
        : 'Set NEXT_PUBLIC_MATOMO_URL and NEXT_PUBLIC_MATOMO_SITE_ID in your environment variables' }
  });
}
