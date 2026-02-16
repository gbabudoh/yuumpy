import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function testUpload() {
  console.log('Testing Cloudinary config...');
  console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
  console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Present' : 'Missing');
  console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Present' : 'Missing');

  try {
    // We'll try to upload a small dummy buffer or an existing local image if found
    console.log('Starting dummy upload...');
    
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'test_yuumpy',
          resource_type: 'auto'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      // Create a tiny 1x1 transparent pixel GIF buffer
      const buffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
      uploadStream.end(buffer);
    });

    console.log('✅ Upload successful!');
    console.log('Result:', result);
  } catch (error) {
    console.error('❌ Upload failed:');
    console.error(error);
  }
}

testUpload();
