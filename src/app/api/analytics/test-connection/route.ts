import { NextRequest, NextResponse } from 'next/server';
import { matomoAPI } from '@/lib/matomo-api';
import { googleAnalyticsAPI } from '@/lib/google-analytics-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service');

    if (!service || !['google', 'matomo'].includes(service)) {
      return NextResponse.json(
        { error: 'Invalid service parameter' },
        { status: 400 }
      );
    }

    let result;

    if (service === 'google') {
      result = await googleAnalyticsAPI.testConnection();
    } else if (service === 'matomo') {
      result = await matomoAPI.testConnection();
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error testing analytics connection:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
