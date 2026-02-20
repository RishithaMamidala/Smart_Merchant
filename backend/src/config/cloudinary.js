import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Default upload options for product images
 */
export const defaultUploadOptions = {
  folder: 'smart-merchant/products',
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  transformation: [
    { quality: 'auto', fetch_format: 'auto' },
  ],
};

/**
 * Image transformation presets
 */
export const imageTransforms = {
  thumbnail: { width: 150, height: 150, crop: 'fill' },
  card: { width: 400, height: 400, crop: 'fill' },
  detail: { width: 800, height: 800, crop: 'limit' },
  original: { quality: 'auto' },
};

/**
 * Check if Cloudinary is configured
 * @returns {boolean}
 */
export function isCloudinaryConfigured() {
  return Boolean(
    env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
  );
}

export default cloudinary;
