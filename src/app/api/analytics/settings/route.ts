import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Fetch current analytics settings from database
    const settingsQuery = `
      SELECT 
        google_analytics_enabled,
        google_analytics_tracking_id,
        google_analytics_property_id,
        google_analytics_access_token,
        matomo_enabled,
        matomo_url,
        matomo_site_id,
        custom_events_config,
        privacy_settings
      FROM analytics_settings 
      WHERE id = 1
    `;

    const settings = await query(settingsQuery);
    
    const setting = Array.isArray(settings) ? settings[0] as any : null;
    
    if (!setting) {
      // Return default settings if none exist
      return NextResponse.json({
        success: true,
        data: {
          googleAnalytics: {
            enabled: false,
            trackingId: '',
            propertyId: '',
            accessToken: '',
            status: 'disconnected'
          },
        matomo: {
          enabled: false,
          url: '',
          siteId: '',
          status: 'disconnected'
        },
        customEvents: {
          productViews: true,
          bannerClicks: true,
          emailSignups: true,
          purchases: true
        },
        privacy: {
          anonymizeIP: true,
          respectDoNotTrack: true,
          cookieConsent: true
        }
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        googleAnalytics: {
          enabled: setting.google_analytics_enabled,
          trackingId: setting.google_analytics_tracking_id || '',
          propertyId: setting.google_analytics_property_id || '',
          accessToken: setting.google_analytics_access_token || '',
          status: setting.google_analytics_enabled ? 'connected' : 'disconnected'
        },
      matomo: {
        enabled: setting.matomo_enabled,
        url: setting.matomo_url || '',
        siteId: setting.matomo_site_id || '',
        status: setting.matomo_enabled ? 'connected' : 'disconnected'
        },
        customEvents: JSON.parse(setting.custom_events_config || '{}'),
        privacy: JSON.parse(setting.privacy_settings || '{}')
      }
    });
  } catch (error) {
    console.error('Error fetching analytics settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      googleAnalytics,
      matomo,
      customEvents,
      privacy
    } = body;

    // Validate required fields
    if (googleAnalytics.enabled && !googleAnalytics.trackingId) {
      return NextResponse.json(
        { error: 'Google Analytics tracking ID is required when enabled' },
        { status: 400 }
      );
    }

    if (matomo.enabled && (!matomo.url || !matomo.siteId)) {
      return NextResponse.json(
        { error: 'Matomo URL and Site ID are required when enabled' },
        { status: 400 }
      );
    }

    // Check if settings already exist
    const existingQuery = 'SELECT id FROM analytics_settings WHERE id = 1';
    const existing = await query(existingQuery);

    let result;

    if (Array.isArray(existing) && existing.length > 0) {
      // Update existing settings
      const updateQuery = `
        UPDATE analytics_settings SET
          google_analytics_enabled = ?,
          google_analytics_tracking_id = ?,
          google_analytics_property_id = ?,
          google_analytics_access_token = ?,
          matomo_enabled = ?,
          matomo_url = ?,
          matomo_site_id = ?,
          custom_events_config = ?,
          privacy_settings = ?,
          updated_at = NOW()
        WHERE id = 1
      `;

      result = await query(updateQuery, [
        googleAnalytics.enabled,
        googleAnalytics.trackingId,
        googleAnalytics.propertyId,
        googleAnalytics.accessToken,
        matomo.enabled,
        matomo.url,
        matomo.siteId,
        JSON.stringify(customEvents),
        JSON.stringify(privacy)
      ]);
    } else {
      // Insert new settings
      const insertQuery = `
        INSERT INTO analytics_settings (
          google_analytics_enabled,
          google_analytics_tracking_id,
          google_analytics_property_id,
          google_analytics_access_token,
          matomo_enabled,
          matomo_url,
          matomo_site_id,
          custom_events_config,
          privacy_settings,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      result = await query(insertQuery, [
        googleAnalytics.enabled,
        googleAnalytics.trackingId,
        googleAnalytics.propertyId,
        googleAnalytics.accessToken,
        matomo.enabled,
        matomo.url,
        matomo.siteId,
        JSON.stringify(customEvents),
        JSON.stringify(privacy)
      ]);
    }

    // Update environment variables (in a real app, you might want to restart the server)
    // For now, we'll just return success
    return NextResponse.json({ 
      success: true, 
      message: 'Analytics settings saved successfully' 
    });
  } catch (error) {
    console.error('Error saving analytics settings:', error);
    return NextResponse.json(
      { error: 'Failed to save analytics settings' },
      { status: 500 }
    );
  }
}
