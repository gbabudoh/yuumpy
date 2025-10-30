import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary - only if environment variables are available
const isConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET });
  console.log('✅ Cloudinary configured successfully');
} else {
  console.warn('⚠️  Cloudinary not configured. Missing environment variables:');
  if (!process.env.CLOUDINARY_CLOUD_NAME) console.warn('  - CLOUDINARY_CLOUD_NAME');
  if (!process.env.CLOUDINARY_API_KEY) console.warn('  - CLOUDINARY_API_KEY');
  if (!process.env.CLOUDINARY_API_SECRET) console.warn('  - CLOUDINARY_API_SECRET');
}

export { cloudinary };

// Export function to check if Cloudinary is configured
export function isCloudinaryConfigured(): boolean {
  return isConfigured;
}

// Export function to get configuration status
export function getCloudinaryStatus() {
  return {
    configured: isConfigured,
    hasCloudName: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
    hasApiKey: Boolean(process.env.CLOUDINARY_API_KEY),
    hasApiSecret: Boolean(process.env.CLOUDINARY_API_SECRET),
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || null
  };
}

// Helper function to upload images
export const uploadImage = async (file: File, folder: string = 'yuumpy') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'yuumpy_preset'); // You'll need to create this preset in Cloudinary
    formData.append('folder', folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData }
    );

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Helper function to transform images
export const getOptimizedImageUrl = (
  publicId: string,
  width?: number,
  height?: number,
  quality: string = 'auto',
  format: string = 'auto'
) => {
  const transformations = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);

  const transformationString = transformations.join(',');
  
  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${transformationString}/${publicId}`;
};

// Helper function to delete images
export const deleteImage = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};
