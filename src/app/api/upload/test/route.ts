import { NextRequest, NextResponse } from 'next/server';
import { getCloudinaryStatus } from '@/lib/cloudinary';

export async function GET(request: NextRequest) {
  try {
    const status = getCloudinaryStatus();
    
    return NextResponse.json({
      success: true,
      environment: process.env.NODE_ENV,
      cloudinary: {
        configured: status.configured,
        cloudName: status.hasCloudName ? `✅ Set (${status.cloudName})` : '❌ Missing',
        apiKey: status.hasApiKey ? '✅ Set' : '❌ Missing',
        apiSecret: status.hasApiSecret ? '✅ Set' : '❌ Missing'
      },
      environmentVariables: {
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing',
        NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing'
      },
      message: status.configured 
        ? 'Cloudinary is properly configured and ready to upload images.' 
        : 'Cloudinary is not configured. Please set the required environment variables on your deployment platform.'
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