'use strict';

const path     = require('path');
const fs       = require('fs');
const { Op }   = require('sequelize');
const { MenuItem } = require('../models');
const { parsePagination, paginationMeta } = require('../utils/pagination.util');
const { uploadToCloudinary } = require('../utils/cloudinary.util');

/**
 * List available menu items with optional category filter and search.
 */
const listItems = async (query) => {
  const { page, limit, offset } = parsePagination(query);
  const where = {};

  if (query.available !== 'false') where.is_available = true; // default: only available
  if (query.category)              where.category = query.category;
  if (query.search) {
    where.name = { [Op.like]: `%${query.search}%` };
  }

  const rows = await MenuItem.findAll({
    where,
    order:  [['category', 'ASC'], ['name', 'ASC']],
    limit,
    offset,
  });

  return {
    items: rows,
  };
};

/**
 * Get single menu item.
 */
const getItem = async (id) => {
  const item = await MenuItem.findByPk(id);
  if (!item) {
    const err = new Error('Menu item not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
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
    description:  data.description,
    price:        parseFloat(data.price),
    mrp:          data.mrp ? parseFloat(data.mrp) : null,
    category:     data.category || 'General',
    food_type:    data.food_type || 'veg',
    is_available: data.is_available !== 'false',
    daily_limit:  data.daily_limit ? parseInt(data.daily_limit, 10) : null,
    image_url:    imageUrl,
  });

  return item;
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
    price:        data.price        ? parseFloat(data.price) : item.price,
    mrp:          data.mrp !== undefined ? (data.mrp ? parseFloat(data.mrp) : null) : item.mrp,
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

  return item;
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
};

module.exports = { listItems, getItem, createItem, updateItem, deleteItem };
