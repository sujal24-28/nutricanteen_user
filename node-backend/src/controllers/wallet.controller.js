'use strict';

const walletService = require('../services/wallet.service');
const { successResponse } = require('../utils/response.util');

const getWallet = async (req, res, next) => {
  try {
    const data = await walletService.getWallet(req.user.id, req.query);
    return successResponse(res, data);
  } catch (err) { next(err); }
};

const createOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const result = await walletService.createTopupOrder(req.user.id, parseFloat(amount));
    // Provide key ID to frontend as well
    result.key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey';
    return successResponse(res, result, 'Order created');
  } catch (err) { next(err); }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
    const result = await walletService.verifyTopupPayment(
      req.user.id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      parseFloat(amount)
    );
    return successResponse(res, result, result.message);
  } catch (err) { next(err); }
};

module.exports = { getWallet, createOrder, verifyPayment };
