'use strict';

const { Cart, MenuItem } = require('../models');

/**
 * Get all cart items for a student.
 */
const getCart = async (studentId) => {
  const items = await Cart.findAll({
    where:   { student_id: studentId },
    include: [{ model: MenuItem, as: 'menuItem', attributes: ['id', 'name', 'price', 'image_url', 'is_available'] }],
    order:   [['created_at', 'ASC']],
  });

  const subtotal = items.reduce((sum, c) => {
    return sum + (parseFloat(c.menuItem?.price || 0) * c.quantity);
  }, 0);

  return { items, subtotal: parseFloat(subtotal.toFixed(2)) };
};

/**
 * Add a new item to cart or update quantity if already exists (upsert).
 */
const upsertCartItem = async (studentId, itemId, quantity) => {
  const menuItem = await MenuItem.findByPk(itemId);
  if (!menuItem || !menuItem.is_available) {
    const err = new Error('Menu item not available');
    err.statusCode = 400;
    throw err;
  }

  const [cartItem, created] = await Cart.findOrCreate({
    where:    { student_id: studentId, item_id: itemId },
    defaults: { quantity },
  });

  if (!created) {
    cartItem.quantity = quantity;
    await cartItem.save();
  }

  return cartItem;
};

/**
 * Remove a single item from cart.
 */
const removeCartItem = async (studentId, itemId) => {
  const deleted = await Cart.destroy({
    where: { student_id: studentId, item_id: itemId },
  });
  if (!deleted) {
    const err = new Error('Item not found in cart');
    err.statusCode = 404;
    throw err;
  }
};

/**
 * Clear the entire cart for a student.
 */
const clearCart = async (studentId) => {
  await Cart.destroy({ where: { student_id: studentId } });
};

module.exports = { getCart, upsertCartItem, removeCartItem, clearCart };
