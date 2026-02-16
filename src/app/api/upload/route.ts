import { NextRequest, NextResponse } from 'next/server';
import { cloudinary, isCloudinaryConfigured, getCloudinaryStatus } from '@/lib/cloudinary';

// GET handler to check Cloudinary configuration status
export async function GET() {
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

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Upload API called');
    
    // Check if Cloudinary is configured
    const configStatus = getCloudinaryStatus();
    console.log('📋 Cloudinary config status:', configStatus);
    
    if (!isCloudinaryConfigured()) {
      console.error('❌ Cloudinary not configured');
      return NextResponse.json(
        { 
          error: 'Cloudinary is not configured',
          details: 'Missing required environment variables. Please check your Cloudinary configuration.',
          help: 'Ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in your environment variables.',
          configStatus: configStatus
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'yuumpy';

    console.log('📁 File details:', {
      name: file?.name,
      type: file?.type,
      size: file?.size,
      folder: folder
    });

    if (!file) {
      console.error('❌ No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type - be more robust with logging
    const fileType = file.type || '';
    const fileName = file.name || '';
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
    
    console.log(`📁 Validating file: ${fileName} (Type: ${fileType}, Ext: ${fileExtension})`);

    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'];

    const isAllowedMimeType = allowedMimeTypes.includes(fileType);
    const isAllowedExtension = allowedExtensions.includes(fileExtension);

    if (!isAllowedMimeType && !isAllowedExtension) {
      console.error('❌ Invalid file type/extension:', { type: fileType, ext: fileExtension });
      return NextResponse.json(
        { 
          error: `Invalid file type: ${fileType || fileExtension}. Only JPEG, PNG, WebP, AVIF, and GIF images are allowed.`,
          details: `Detected Type: ${fileType}, Extension: ${fileExtension}`
        },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.error('❌ File too large:', file.size, 'bytes');
      return NextResponse.json(
        { error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size is 10MB.` },
        { status: 400 }
      );
    }

    console.log('✅ File validation passed');

    // Convert file to buffer for Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('📦 File converted to buffer, size:', buffer.length, 'bytes');

    // Skip connection test for now - will be tested during upload
    console.log('☁️ Proceeding with Cloudinary upload...');

    // Upload to Cloudinary
    console.log('☁️ Starting Cloudinary upload...');
    const result = await new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: folder,
        resource_type: 'auto' as const,
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
          { width: 2000, height: 2000, crop: 'limit' } // Limit max dimensions
        ],
        public_id: `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      };
      
      console.log('⚙️ Upload options:', uploadOptions);
      
      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            console.error('❌ Error details:', {
              message: error.message,
              http_code: error.http_code,
              name: error.name
            });
            reject(error);
          } else {
            console.log('✅ Cloudinary upload successful:', {
              public_id: result?.public_id,
              secure_url: result?.secure_url,
              width: result?.width,
              height: result?.height,
              format: result?.format,
              bytes: result?.bytes
            });
            resolve(result);
          }
        }
      ).end(buffer);
    });

    const uploadResult = result as { secure_url: string; public_id: string; width: number; height: number; format: string; bytes: number };

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      bytes: uploadResult.bytes
    });

  } catch (error) {
    console.error('💥 Error uploading image:', error);
    
    // Provide more specific error messages
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    let userMessage = 'Failed to upload image';
    let helpMessage = 'Check your server logs and Cloudinary dashboard for more information.';
    
    if (errorMessage.includes('Invalid API Key') || errorMessage.includes('401')) {
      userMessage = 'Cloudinary API credentials are invalid';
      helpMessage = 'Please check your CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET environment variables.';
    } else if (errorMessage.includes('Not Found') || errorMessage.includes('404')) {
      userMessage = 'Cloudinary cloud name not found';
      helpMessage = 'Please verify your CLOUDINARY_CLOUD_NAME environment variable is correct.';
    } else if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      userMessage = 'Cloudinary rate limit exceeded';
      helpMessage = 'Please try again later or check your Cloudinary account usage.';
    } else if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
      userMessage = 'Upload timeout';
      helpMessage = 'The upload took too long. Please try with a smaller image or check your internet connection.';
    } else if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('network')) {
      userMessage = 'Network connection error';
      helpMessage = 'Unable to connect to Cloudinary. Please check your internet connection and firewall settings.';
    }
    
    return NextResponse.json(
      { 
        error: userMessage, 
        details: errorMessage,
        help: helpMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}