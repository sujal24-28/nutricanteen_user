import { v2 as cloudinary } from 'cloudinary';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

/**
 * Checks if Cloudinary credentials are provided in the environment.
 */
export function getIsCloudinaryConfigured(): boolean {
  return Boolean(
    (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) ||
    process.env.CLOUDINARY_URL
  );
}

/**
 * Initializes and returns the configured Cloudinary instance.
 */
export function getCloudinaryClient() {
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
  return cloudinary;
}

/**
 * Tests Cloudinary API credentials.
 */
export async function verifyCloudinaryConnection(): Promise<{ success: boolean; message: string }> {
  if (!getIsCloudinaryConfigured()) {
    return { success: false, message: 'Cloudinary environment variables are missing or incomplete in .env' };
  }

  try {
    const client = getCloudinaryClient();
    const res = await client.api.ping();
    return { success: true, message: `Cloudinary connected successfully (status: ${res.status})` };
  } catch (err: any) {
    const errorMsg = err?.message || err?.error?.message || String(err);
    return { success: false, message: `Cloudinary connection error: ${errorMsg}` };
  }
}

/**
 * Saves buffer to local storage (node-backend/uploads).
 */
async function saveToLocalDisk(buffer: Buffer, originalFilename: string): Promise<string> {
  const sanitized = (originalFilename || 'image.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
  const filename = `${Date.now()}_${sanitized}`;
  const uploadsDir = path.join(process.cwd(), '..', 'node-backend', 'uploads');

  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  const filepath = path.join(uploadsDir, filename);
  await writeFile(filepath, buffer);
  return `/uploads/${filename}`;
}

/**
 * Uploads an image buffer.
 * Attempts Cloudinary first when configured; if Cloudinary upload fails or is not configured,
 * it safely falls back to local disk storage so user actions never fail.
 *
 * @param buffer Image binary buffer
 * @param originalFilename Original file name
 * @param folder Target Cloudinary folder (default: 'nutricanteen/menu')
 * @returns HTTPS Cloudinary URL or local '/uploads/filename' path
 */
export async function uploadImage(
  buffer: Buffer,
  originalFilename: string,
  folder: string = 'nutricanteen/menu'
): Promise<string> {
  if (getIsCloudinaryConfigured()) {
    try {
      const client = getCloudinaryClient();

      const secureUrl = await new Promise<string>((resolve, reject) => {
        const uploadStream = client.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
            transformation: [
              { quality: 'auto', fetch_format: 'auto' }, // Auto-optimizes WebP/AVIF format and compression
            ],
          },
          (error, result) => {
            if (error) {
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

      console.log(`[Cloudinary] Successfully uploaded image to ${folder}:`, secureUrl);
      return secureUrl;
    } catch (error: any) {
      console.warn(
        `[Cloudinary Upload Warning] Cloudinary upload failed (${error?.message || error}). Falling back to local disk storage.`
      );
      // Seamless graceful fallback to local storage
      return await saveToLocalDisk(buffer, originalFilename);
    }
  }

  // Fallback to local storage when Cloudinary credentials are not in .env yet
  return await saveToLocalDisk(buffer, originalFilename);
}

// Backward compatibility alias for uploadMenuImage
export const uploadMenuImage = (buffer: Buffer, originalFilename: string) =>
  uploadImage(buffer, originalFilename, 'nutricanteen/menu');

export const isCloudinaryConfigured = getIsCloudinaryConfigured();
