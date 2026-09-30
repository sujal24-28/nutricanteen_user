'use strict';

const { Category, MenuItem } = require('../models');
const { Op } = require('sequelize');

const DEFAULT_CATEGORIES = [
  { name: 'Morning Recess', slug: 'breakfast', description: 'Quick breakfast & recess snacks' },
  { name: 'Hot Lunch Meals', slug: 'lunch', description: 'Fresh, warm, balanced lunches' },
  { name: 'Nutri-Snacks', slug: 'snacks', description: 'Healthy bites, wraps, and savory snacks' },
  { name: 'Fresh Drinks & Shakes', slug: 'drinks', description: 'Juices, shakes, smoothies, and water' },
  { name: 'Bakery & Sweets', slug: 'bakery', description: 'Fresh muffins, cookies, rolls, and cakes' },
  { name: 'General', slug: 'general', description: 'All-day general canteen meals' }
];

/**
 * List all active categories with associated menu item counts.
 * Auto-seeds default categories on first run if none exist.
 */
const listCategories = async () => {
  let categories = await Category.findAll({
    where: { is_active: true },
    order: [['name', 'ASC']]
  });

  if (categories.length === 0) {
    // Seed default categories
    for (const def of DEFAULT_CATEGORIES) {
      await Category.findOrCreate({
        where: { slug: def.slug },
        defaults: def
      });
    }

    // Also pick up any existing distinct categories from MenuItem table
    try {
      const distinctItems = await MenuItem.findAll({
        attributes: ['category'],
        group: ['category']
      });
      for (const item of distinctItems) {
        const rawCat = (item.category || '').trim();
        if (!rawCat) continue;
        const slug = rawCat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'general';
        const formattedName = rawCat.charAt(0).toUpperCase() + rawCat.slice(1);
        await Category.findOrCreate({
          where: { slug },
          defaults: {
            name: formattedName,
            slug,
            description: `${formattedName} items`
          }
        });
      }
    } catch (_) {}

    categories = await Category.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']]
    });
  }

  // Count items per category
  const counts = await MenuItem.findAll({
    attributes: ['category', [Category.sequelize.fn('COUNT', Category.sequelize.col('id')), 'count']],
    group: ['category']
  });
  const countMap = {};
  counts.forEach((c) => {
    const raw = c.category ? String(c.category).toLowerCase().trim() : '';
    countMap[raw] = parseInt(c.get('count'), 10) || 0;
  });

  return categories.map((cat) => {
    const cJson = cat.toJSON();
    const slugCount = countMap[cJson.slug.toLowerCase()] || 0;
    const nameCount = countMap[cJson.name.toLowerCase()] || 0;
    return {
      ...cJson,
      item_count: Math.max(slugCount, nameCount)
    };
  });
};

/**
 * Create a new category.
 */
const createCategory = async ({ name, slug, description }) => {
  const trimmedName = String(name || '').trim();
  if (!trimmedName) {
    const err = new Error('Category name is required');
    err.statusCode = 422;
    throw err;
  }

  const formattedName = trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1);
  const generatedSlug = String(slug || trimmedName)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'category';

  const existing = await Category.findOne({
    where: {
      [Op.or]: [
        { name: formattedName },
        { slug: generatedSlug }
      ]
    }
  });

  if (existing) {
    if (!existing.is_active) {
      existing.is_active = true;
      if (description) existing.description = description;
      await existing.save();
      return existing.toJSON();
    }
    const err = new Error(`Category "${formattedName}" already exists`);
    err.statusCode = 409;
    throw err;
  }

  const category = await Category.create({
    name: formattedName,
    slug: generatedSlug,
    description: description ? String(description).trim() : null,
    is_active: true
  });

  return category.toJSON();
};

/**
 * Delete a category by ID.
 * Reassigns items belonging to this category to 'General'.
 */
const deleteCategory = async (id) => {
  const category = await Category.findByPk(id);
  if (!category) {
    const err = new Error('Category not found');
    err.statusCode = 404;
    throw err;
  }

  // Reassign any menu items with this category to 'General'
  try {
    await MenuItem.update(
      { category: 'General' },
      {
        where: {
          [Op.or]: [
            { category: category.slug },
            { category: category.name }
          ]
        }
      }
    );
  } catch (_) {}

  await category.destroy();
  return { id: Number(id), deleted: true };
};

module.exports = {
  listCategories,
  createCategory,
  deleteCategory,
};
