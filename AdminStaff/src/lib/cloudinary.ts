import { v2 as cloudinary } from 'cloudinary';
import { writeFile } from 'fs/promises';
import path from 'path';

// Check if Cloudinary credentials are provided in environment
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
 * Uploads an image buffer.
 * If Cloudinary is configured, uploads directly to Cloudinary and returns the permanent HTTPS URL.
 * If Cloudinary is not configured, gracefully falls back to the local node-backend uploads folder.
 */
export async function uploadMenuImage(buffer: Buffer, originalFilename: string): Promise<string> {
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'nutricanteen/menu',
          resource_type: 'image',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' } // Auto-optimizes format (WebP/AVIF) and quality
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload stream error:', error);
            return reject(error);
          }
          if (!result || !result.secure_url) {
            return reject(new Error('Cloudinary returned an empty response.'));
          }
          resolve(result.secure_url);
        }
      );
      uploadStream.end(buffer);
    });
  }

  // Fallback to local storage when Cloudinary credentials are not in .env yet
  const sanitized = originalFilename.replace(/\s+/g, '_');
  const filename = `${Date.now()}_${sanitized}`;
  const filepath = path.join(process.cwd(), '..', 'node-backend', 'uploads', filename);
  await writeFile(filepath, buffer);
  return `/uploads/${filename}`;
}

export { isCloudinaryConfigured };
