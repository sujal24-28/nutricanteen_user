'use strict';

const jwt = require('jsonwebtoken');

const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXP     = process.env.JWT_ACCESS_EXPIRES_IN  || '15m';
const REFRESH_EXP    = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Generate a short-lived access token.
 * @param {object} payload  - { id, role }
 * @returns {string} JWT
 */
const generateAccessToken = (payload) =>
  jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXP });

/**
 * Generate a long-lived refresh token.
 * @param {object} payload  - { id, role }
 * @returns {string} JWT
 */
const generateRefreshToken = (payload) =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXP });

/**
 * Verify a JWT and return decoded payload.
 * @param {string} token
 * @param {'access'|'refresh'} type
 * @returns {object} decoded payload
 * @throws {JsonWebTokenError|TokenExpiredError}
 */
const verifyToken = (token, type = 'access') => {
  const secret = type === 'refresh' ? REFRESH_SECRET : ACCESS_SECRET;
  return jwt.verify(token, secret);
};

module.exports = { generateAccessToken, generateRefreshToken, verifyToken };
