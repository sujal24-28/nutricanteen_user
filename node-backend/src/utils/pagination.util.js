'use strict';

const DEFAULT_PAGE  = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT     = 100;

/**
 * Parse pagination query parameters from a request.
 * @param {object} query - req.query
 * @returns {{ page: number, limit: number, offset: number }}
 */
const parsePagination = (query = {}) => {
  const page  = Math.max(1, parseInt(query.page,  10) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

/**
 * Build a paginated response meta object.
 * @param {number} totalCount
 * @param {number} page
 * @param {number} limit
 * @returns {{ total: number, page: number, limit: number, totalPages: number }}
 */
const paginationMeta = (totalCount, page, limit) => ({
  total:      totalCount,
  page,
  limit,
  totalPages: Math.ceil(totalCount / limit),
});

module.exports = { parsePagination, paginationMeta };
