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

const app = express();

/* ─── Security & Parsing ─── */
app.use(helmet());

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow all origins in development to fix CORS errors easily, or allow listed origins.
      if (!origin || process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('CORS origin not allowed'));
    },
    credentials: true,
  })
);

// Keep request bodies small; file uploads are handled separately by multer.
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

/* ─── HTTP Request Logging ─── */
app.use(
  morgan('combined', {
    stream: { write: (msg) => logger.http(msg.trim()) },
  })
);

/* ─── Static — uploaded images ─── */
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

/* ─── Health Check ─── */
app.get('/', (_req, res) => { res.send('<h1>🍕 Welcome to NutriCanteen API Backend!</h1><p>The server is running successfully.</p><p>Check <code>/health</code> for status, or use <code>/api/v1/*</code> endpoints.</p>'); });

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/* ─── API Routes ─── */
const { apiLimiter } = require('./middlewares/rateLimiter.middleware');
app.use('/api/v1', apiLimiter, routes);

/* ─── 404 & Error Handlers ─── */
app.use(notFound);
app.use(errorHandler);

module.exports = app;
