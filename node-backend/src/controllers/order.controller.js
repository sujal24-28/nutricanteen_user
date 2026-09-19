'use strict';

const orderService = require('../services/order.service');
const { successResponse } = require('../utils/response.util');

const placeOrder = async (req, res, next) => {
  try {
    const order = await orderService.placeOrder(req.user.id, req.body);
    return successResponse(res, order, 'Order placed successfully', 201);
  } catch (err) { next(err); }
};

const listOrders = async (req, res, next) => {
  try {
    const data = await orderService.listOrders(req.query, req.user);
    return successResponse(res, data);
  } catch (err) { next(err); }
};

const getOrder = async (req, res, next) => {
  try {
    // Students can only see their own orders
    const studentId = req.user.role === 'student' ? req.user.id : null;
    const order     = await orderService.getOrder(req.params.id, studentId);
    return successResponse(res, order);
  } catch (err) { next(err); }
};

const updateStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateStatus(req.params.id, req.body.status);
    return successResponse(res, order, 'Order status updated');
  } catch (err) { next(err); }
};

const cancelOrder = async (req, res, next) => {
  try {
    const order = await orderService.cancelOrder(req.params.id, req.user.id);
    return successResponse(res, order, 'Order cancelled and wallet refunded');
  } catch (err) { next(err); }
};

module.exports = { placeOrder, listOrders, getOrder, updateStatus, cancelOrder };
