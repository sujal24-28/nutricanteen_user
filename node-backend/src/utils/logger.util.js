'use strict';

const winston = require('winston');
const path    = require('path');
const fs      = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Keys that must NEVER be written to logs in plain text
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
  'razorpay_signature',
  'razorpay_payment_id',
  'pin',
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

/**
 * Robustly extract user information from request.
 * Gathers details from req.user (authenticated), req.body, req.headers, or token payload.
 */
function extractUserDetails(req) {
  if (!req) return null;

  const details = {};

  // 1. From req.user (populated by auth middleware)
  if (req.user && typeof req.user === 'object') {
    if (req.user.id !== undefined) details.userId = req.user.id;
    if (req.user.role) details.role = req.user.role;
    if (req.user.name) details.name = req.user.name;
    if (req.user.phone) details.phone = req.user.phone;
    if (req.user.class) details.class = req.user.class;
    if (req.user.section) details.section = req.user.section;
    if (req.user.roll) details.roll = req.user.roll;
    if (req.user.school_id) details.schoolId = req.user.school_id;
    if (req.user.email) details.email = req.user.email;
    if (req.user.username) details.username = req.user.username;
  }

  // 2. From req.body (for login, register, unauthenticated requests)
  if (req.body && typeof req.body === 'object') {
    if (!details.phone && req.body.phone) details.phone = req.body.phone;
    if (!details.name && req.body.name) details.name = req.body.name;
    if (!details.userId && req.body.student_id) details.userId = req.body.student_id;
    if (!details.identifier && req.body.identifier) details.identifier = req.body.identifier;
    if (!details.class && req.body.class) details.class = req.body.class;
    if (!details.section && req.body.section) details.section = req.body.section;
    if (!details.roll && req.body.roll) details.roll = req.body.roll;
    if (!details.email && req.body.email) details.email = req.body.email;
  }

  // 3. Fallback: try decoding Bearer token if req.user wasn't yet attached
  if (!details.userId && req.headers && typeof req.headers.authorization === 'string' && req.headers.authorization.startsWith('Bearer ')) {
    try {
      const jwt = require('jsonwebtoken');
      const token = req.headers.authorization.slice(7);
      const decoded = jwt.decode(token);
      if (decoded && decoded.id) {
        details.userId = decoded.id;
        if (decoded.role && !details.role) details.role = decoded.role;
      }
    } catch (_) {}
  }

  // 4. Client network & device details
  const forwarded = req.headers ? req.headers['x-forwarded-for'] : null;
  details.ip = (forwarded ? forwarded.split(',')[0].trim() : null) || req.ip || req.socket?.remoteAddress || 'unknown';
  details.userAgent = req.headers ? req.headers['user-agent'] || 'unknown' : 'unknown';

  return details;
}

const redactFormat = winston.format((info) => {
  if (typeof info.message === 'object') {
    info.message = redactSensitive(info.message);
  }
  return info;
})();

/**
 * Dedicated structured format for error.log file.
 * Clearly displays Error Information + User Details + Request Payload + Stack.
 */
const errorFileFormat = printf((info) => {
  const ts = info.timestamp || new Date().toISOString();
  const level = (info.level || 'ERROR').toUpperCase();
  const message = info.message || 'Error occurred';
  const stack = info.stack || '';
  const user = info.user;
  const route = info.route;

  const lines = [
    '='.repeat(80),
    `[${ts}] ${level}: ${message}`,
  ];

  if (route) {
    lines.push('-'.repeat(80));
    lines.push('[ROUTE INFO]');
    lines.push(`  * Method & URL : ${route.method} ${route.url}`);
    lines.push(`  * Status Code  : ${route.statusCode}`);
    lines.push(`  * Client IP    : ${route.ip}`);
    if (route.userAgent && route.userAgent !== 'unknown') {
      lines.push(`  * User-Agent   : ${route.userAgent}`);
    }
  }

  if (user) {
    lines.push('-'.repeat(80));
    lines.push('[USER DETAILS]');
    if (user.userId !== undefined && user.userId !== null) lines.push(`  * User ID      : ${user.userId}`);
    if (user.role)   lines.push(`  * Role         : ${user.role}`);
    if (user.name)   lines.push(`  * Name         : ${user.name}`);
    if (user.phone)  lines.push(`  * Phone        : ${user.phone}`);
    if (user.email)  lines.push(`  * Email        : ${user.email}`);
    if (user.class || user.section || user.roll) {
      lines.push(`  * Class/Sec/Roll: Class ${user.class || '-'} - Sec ${user.section || '-'} (Roll #${user.roll || '-'})`);
    }
    if (user.schoolId) lines.push(`  * School ID    : ${user.schoolId}`);
    if (user.identifier) lines.push(`  * Identifier   : ${user.identifier}`);
    if (!user.userId && !user.phone && !user.name && !user.email) {
      lines.push('  * Status       : Unauthenticated / Guest Client');
      lines.push(`  * Client IP    : ${user.ip}`);
    }
  }

  if (route && (Object.keys(route.body || {}).length > 0 || Object.keys(route.query || {}).length > 0 || Object.keys(route.params || {}).length > 0)) {
    lines.push('-'.repeat(80));
    lines.push('[REQUEST DATA (Sanitized)]');
    if (Object.keys(route.params || {}).length > 0) {
      lines.push(`  * Params : ${JSON.stringify(route.params)}`);
    }
    if (Object.keys(route.query || {}).length > 0) {
      lines.push(`  * Query  : ${JSON.stringify(route.query)}`);
    }
    if (Object.keys(route.body || {}).length > 0) {
      lines.push(`  * Body   : ${JSON.stringify(route.body)}`);
    }
  }

  if (stack) {
    lines.push('-'.repeat(80));
    lines.push('[ERROR STACK]');
    lines.push(stack);
  }

  lines.push('='.repeat(80));
  lines.push(''); // blank line between entries
  return lines.join('\n');
});

/**
 * Concise console format for terminal:
 * Shows what happened and which user had the issue on a single clean line without cluttering.
 */
const consoleFormat = printf((info) => {
  const ts = info.timestamp || '';
  const level = info.level || 'info';
  const message = typeof info.message === 'object' ? JSON.stringify(info.message) : info.message;

  if (info.user || info.route) {
    const userInfo = info.user ? [
      info.user.name ? `User: ${info.user.name}` : null,
      info.user.phone ? `Phone: ${info.user.phone}` : null,
      !info.user.name && info.user.userId ? `ID: ${info.user.userId}` : null,
      info.user.ip && info.user.ip !== 'unknown' ? `IP: ${info.user.ip}` : null
    ].filter(Boolean).join(' | ') : '';

    const routeInfo = info.route ? `${info.route.method} ${info.route.url} (${info.route.statusCode})` : '';

    return `[${ts}] ${level}: ${routeInfo ? routeInfo + ' — ' : ''}${message}${userInfo ? ' [' + userInfo + ']' : ''}`;
  }

  return `[${ts}] ${level}: ${info.stack || message}`;
});

const isProduction = process.env.NODE_ENV === 'production';

// Winston Logger instance
const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    redactFormat
  ),
  transports: [
    // 1. Console Transport (concise, clean, colorized, no spam)
    new winston.transports.Console({
      format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), redactFormat, consoleFormat),
    }),

    // 2. Dedicated Error Log File (Error info + User details, max 10MB x 5 rotated files)
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true,
      format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errorFileFormat),
    }),

    // 3. Operational Combined Log File (info/warn/error, max 10MB x 5 rotated files)
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true,
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        printf(({ level, message, timestamp: ts, stack }) => {
          const msg = typeof message === 'object' ? JSON.stringify(message) : message;
          return `[${ts}] ${level}: ${stack || msg}`;
        })
      ),
    }),
  ],
});

/**
 * Dedicated method to log any Error along with User Details and Request Context.
 * @param {Error|object|string} err
 * @param {object|null} req - Express request object
 * @param {string|null} customMessage - Optional override message
 */
logger.logError = (err, req = null, customMessage = null) => {
  const user = extractUserDetails(req);
  const statusCode = err && (err.statusCode || err.status) ? (err.statusCode || err.status) : 500;

  const route = req ? {
    method: req.method,
    url: req.originalUrl || req.url,
    statusCode,
    ip: user?.ip || 'unknown',
    userAgent: user?.userAgent || 'unknown',
    params: redactSensitive(req.params || {}),
    query: redactSensitive(req.query || {}),
    body: redactSensitive(req.body || {}),
  } : null;

  const msg = customMessage || (err && err.message) || String(err || 'Unknown Error');
  const errorMeta = {
    name: (err && err.name) || 'Error',
    statusCode,
    stack: (err && err.stack) || (statusCode >= 500 ? (new Error()).stack : null),
    user,
    route,
  };

  logger.error(msg, errorMeta);
};

// Stream for morgan HTTP logger
logger.http = (msg) => logger.info(msg);

// Export logger and helpers
logger.extractUserDetails = extractUserDetails;
logger.redactSensitive    = redactSensitive;

module.exports = logger;
