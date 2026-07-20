import { NextRequest, NextResponse } from 'next/server';
import { uploadFile, isMinioConfigured, getMinioStatus } from '@/lib/storage';
import { transcodeToCompatibleH264 } from '@/lib/video-transcode';

// Transcoding runs synchronously inside this request, which can take a while
// on larger videos — extend beyond the platform default so it isn't killed
// mid-transcode.
export const maxDuration = 120;

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
        ...(process.env.NODE_ENV !== 'production' && { details: error instanceof Error ? error.message : 'Unknown error' })
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

    const allowedImageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    const allowedImageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'];
    const allowedVideoMimeTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const allowedVideoExtensions = ['mp4', 'webm', 'mov'];

    const isImage = allowedImageMimeTypes.includes(fileType) || allowedImageExtensions.includes(fileExtension);
    const isVideo = allowedVideoMimeTypes.includes(fileType) || allowedVideoExtensions.includes(fileExtension);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, AVIF, GIF images and MP4, WebM, MOV videos are allowed.' },
        { status: 400 }
      );
    }

    const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { error: 'Video is too large. Maximum size is 50MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    let buffer: Buffer = Buffer.from(bytes);
    let uploadFileName = fileName;
    let uploadFileType = fileType;

    if (isVideo) {
      console.log('🎬 Transcoding video to compatible H.264 baseline...');
      try {
        buffer = await transcodeToCompatibleH264(buffer);
      } catch (transcodeError) {
        console.error('💥 Video transcode error:', transcodeError);
        return NextResponse.json(
          {
            error: 'Failed to process video. Please try a different file.',
            ...(process.env.NODE_ENV !== 'production' && { details: transcodeError instanceof Error ? transcodeError.message : 'Unknown error' })
          },
          { status: 500 }
        );
      }

      // Transcoding always outputs an H.264/AAC .mp4 container regardless of
      // the source format, so the stored filename/content-type must reflect
      // that rather than the original (e.g. .mov, video/quicktime).
      uploadFileName = uploadFileName.replace(/\.[^.]+$/, '') + '.mp4';
      uploadFileType = 'video/mp4';

      if (buffer.length > MAX_VIDEO_SIZE) {
        return NextResponse.json(
          { error: 'Video is too large after processing. Maximum size is 50MB.' },
          { status: 400 }
        );
      }
    }

    console.log('📦 Uploading to MinIO...');
    const url = await uploadFile(buffer, uploadFileName, uploadFileType, folder);

    console.log('✅ MinIO upload successful:', url);

    return NextResponse.json({
      success: true,
      url: url,
      name: uploadFileName,
      size: buffer.length,
      type: uploadFileType
    });

  } catch (error) {
    console.error('💥 Error uploading image:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload image', 
        ...(process.env.NODE_ENV !== 'production' && { details: error instanceof Error ? error.message : 'Unknown error' })
      },
      { status: 500 }
    );
  }
}