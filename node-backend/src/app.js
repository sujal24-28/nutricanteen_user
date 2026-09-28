'use strict';

const express  = require('express');
const helmet   = require('helmet');
const cors     = require('cors');
const morgan   = require('morgan');
const path     = require('path');

const routes        = require('./routes');
const errorHandler  = require('./middlewares/error.middleware');
const notFound      = require('./middlewares/notFound.middleware');
const logger        = require('./utils/logger.util');
const { sequelize } = require('./config/database');
const { redisClient } = require('./utils/redis.util');

const app = express();

/* ─── Security & Parsing ─── */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allows static image uploads to render cross-origin
    contentSecurityPolicy: false,                          // API only
  })
);

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow all origins in development or listed origins in production
      if (!origin || process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('CORS origin not allowed'));
    },
    credentials: true,
  })
);

// Body limits (1MB standard for JSON/URL-encoded)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

/* ─── HTTP Request Logging ─── */
app.use(
  morgan('combined', {
    stream: { write: (msg) => logger.http(msg.trim()) },
    skip: (req) => req.url === '/health' || req.url === '/api/v1/health',
  })
);

/* ─── Static — uploaded images ─── */
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

/* ─── Health Check & Observability ─── */
const healthHandler = async (_req, res) => {
  let dbStatus = 'ok';
  try {
    await sequelize.authenticate();
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  const redisStatus = redisClient
    ? (redisClient.status === 'ready' || redisClient.status === 'connect' ? 'connected' : redisClient.status)
    : 'in-memory (no REDIS_URL)';

  const memoryUsage = process.memoryUsage();
  const healthy = dbStatus === 'ok';

  return res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor(process.uptime()),
    database: dbStatus,
    redis: redisStatus,
    memory: {
      rss_mb: Math.round(memoryUsage.rss / 1024 / 1024),
      heap_used_mb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    },
  });
};

app.get('/', (_req, res) => {
  res.send('<h1>🍕 Welcome to Mapstreak API Backend!</h1><p>The server is running successfully.</p><p>Check <code>/health</code> for status.</p>');
});

app.get('/health', healthHandler);

/* ─── API Routes ─── */
const { apiLimiter } = require('./middlewares/rateLimiter.middleware');
app.use('/api/v1', apiLimiter, routes);

/* ─── 404 & Error Handlers ─── */
app.use(notFound);
app.use(errorHandler);

module.exports = app;
