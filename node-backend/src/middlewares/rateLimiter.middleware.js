'use strict';

const rateLimit    = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { redisClient } = require('../utils/redis.util');
const { errorResponse } = require('../utils/response.util');

const OTP_WINDOW   = parseInt(process.env.OTP_RATE_LIMIT_WINDOW_MINUTES,   10) || 15;
const OTP_MAX      = parseInt(process.env.OTP_RATE_LIMIT_MAX,              10) || 5;
const LOGIN_WINDOW = parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MINUTES, 10) || 15;
const LOGIN_MAX    = parseInt(process.env.LOGIN_RATE_LIMIT_MAX,            10) || 10;

/**
 * Build a RedisStore when a connected ioredis client is available,
 * otherwise return undefined so express-rate-limit uses in-memory.
 */
function makeStore(prefix) {
  if (!redisClient) return undefined;           // graceful fallback to in-memory
  return new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
    prefix,
  });
}

/** Strict limiter for OTP send endpoints (per phone number, then IP) */
const otpLimiter = rateLimit({
  windowMs:        OTP_WINDOW * 60 * 1000,
  max:             OTP_MAX,
  standardHeaders: true,
  legacyHeaders:   false,
  keyGenerator:    (req) => `otp:${req.body?.phone || req.ip}`,
  store:           makeStore('rl:otp:'),
  handler:         (_req, res) =>
    errorResponse(res, `Too many OTP requests. Please wait ${OTP_WINDOW} minutes.`, 429),
});

/** Strict limiter for admin login — prevent brute-force password attacks */
const loginLimiter = rateLimit({
  windowMs:        LOGIN_WINDOW * 60 * 1000,
  max:             LOGIN_MAX,
  standardHeaders: true,
  legacyHeaders:   false,
  keyGenerator:    (req) => `login:${req.body?.identifier || req.ip}`,
  store:           makeStore('rl:login:'),
  handler:         (_req, res) =>
    errorResponse(res, `Too many login attempts. Please wait ${LOGIN_WINDOW} minutes.`, 429),
});

/** General API limiter */
const apiLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             200,
  standardHeaders: true,
  legacyHeaders:   false,
  store:           makeStore('rl:api:'),
  handler:         (_req, res) =>
    errorResponse(res, 'Too many requests, please slow down.', 429),
});

module.exports = { otpLimiter, loginLimiter, apiLimiter };
