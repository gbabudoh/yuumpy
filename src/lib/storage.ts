import * as Minio from 'minio';

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || '',
});

const bucketName = process.env.MINIO_BUCKET || 'yuumpy';

// Ensure bucket exists on startup
const ensureBucketExists = async () => {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName);
      console.log(`✅ Bucket "${bucketName}" created successfully.`);
      
      // Set bucket policy to allow public read
      const policy = {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: { AWS: ["*"] },
            Action: ["s3:GetBucketLocation", "s3:ListBucket"],
            Resource: [`arn:aws:s3:::${bucketName}`],
          },
          {
            Effect: "Allow",
            Principal: { AWS: ["*"] },
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${bucketName}/*`],
          },
        ],
      };
      await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
      console.log(`✅ Public read policy set for bucket "${bucketName}".`);
    }
  } catch (error) {
    console.error('❌ Error ensuring MinIO bucket exists:', error);
  }
};

ensureBucketExists();

export async function uploadFile(file: Buffer | Uint8Array, fileName: string, contentType: string, folder: string = 'yuumpy') {
  try {
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const objectName = `${folder}/${Date.now()}_${cleanFileName}`;
    
    await minioClient.putObject(bucketName, objectName, file, file.length, {
      'Content-Type': contentType,
    });

    const publicUrl = process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL || `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`;
    return `${publicUrl}/${bucketName}/${objectName}`;
  } catch (error) {
    console.error('❌ MinIO upload error:', error);
    throw error;
  }
}

export async function deleteFile(objectName: string) {
  try {
    // Extract object name from URL if full URL is provided
    const name = objectName.includes('/') ? objectName.split('/').pop()! : objectName;
    await minioClient.removeObject(bucketName, name);
    return { success: true };
  } catch (error) {
    console.error('❌ MinIO delete error:', error);
    throw error;
  }
}

export function isMinioConfigured() {
  return Boolean(
    process.env.MINIO_ENDPOINT &&
    process.env.MINIO_ACCESS_KEY &&
    process.env.MINIO_SECRET_KEY
  );
}

export function getMinioStatus() {
  return {
    configured: isMinioConfigured(),
    endpoint: process.env.MINIO_ENDPOINT,
    bucket: bucketName,
    port: process.env.MINIO_PORT,
  };
}
