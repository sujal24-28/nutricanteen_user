'use strict';

const { Op }       = require('sequelize');
const { sequelize } = require('../config/database');
const { Student, WalletTransaction } = require('../models');
const { generateOtp, hashOtp, compareOtp }      = require('../utils/otp.util');
const { sendOtpViaMSG91 }                        = require('../utils/msg91.util');
const { parsePagination, paginationMeta }        = require('../utils/pagination.util');

const OTP_TTL_MINUTES  = parseInt(process.env.OTP_EXPIRES_MINUTES, 10) || 10;
const MAX_TOPUP        = parseFloat(process.env.WALLET_MAX_TOPUP) || 5000;
const MIN_TOPUP        = parseFloat(process.env.WALLET_MIN_TOPUP) || 10;
const MAX_OTP_ATTEMPTS = 5;

/**
 * Get wallet balance and paginated transaction history.
 */
const getWallet = async (studentId, query) => {
  const student = await Student.findByPk(studentId, {
    attributes: ['id', 'name', 'wallet_balance'],
  });
  if (!student) {
    const err = new Error('Student not found');
    err.statusCode = 404;
    throw err;
  }

  const { page, limit, offset } = parsePagination(query);

  const { count, rows } = await WalletTransaction.findAndCountAll({
    where:  { student_id: studentId },
    order:  [['created_at', 'DESC']],
    limit,
    offset,
  });

  return {
    wallet_balance: parseFloat(student.wallet_balance),
    transactions:   rows,
    meta:           paginationMeta(count, page, limit),
  };
};

const crypto = require('crypto');
const razorpay = require('../config/razorpay');

/**
 * Create a Razorpay Order for wallet topup
 */
const createTopupOrder = async (studentId, amount) => {
  if (amount < MIN_TOPUP || amount > MAX_TOPUP) {
    const err = new Error(`Top-up amount must be between ₹${MIN_TOPUP} and ₹${MAX_TOPUP}`);
    err.statusCode = 400;
    throw err;
  }

  const student = await Student.findByPk(studentId);
  if (!student) {
    const err = new Error('Student not found');
    err.statusCode = 404;
    throw err;
  }

  if (!razorpay) {
    const err = new Error('Payment service is not configured');
    err.statusCode = 503;
    throw err;
  }

  const options = {
    amount: Math.round(amount * 100), // Razorpay amount is in paise
    currency: 'INR',
    receipt: `rcpt_stu_${studentId}_${Date.now()}`,
    notes: { student_id: String(studentId) },
  };

  const order = await razorpay.orders.create(options);

  return {
    order_id: order.id,
    amount: amount,
    currency: order.currency,
  };
};

/**
 * Verify Razorpay payment signature and credit wallet.
 */
const verifyTopupPayment = async (studentId, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount) => {
  if (!razorpay || !process.env.RAZORPAY_KEY_SECRET) {
    const err = new Error('Payment service is not configured');
    err.statusCode = 503;
    throw err;
  }

  // Verify the Razorpay signature using the server-side secret.
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
  const receivedBuffer = Buffer.from(String(razorpay_signature), 'utf8');
  if (expectedBuffer.length !== receivedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
    const err = new Error('Invalid payment signature');
    err.statusCode = 400;
    throw err;
  }

  // Never trust the amount supplied by the browser. Verify both the order
  // and payment with Razorpay before crediting the wallet.
  const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
  const razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);
  const expectedPaise = Number(razorpayOrder.amount);

  if (razorpayOrder.status !== 'paid' || razorpayPayment.order_id !== razorpay_order_id || razorpayPayment.status !== 'captured') {
    const err = new Error('Payment has not been captured');
    err.statusCode = 400;
    throw err;
  }

  if (Number(razorpayPayment.amount) !== expectedPaise) {
    const err = new Error('Payment amount mismatch');
    err.statusCode = 400;
    throw err;
  }

  const verifiedAmount = expectedPaise / 100;
  if (razorpayOrder.notes?.student_id && String(razorpayOrder.notes.student_id) !== String(studentId)) {
    const err = new Error('Payment does not belong to this student');
    err.statusCode = 403;
    throw err;
  }

  // Idempotency: do not credit the same payment twice.
  const existing = await WalletTransaction.findOne({
    where: { ref_id: `payment:${razorpay_payment_id}` },
  });
  if (existing) {
    return {
      message: 'Payment already processed',
      amount_credited: parseFloat(existing.amount),
      new_wallet_balance: parseFloat(existing.balance_after),
      payment_id: razorpay_payment_id,
    };
  }

  // 🔒 Atomic: credit wallet + record transaction 🔒
  let newBalance;
  await sequelize.transaction(async (t) => {
    // Lock student row
    const s = await Student.findByPk(studentId, { lock: true, transaction: t });
    if (!s) {
      const err = new Error('Student not found');
      err.statusCode = 404;
      throw err;
    }

    newBalance = parseFloat(s.wallet_balance) + verifiedAmount;

    await s.update({ wallet_balance: newBalance }, { transaction: t });

    await WalletTransaction.create({
      student_id:    studentId,
      type:          'credit',
      amount:        verifiedAmount,
      balance_after: newBalance,
      ref_id:        `payment:${razorpay_payment_id}`,
      description:   `Wallet top-up via Razorpay (Txn ID: ${razorpay_payment_id})`,
    }, { transaction: t });
  });

  return {
    message:           'Wallet topped up successfully',
    amount_credited:   verifiedAmount,
    new_wallet_balance: newBalance,
    payment_id:        razorpay_payment_id,
  };
};

module.exports = { getWallet, createTopupOrder, verifyTopupPayment };
