'use strict';

/**
 * 404 Not Found middleware.
 * Registered after all routes so it only fires when nothing matched.
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = notFound;
