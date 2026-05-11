import { NextRequest, NextResponse } from 'next/server';
import { uploadFile, isMinioConfigured, getMinioStatus } from '@/lib/storage';

// GET handler to check Storage configuration status
export async function GET() {
  try {
    const status = getMinioStatus();
    
    return NextResponse.json({
      success: true,
      storage: {
        type: 'MinIO',
        configured: status.configured,
        status: status.configured ? '✅ Configured' : '❌ Not Configured',
        details: {
          endpoint: status.endpoint ? `✅ Set (${status.endpoint})` : '❌ Missing',
          bucket: status.bucket ? `✅ Set (${status.bucket})` : '❌ Missing'
        },
        message: status.configured 
          ? 'MinIO is properly configured and ready to upload images.' 
          : 'MinIO is not configured. Please set the required environment variables on your server.'
      }
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

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Upload API called (MinIO)');
    
    if (!isMinioConfigured()) {
      console.error('❌ MinIO not configured');
      return NextResponse.json(
        { 
          error: 'MinIO is not configured',
          details: 'Missing required environment variables.',
          help: 'Ensure MINIO_ENDPOINT, MINIO_ACCESS_KEY, and MINIO_SECRET_KEY are set.'
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'yuumpy';

    if (!file) {
      console.error('❌ No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const fileType = file.type || '';
    const fileName = file.name || '';
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
    
    console.log(`📁 Validating file: ${fileName} (Type: ${fileType}, Ext: ${fileExtension})`);

    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'];

    if (!allowedMimeTypes.includes(fileType) && !allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, AVIF, and GIF images are allowed.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('📦 Uploading to MinIO...');
    const url = await uploadFile(buffer, fileName, fileType, folder);

    console.log('✅ MinIO upload successful:', url);

    return NextResponse.json({
      success: true,
      url: url,
      name: fileName,
      size: file.size,
      type: fileType
    });

  } catch (error) {
    console.error('💥 Error uploading image:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload image', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}