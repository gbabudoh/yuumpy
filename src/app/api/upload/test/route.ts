import { NextRequest, NextResponse } from 'next/server';
import { getCloudinaryStatus } from '@/lib/cloudinary';

export async function GET(request: NextRequest) {
  try {
    const status = getCloudinaryStatus();
    
    return NextResponse.json({
      success: true,
      cloudinary: {
        configured: status.configured,
        status: status.configured ? '✅ Configured' : '❌ Not Configured',
        details: {
          cloudName: status.hasCloudName ? `✅ Set (${status.cloudName})` : '❌ Missing',
          apiKey: status.hasApiKey ? '✅ Set' : '❌ Missing',
          apiSecret: status.hasApiSecret ? '✅ Set' : '❌ Missing'
        },
        message: status.configured 
          ? 'Cloudinary is properly configured and ready to upload images.' 
          : 'Cloudinary is not configured. Please set the required environment variables on your server:\n' +
            '  - CLOUDINARY_CLOUD_NAME=your_cloud_name\n' +
            '  - CLOUDINARY_API_KEY=your_api_key\n' +
            '  - CLOUDINARY_API_SECRET=your_api_secret\n\n' +
            'After setting these variables, restart your Node.js application.'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check Cloudinary status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

