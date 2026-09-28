'use strict';

/**
 * ioredis client for rate-limiter shared state.
 * Gracefully falls back to in-memory if Redis is unavailable or unconfigured.
 *
 * Required env vars (only when Redis is deployed):
 *   REDIS_URL      e.g. redis://localhost:6379  OR  rediss://user:pass@host:port
 *   REDIS_PASSWORD (optional — for simple password AUTH without user)
 *
 * When REDIS_URL is not set, exports { redisClient: null } and rate-limiters
 * automatically fall back to their built-in in-memory store.
 */

const logger = require('./logger.util');

let redisClient = null;

const REDIS_URL = process.env.REDIS_URL;

if (REDIS_URL) {
  const Redis = require('ioredis');

  redisClient = new Redis(REDIS_URL, {
    password:             process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,       // required by rate-limit-redis
    enableReadyCheck:     false,
    lazyConnect:          true,
    retryStrategy:        (times) => {
      if (times > 5) {
        logger.warn('[Redis] Max reconnect attempts — rate limiters falling back to in-memory.');
        return null;                  // stop retrying
      }
      return Math.min(times * 200, 5000);
    },
  });

  redisClient.on('ready', () =>
    logger.info('[Redis] Connected — rate limiters using shared Redis store.'));

  redisClient.on('error', (err) =>
    logger.warn(`[Redis] ${err.message}`));

  redisClient.connect().catch((err) =>
    logger.warn(`[Redis] Initial connect failed: ${err.message} — in-memory fallback active.`));
} else {
  logger.info('[Redis] REDIS_URL not set — using in-memory rate limit store (single-instance mode).');
}

module.exports = { redisClient };
