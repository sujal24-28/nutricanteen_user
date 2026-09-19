'use strict';

const cartService = require('../services/cart.service');
const { successResponse } = require('../utils/response.util');

const getCart = async (req, res, next) => {
  try {
    const data = await cartService.getCart(req.user.id);
    return successResponse(res, data);
  } catch (err) { next(err); }
};

const upsertItem = async (req, res, next) => {
  try {
    const { item_id, quantity } = req.body;
    const cartItem = await cartService.upsertCartItem(req.user.id, item_id, quantity);
    return successResponse(res, cartItem, 'Cart updated', 200);
  } catch (err) { next(err); }
};

const removeItem = async (req, res, next) => {
  try {
    await cartService.removeCartItem(req.user.id, req.params.itemId);
    return successResponse(res, null, 'Item removed from cart');
  } catch (err) { next(err); }
};

const clearCart = async (req, res, next) => {
  try {
    await cartService.clearCart(req.user.id);
    return successResponse(res, null, 'Cart cleared');
  } catch (err) { next(err); }
};

module.exports = { getCart, upsertItem, removeItem, clearCart };
