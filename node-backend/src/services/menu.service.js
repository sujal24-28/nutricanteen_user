'use strict';

const path     = require('path');
const fs       = require('fs');
const { Op }   = require('sequelize');
const { MenuItem } = require('../models');
const { parsePagination, paginationMeta } = require('../utils/pagination.util');
const { uploadToCloudinary } = require('../utils/cloudinary.util');
const { getCache, setCache, invalidateCache } = require('../utils/cache.util');
const { parseRupees } = require('../utils/money.util');

const MENU_ATTRIBUTES = [
  'id',
  'name',
  'description',
  'price',
  'mrp',
  'category',
  'food_type',
  'image_url',
  'is_available',
  'daily_limit',
  'created_at',
  'updated_at',
];

/**
 * List available menu items with optional category filter and search.
 * Cached in Redis with TTL (cache-aside pattern).
 */
const listItems = async (query = {}) => {
  const { page, limit, offset } = parsePagination(query);
  const bypassCache = !!query.t || !!query._t || !!query.nocache;
  const cacheKey = `cache:menu:list:${query.available || 'true'}:${query.category || 'all'}:${query.search || 'none'}:${page}:${limit}`;
  if (!bypassCache) {
    const cached = await getCache(cacheKey);
    if (cached) return cached;
  }

  const where = {};
  if (query.available !== 'false') where.is_available = true;
  if (query.category)              where.category = query.category;
  if (query.search) {
    const term = String(query.search).trim().slice(0, 50);
    where.name = { [Op.like]: `%${term}%` };
  }

  const { count, rows } = await MenuItem.findAndCountAll({
    attributes: MENU_ATTRIBUTES,
    where,
    order:  [['category', 'ASC'], ['name', 'ASC']],
    limit,
    offset,
  });

  const result = {
    items: rows.map((r) => ({
      ...r.toJSON(),
      price: parseRupees(r.price),
      mrp:   r.mrp ? parseRupees(r.mrp) : null,
    })),
    meta: paginationMeta(count, page, limit),
  };

  await setCache(cacheKey, result, 300); // 5 min TTL
  return result;
};

/**
 * Get single menu item.
 */
const getItem = async (id) => {
  const cacheKey = `cache:menu:item:${id}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const item = await MenuItem.findByPk(id, {
    attributes: MENU_ATTRIBUTES,
  });
  if (!item) {
    const err = new Error('Menu item not found');
    err.statusCode = 404;
    throw err;
  }

  const serialized = {
    ...item.toJSON(),
    price: parseRupees(item.price),
    mrp:   item.mrp ? parseRupees(item.mrp) : null,
  };

  await setCache(cacheKey, serialized, 300);
  return serialized;
};

/**
 * Create a new menu item (admin).
 */
const createItem = async (data, file) => {
  const imageUrl = file
    ? await uploadToCloudinary(file, 'nutricanteen/menu')
    : null;

  const formattedName = data.name
    ? data.name.trim().charAt(0).toUpperCase() + data.name.trim().slice(1)
    : data.name;

  const item = await MenuItem.create({
    name:         formattedName,
    description:  data.description || null,
    price:        parseRupees(data.price),
    mrp:          data.mrp ? parseRupees(data.mrp) : null,
    category:     data.category || 'General',
    food_type:    data.food_type || 'veg',
    is_available: data.is_available !== 'false',
    daily_limit:  data.daily_limit ? parseInt(data.daily_limit, 10) : null,
    image_url:    imageUrl,
  });

  await invalidateCache('cache:menu:*');
  return {
    ...item.toJSON(),
    price: parseRupees(item.price),
    mrp:   item.mrp ? parseRupees(item.mrp) : null,
  };
};

/**
 * Update a menu item (admin).
 */
const updateItem = async (id, data, file) => {
  const item = await MenuItem.findByPk(id);
  if (!item) {
    const err = new Error('Menu item not found');
    err.statusCode = 404;
    throw err;
  }

  if (file) {
    // Remove old image if exists
    if (item.image_url && item.image_url.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '..', '..', item.image_url);
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch (_) {}
      }
    }
    data.image_url = await uploadToCloudinary(file, 'nutricanteen/menu');
  }

  const formattedName = data.name !== undefined
    ? (data.name ? data.name.trim().charAt(0).toUpperCase() + data.name.trim().slice(1) : data.name)
    : item.name;

  await item.update({
    name:         formattedName,
    description:  data.description  ?? item.description,
    price:        data.price        ? parseRupees(data.price) : item.price,
    mrp:          data.mrp !== undefined ? (data.mrp ? parseRupees(data.mrp) : null) : item.mrp,
    category:     data.category     ?? item.category,
    food_type:    data.food_type    ?? item.food_type,
    is_available: data.is_available !== undefined
      ? data.is_available !== 'false'
      : item.is_available,
    daily_limit:  data.daily_limit  !== undefined
      ? (data.daily_limit ? parseInt(data.daily_limit, 10) : null)
      : item.daily_limit,
    image_url:    data.image_url    ?? item.image_url,
  });

  await invalidateCache('cache:menu:*');
  return {
    ...item.toJSON(),
    price: parseRupees(item.price),
    mrp:   item.mrp ? parseRupees(item.mrp) : null,
  };
};

/**
 * Soft-delete a menu item (admin).
 */
const deleteItem = async (id) => {
  const item = await MenuItem.findByPk(id);
  if (!item) {
    const err = new Error('Menu item not found');
    err.statusCode = 404;
    throw err;
  }
  await item.destroy(); // paranoid soft-delete
  await invalidateCache('cache:menu:*');
};

module.exports = { listItems, getItem, createItem, updateItem, deleteItem };
