'use strict';

const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/response.util');

const OTP_WINDOW = parseInt(process.env.OTP_RATE_LIMIT_WINDOW_MINUTES, 10) || 15;
const OTP_MAX    = parseInt(process.env.OTP_RATE_LIMIT_MAX, 10) || 5;

/** Strict limiter for OTP send endpoints */
const otpLimiter = rateLimit({
  windowMs:         OTP_WINDOW * 60 * 1000,
  max:              OTP_MAX,
  standardHeaders:  true,
  legacyHeaders:    false,
  keyGenerator:     (req) => req.body?.phone || req.ip,
  handler:          (_req, res) =>
    errorResponse(
      res,
      `Too many OTP requests. Please wait ${OTP_WINDOW} minutes.`,
      429
    ),
});

/** General API limiter */
const apiLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             200,
  standardHeaders: true,
  legacyHeaders:   false,
  handler: (_req, res) =>
    errorResponse(res, 'Too many requests, please slow down.', 429),
});

module.exports = { otpLimiter, apiLimiter };
