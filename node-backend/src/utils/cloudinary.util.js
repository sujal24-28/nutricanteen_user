'use strict';

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const logger = require('./logger.util');

const isCloudinaryConfigured = Boolean(
  (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) ||
  process.env.CLOUDINARY_URL
);

if (isCloudinaryConfigured) {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config();
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }
}

/**
 * Uploads a multer file to Cloudinary.
 * If Cloudinary succeeds, removes local file and returns the permanent HTTPS URL.
 * If Cloudinary fails or is not configured, preserves local file and returns '/uploads/filename'.
 */
const uploadToCloudinary = async (file, folder = 'nutricanteen/menu') => {
  if (!file) return null;

  const localRelativeUrl = `/uploads/${file.filename}`;

  if (process.env.NODE_ENV === 'test' || !isCloudinaryConfigured) {
    return localRelativeUrl;
  }

  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: 'image',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    if (result && result.secure_url) {
      // Remove local copy since it is securely stored in Cloudinary
      if (fs.existsSync(file.path)) {
        try { fs.unlinkSync(file.path); } catch (_) {}
      }
      logger.info(`[Cloudinary] Image uploaded successfully to ${folder}: ${result.secure_url}`);
      return result.secure_url;
    }
    return localRelativeUrl;
  } catch (err) {
    logger.warn(`[Cloudinary Warning] Upload failed (${err.message}). Retaining local file fallback.`);
    return localRelativeUrl;
  }
};

module.exports = {
  isCloudinaryConfigured,
  uploadToCloudinary
};
