'use strict';

const winston = require('winston');
const path    = require('path');
const fs      = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const { combine, timestamp, printf, colorize, errors } = winston.format;

const SENSITIVE_KEYS = new Set([
  'password',
  'password_hash',
  'otp',
  'otp_hash',
  'token',
  'access_token',
  'refresh_token',
  'secret',
  'key_secret',
  'authorization',
  'cookie',
]);

/**
 * Deep-traverse objects and redact sensitive fields.
 */
function redactSensitive(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(redactSensitive);

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      cleaned[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      cleaned[key] = redactSensitive(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

const redactFormat = winston.format((info) => {
  if (typeof info.message === 'object') {
    info.message = redactSensitive(info.message);
  }
  return info;
})();

const logFormat = printf(({ level, message, timestamp: ts, stack }) => {
  const msg = typeof message === 'object' ? JSON.stringify(message) : message;
  return `[${ts}] ${level}: ${stack || msg}`;
});

const isProduction = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    redactFormat,
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), redactFormat, logFormat),
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
    }),
  ],
});

// Add http level for morgan stream
logger.http = (msg) => logger.info(msg);

module.exports = logger;
