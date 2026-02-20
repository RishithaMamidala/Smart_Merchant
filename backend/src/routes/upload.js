import { Router } from 'express';
import multer from 'multer';
import { requireMerchant } from '../middleware/auth.js';
import {
  uploadImageBuffer,
  deleteImage,
  generateUploadSignature,
} from '../services/cloudinaryService.js';
import { sendSuccess, sendCreated, sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10, // Max 10 files per request
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'));
    }
  },
});

// All routes require merchant authentication
router.use(requireMerchant);

/**
 * POST /api/merchant/upload/image
 * Upload a single image
 */
router.post('/image', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'VALIDATION_ERROR', 'No image file provided');
    }

    const result = await uploadImageBuffer(req.file.buffer, {
      folder: `smart-merchant/products/${req.merchant._id}`,
    });

    logger.info('Image uploaded', {
      merchantId: req.merchant._id,
      publicId: result.publicId,
    });

    sendCreated(res, {
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    if (error.message === 'Cloudinary is not configured') {
      return sendError(res, 'SERVICE_UNAVAILABLE', 'Image upload service is not available', 503);
    }
    next(error);
  }
});

/**
 * POST /api/merchant/upload/images
 * Upload multiple images
 */
router.post('/images', upload.array('images', 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendError(res, 'VALIDATION_ERROR', 'No image files provided');
    }

    const results = await Promise.all(
      req.files.map((file) =>
        uploadImageBuffer(file.buffer, {
          folder: `smart-merchant/products/${req.merchant._id}`,
        })
      )
    );

    logger.info('Multiple images uploaded', {
      merchantId: req.merchant._id,
      count: results.length,
    });

    sendCreated(res, {
      images: results.map((r) => ({
        url: r.url,
        publicId: r.publicId,
        width: r.width,
        height: r.height,
      })),
    });
  } catch (error) {
    if (error.message === 'Cloudinary is not configured') {
      return sendError(res, 'SERVICE_UNAVAILABLE', 'Image upload service is not available', 503);
    }
    next(error);
  }
});

/**
 * DELETE /api/merchant/upload/image/:publicId
 * Delete an image
 */
router.delete('/image/:publicId(*)', async (req, res, next) => {
  try {
    const { publicId } = req.params;

    // Verify the image belongs to this merchant (check folder structure)
    if (!publicId.includes(`smart-merchant/products/${req.merchant._id}`)) {
      return sendError(res, 'FORBIDDEN', 'Cannot delete this image', 403);
    }

    const deleted = await deleteImage(publicId);

    if (!deleted) {
      return sendError(res, 'NOT_FOUND', 'Image not found', 404);
    }

    logger.info('Image deleted', {
      merchantId: req.merchant._id,
      publicId,
    });

    sendSuccess(res, { message: 'Image deleted successfully' });
  } catch (error) {
    if (error.message === 'Cloudinary is not configured') {
      return sendError(res, 'SERVICE_UNAVAILABLE', 'Image upload service is not available', 503);
    }
    next(error);
  }
});

/**
 * GET /api/merchant/upload/signature
 * Get a signed upload URL for direct browser uploads
 */
router.get('/signature', async (req, res, next) => {
  try {
    const signature = await generateUploadSignature({
      folder: `smart-merchant/products/${req.merchant._id}`,
    });

    sendSuccess(res, signature);
  } catch (error) {
    if (error.message === 'Cloudinary is not configured') {
      return sendError(res, 'SERVICE_UNAVAILABLE', 'Image upload service is not available', 503);
    }
    next(error);
  }
});

// Error handler for multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 'VALIDATION_ERROR', 'File size exceeds 5MB limit');
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return sendError(res, 'VALIDATION_ERROR', 'Maximum 10 files allowed per request');
    }
    return sendError(res, 'VALIDATION_ERROR', error.message);
  }
  if (error.message && error.message.includes('Invalid file type')) {
    return sendError(res, 'VALIDATION_ERROR', error.message);
  }
  next(error);
});

export default router;
