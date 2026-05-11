import { NextResponse } from 'next/server';
import { getMinioStatus } from '@/lib/storage';

export async function GET() {
  try {
    const status = getMinioStatus();
    
    return NextResponse.json({
      success: true,
      environment: process.env.NODE_ENV,
      storage: {
        type: 'MinIO',
        configured: status.configured,
        endpoint: status.endpoint ? `✅ Set (${status.endpoint})` : '❌ Missing',
        bucket: status.bucket ? `✅ Set (${status.bucket})` : '❌ Missing',
        port: status.port ? `✅ Set (${status.port})` : '❌ Missing'
      },
      environmentVariables: {
        MINIO_ENDPOINT: process.env.MINIO_ENDPOINT ? 'Set' : 'Missing',
        MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY ? 'Set' : 'Missing',
        MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY ? 'Set' : 'Missing',
        MINIO_BUCKET: process.env.MINIO_BUCKET ? 'Set' : 'Missing'
      },
      message: status.configured 
        ? 'MinIO is properly configured and ready to upload images.' 
        : 'MinIO is not configured. Please set the required environment variables on your deployment platform.'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check storage status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}