'use strict';

const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const crypto  = require('crypto');

const UPLOAD_DIR  = path.join(__dirname, '..', '..', process.env.UPLOAD_DIR || 'uploads');
const MAX_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 2;

// Extension allow-list (first line of defence — fast)
const ALLOWED_EXT  = new Set(['.jpg', '.jpeg', '.png', '.webp']);
// MIME allow-list matched against client Content-Type header (second line — still spoofable)
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

// Magic-byte signatures (source-of-truth — not spoofable)
const MAGIC_SIGNATURES = [
  { mime: 'image/jpeg', bytes: [0xFF, 0xD8, 0xFF] },
  { mime: 'image/png',  bytes: [0x89, 0x50, 0x4E, 0x47] },
  { mime: 'image/webp', offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] }, // RIFF....WEBP
];

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/**
 * Check if a buffer starts with any known image magic bytes.
 * Returns the matched MIME type or null.
 */
function detectMagicMime(buffer) {
  for (const sig of MAGIC_SIGNATURES) {
    const offset = sig.offset || 0;
    if (buffer.length < offset + sig.bytes.length) continue;
    const match = sig.bytes.every((b, i) => buffer[offset + i] === b);
    if (match) return sig.mime;
  }
  return null;
}

/**
 * Multer uses memoryStorage so the file buffer is available for magic-byte
 * inspection BEFORE writing to disk.  After validation the buffer is saved
 * to UPLOAD_DIR with a randomised filename.
 */
const memStorage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  // Fast pre-check on declared MIME + extension (rejects obviously wrong types early)
  if (!ALLOWED_EXT.has(ext) || !ALLOWED_MIME.has(file.mimetype)) {
    return cb(new Error('Only JPG, PNG, and WebP images are allowed'));
  }
  cb(null, true);
};

const _multerInstance = multer({
  storage:   memStorage,
  fileFilter,
  limits:    { fileSize: MAX_SIZE_MB * 1024 * 1024, files: 1 },
});

/**
 * Express middleware that:
 *  1. Runs multer (memoryStorage) to receive the file into req.file.buffer
 *  2. Validates magic bytes against MAGIC_SIGNATURES
 *  3. Writes the buffer to disk with a randomised name
 *  4. Sets req.file.path and req.file.filename (same shape as diskStorage)
 *
 * Usage:  router.post('/', upload.single('image'), handler)
 */
const single = (fieldName) => (req, res, next) => {
  _multerInstance.single(fieldName)(req, res, (err) => {
    if (err) return next(err);
    if (!req.file) return next();  // no file uploaded — optional field

    // Magic-byte validation
    const detectedMime = detectMagicMime(req.file.buffer);
    if (!detectedMime) {
      return next(new Error('File content does not match a supported image format'));
    }
    if (!ALLOWED_MIME.has(detectedMime)) {
      return next(new Error('Only JPG, PNG, and WebP images are allowed'));
    }

    // Generate safe filename and write buffer to disk
    const ext      = path.extname(req.file.originalname).toLowerCase();
    const filename = `${Date.now()}_${crypto.randomBytes(8).toString('hex')}${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    fs.writeFile(filePath, req.file.buffer, (writeErr) => {
      if (writeErr) return next(writeErr);
      // Augment req.file to match diskStorage shape expected by cloudinary.util.js
      req.file.path     = filePath;
      req.file.filename = filename;
      next();
    });
  });
};

const upload = { single };

module.exports = { upload };
