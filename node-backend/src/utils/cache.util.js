'use strict';

const { redisClient } = require('./redis.util');
const logger = require('./logger.util');

const DEFAULT_TTL_SECONDS = 300; // 5 minutes

/**
 * Get a value from Redis cache. Returns null on miss or when Redis is down.
 * @param {string} key
 * @returns {Promise<any|null>}
 */
const getCache = async (key) => {
  if (!redisClient) return null;
  try {
    const data = await redisClient.get(key);
    if (!data) return null;
    return JSON.parse(data);
  } catch (err) {
    logger.warn(`[Cache] Get error for key "${key}": ${err.message}`);
    return null;
  }
};

/**
 * Store a value in Redis cache with TTL.
 * @param {string} key
 * @param {any} value
 * @param {number} [ttlSeconds=300]
 */
const setCache = async (key, value, ttlSeconds = DEFAULT_TTL_SECONDS) => {
  if (!redisClient) return;
  try {
    const serialized = JSON.stringify(value);
    await redisClient.set(key, serialized, 'EX', ttlSeconds);
  } catch (err) {
    logger.warn(`[Cache] Set error for key "${key}": ${err.message}`);
  }
};

/**
 * Invalidate a single key or pattern of keys (e.g. 'cache:menu:*').
 * @param {string} patternOrKey
 */
const invalidateCache = async (patternOrKey) => {
  if (!redisClient) return;
  try {
    if (patternOrKey.includes('*')) {
      const keys = await redisClient.keys(patternOrKey);
      if (keys.length > 0) {
        await redisClient.del(...keys);
        logger.info(`[Cache] Invalidated ${keys.length} key(s) matching "${patternOrKey}"`);
      }
    } else {
      await redisClient.del(patternOrKey);
      logger.info(`[Cache] Invalidated key "${patternOrKey}"`);
    }
  } catch (err) {
    logger.warn(`[Cache] Invalidation error for pattern "${patternOrKey}": ${err.message}`);
  }
};

module.exports = { getCache, setCache, invalidateCache };
