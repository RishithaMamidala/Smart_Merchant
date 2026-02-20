import cloudinary, { defaultUploadOptions, imageTransforms, isCloudinaryConfigured } from '../config/cloudinary.js';
import { logger } from '../utils/logger.js';

/**
 * @typedef {Object} UploadResult
 * @property {string} url - Secure URL of the uploaded image
 * @property {string} publicId - Cloudinary public ID
 * @property {number} width - Image width
 * @property {number} height - Image height
 * @property {string} format - Image format
 * @property {number} bytes - File size in bytes
 */

/**
 * Upload an image to Cloudinary
 * @param {string} filePath - Path to the file or base64 data URL
 * @param {Object} [options] - Upload options
 * @param {string} [options.folder] - Folder path in Cloudinary
 * @param {string} [options.publicId] - Custom public ID
 * @returns {Promise<UploadResult>}
 */
export async function uploadImage(filePath, options = {}) {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured');
  }

  const uploadOptions = {
    ...defaultUploadOptions,
    ...options,
    resource_type: 'image',
  };

  try {
    const result = await cloudinary.uploader.upload(filePath, uploadOptions);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    logger.error('Cloudinary upload failed', { error: error.message });
    throw new Error('Image upload failed');
  }
}

/**
 * Upload an image from a buffer
 * @param {Buffer} buffer - Image buffer
 * @param {Object} [options] - Upload options
 * @returns {Promise<UploadResult>}
 */
export async function uploadImageBuffer(buffer, options = {}) {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured');
  }

  return new Promise((resolve, reject) => {
    const uploadOptions = {
      ...defaultUploadOptions,
      ...options,
      resource_type: 'image',
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload failed', { error: error.message });
          return reject(new Error('Image upload failed'));
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<boolean>}
 */
export async function deleteImage(publicId) {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured');
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    logger.error('Cloudinary delete failed', { publicId, error: error.message });
    throw new Error('Image delete failed');
  }
}

/**
 * Delete multiple images from Cloudinary
 * @param {string[]} publicIds - Array of Cloudinary public IDs
 * @returns {Promise<{deleted: string[], failed: string[]}>}
 */
export async function deleteImages(publicIds) {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured');
  }

  if (!publicIds || publicIds.length === 0) {
    return { deleted: [], failed: [] };
  }

  try {
    const result = await cloudinary.api.delete_resources(publicIds);

    const deleted = [];
    const failed = [];

    for (const [publicId, status] of Object.entries(result.deleted)) {
      if (status === 'deleted') {
        deleted.push(publicId);
      } else {
        failed.push(publicId);
      }
    }

    return { deleted, failed };
  } catch (error) {
    logger.error('Cloudinary bulk delete failed', { error: error.message });
    throw new Error('Bulk image delete failed');
  }
}

/**
 * Generate a transformed image URL
 * @param {string} publicId - Cloudinary public ID
 * @param {string} preset - Transform preset name
 * @returns {string}
 */
export function getTransformedUrl(publicId, preset) {
  const transform = imageTransforms[preset] || imageTransforms.original;

  return cloudinary.url(publicId, {
    ...transform,
    secure: true,
  });
}

/**
 * Generate a signed upload URL for direct browser uploads
 * @param {Object} [options] - Upload options
 * @returns {Promise<{signature: string, timestamp: number, apiKey: string, cloudName: string, folder: string}>}
 */
export async function generateUploadSignature(options = {}) {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured');
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = options.folder || defaultUploadOptions.folder;

  const paramsToSign = {
    timestamp,
    folder,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    cloudinary.config().api_secret
  );

  return {
    signature,
    timestamp,
    apiKey: cloudinary.config().api_key,
    cloudName: cloudinary.config().cloud_name,
    folder,
  };
}
