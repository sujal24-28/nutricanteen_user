'use strict';

const { sequelize }  = require('../config/database');
const { Student, MenuItem, Cart, Order, OrderItem, WalletTransaction } = require('../models');
const { parsePagination, paginationMeta } = require('../utils/pagination.util');

/**
 * Place an order from the student's current cart.
 * Atomically: deduct wallet + create order + clear cart.
 */
const placeOrder = async (studentId, { pickupTime, note, items } = {}) => {
  // Prefer an explicit order payload so checkout does not require
  // DELETE cart + N POST /cart calls before placing the order.
  let cartItems;

  if (Array.isArray(items) && items.length > 0) {
    const normalized = items
      .map((item) => ({
        item_id: Number(item.menu_item_id),
        quantity: Number(item.quantity),
      }))
      .filter((item) => Number.isInteger(item.item_id) && item.item_id > 0 && Number.isInteger(item.quantity) && item.quantity > 0);

    if (normalized.length !== items.length) {
      const err = new Error('Invalid order items');
      err.statusCode = 400;
      throw err;
    }

    const menuItems = await MenuItem.findAll({
      where: { id: normalized.map((item) => item.item_id) },
    });

    const byId = new Map(menuItems.map((item) => [item.id, item]));
    cartItems = normalized.map((item) => ({
      item_id: item.item_id,
      quantity: item.quantity,
      menuItem: byId.get(item.item_id),
    }));
  } else {
    cartItems = await Cart.findAll({
      where: { student_id: studentId },
      include: [{ model: MenuItem, as: 'menuItem' }],
    });
  }

  if (!cartItems.length) {
    const err = new Error('Your cart is empty');
    err.statusCode = 400;
    throw err;
  }

  for (const c of cartItems) {
    if (!c.menuItem || !c.menuItem.is_available) {
      const err = new Error(`"${c.menuItem?.name || 'An item'}" is no longer available`);
      err.statusCode = 400;
      throw err;
    }
  }

  const total = cartItems.reduce(
    (sum, c) => sum + parseFloat(c.menuItem.price) * c.quantity,
    0
  );

  let createdOrder;

  await sequelize.transaction(async (t) => {
    const student = await Student.findByPk(studentId, { lock: true, transaction: t });

    if (!student) {
      const err = new Error('Student not found');
      err.statusCode = 404;
      throw err;
    }

    if (parseFloat(student.wallet_balance) < total) {
      const err = new Error(
        `Insufficient wallet balance. Required: ₹${total.toFixed(2)}, Available: ₹${parseFloat(student.wallet_balance).toFixed(2)}`
      );
      err.statusCode = 402;
      throw err;
    }

    const newBalance = parseFloat(student.wallet_balance) - total;
    await student.update({ wallet_balance: newBalance }, { transaction: t });

    createdOrder = await Order.create({
      student_id: studentId,
      total_amount: total,
      status: 'pending',
      pickup_time: pickupTime || null,
      note: note || null,
    }, { transaction: t });

    await OrderItem.bulkCreate(
      cartItems.map((c) => ({
        order_id: createdOrder.id,
        item_id: c.item_id,
        quantity: c.quantity,
        unit_price: parseFloat(c.menuItem.price),
      })),
      { transaction: t }
    );

    await WalletTransaction.create({
      student_id: studentId,
      type: 'debit',
      amount: total,
      balance_after: newBalance,
      ref_id: String(createdOrder.id),
      description: `Order #${createdOrder.id}`,
    }, { transaction: t });

    // Clear the legacy server cart only when this order came from it.
    if (!Array.isArray(items) || items.length === 0) {
      await Cart.destroy({ where: { student_id: studentId }, transaction: t });
    }
  });

  return getOrder(createdOrder.id, studentId);
};

/**
 * List orders. Students see only their own; admins see all.
 */
const listOrders = async (query, user) => {
  const { page, limit, offset } = parsePagination(query);
  const where = {};

  if (user.role === 'student') where.student_id = user.id;
  if (query.status)            where.status      = query.status;

  const { count, rows } = await Order.findAndCountAll({
    where,
    include: [
      {
        model: OrderItem,
        as:    'items',
        include: [{ model: MenuItem, as: 'menuItem', attributes: ['id', 'name'] }],
      },
    ],
    order:  [['created_at', 'DESC']],
    limit,
    offset,
  });

  return { orders: rows, meta: paginationMeta(count, page, limit) };
};

/**
 * Get a single order by ID.
 * Students can only access their own orders.
 */
const getOrder = async (orderId, studentIdOrNull = null) => {
  const where = { id: orderId };
  if (studentIdOrNull) where.student_id = studentIdOrNull;

  const order = await Order.findOne({
    where,
    include: [
      {
        model: OrderItem,
        as:    'items',
        include: [{ model: MenuItem, as: 'menuItem', attributes: ['id', 'name', 'image_url'] }],
      },
      {
        model:      Student,
        as:         'student',
        attributes: ['id', 'name', 'class', 'roll', 'section', 'phone'],
      },
    ],
  });

  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }
  return order;
};

/**
 * Update order status (admin only).
 */
const updateStatus = async (orderId, newStatus) => {
  const VALID_TRANSITIONS = {
    pending:   ['accepted', 'confirmed', 'cancelled'],
    accepted:  ['ready', 'delivered', 'cancelled'],
    confirmed: ['ready', 'cancelled'],
    ready:     ['delivered'],
    delivered: [],
    cancelled: [],
  };

  const order = await Order.findByPk(orderId);
  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  const allowed = VALID_TRANSITIONS[order.status] || [];
  if (!allowed.includes(newStatus)) {
    const err = new Error(
      `Cannot transition order from '${order.status}' to '${newStatus}'`
    );
    err.statusCode = 400;
    throw err;
  }

  order.status = newStatus;
  await order.save();
  return order;
};

/**
 * Cancel an order (student, only if pending).
 * Refunds wallet.
 */
const cancelOrder = async (orderId, studentId) => {
  const order = await Order.findOne({
    where: { id: orderId, student_id: studentId },
  });

  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  if (order.status !== 'pending') {
    const err = new Error(`Cannot cancel an order that is '${order.status}'`);
    err.statusCode = 400;
    throw err;
  }

  await sequelize.transaction(async (t) => {
    const student    = await Student.findByPk(studentId, { lock: true, transaction: t });
    const newBalance = parseFloat(student.wallet_balance) + parseFloat(order.total_amount);

    await student.update({ wallet_balance: newBalance }, { transaction: t });

    await WalletTransaction.create({
      student_id:    studentId,
      type:          'credit',
      amount:        parseFloat(order.total_amount),
      balance_after: newBalance,
      ref_id:        String(orderId),
      description:   `Refund for cancelled Order #${orderId}`,
    }, { transaction: t });

    order.status       = 'cancelled';
    order.cancelled_at = new Date();
    order.cancel_reason = 'Cancelled by student';
    await order.save({ transaction: t });
  });

  return order;
};

module.exports = { placeOrder, listOrders, getOrder, updateStatus, cancelOrder };
