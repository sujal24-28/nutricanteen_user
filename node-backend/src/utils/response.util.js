'use strict';

const logger = require('./logger.util');

/**
 * Send a standardized success JSON response.
 * @param {import('express').Response} res
 * @param {*}      data    - payload
 * @param {string} message - human-readable message
 * @param {number} statusCode - HTTP status (default 200)
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  const body = { success: true, message };
  if (data !== null && data !== undefined) body.data = data;
  return res.status(statusCode).json(body);
};

/**
 * Send a standardized error JSON response.
 * Automatically logs error info with user details to error.log.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} statusCode - HTTP status (default 400)
 * @param {Array}  errors     - validation error array (optional)
 */
const errorResponse = (res, message = 'An error occurred', statusCode = 400, errors = []) => {
  if (res && res.req && statusCode >= 400) {
    logger.logError(
      { name: 'ClientError', message, statusCode, errors },
      res.req,
      message
    );
  }
  const body = { success: false, message };
  if (errors && errors.length > 0) body.errors = errors;
  return res.status(statusCode).json(body);
};

module.exports = { successResponse, errorResponse };
