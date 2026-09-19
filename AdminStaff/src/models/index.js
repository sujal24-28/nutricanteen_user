'use strict';

/**
 * Central models index.
 * Imports all models (registering them with Sequelize) and
 * defines all associations in one place.
 */

const Student            = require('./Student.model');
const Admin              = require('./Admin.model');
const OtpRecord          = require('./OtpRecord.model');
const MenuItem           = require('./MenuItem.model');
const Cart               = require('./Cart.model');
const Order              = require('./Order.model');
const OrderItem          = require('./OrderItem.model');
const WalletTransaction  = require('./WalletTransaction.model');
const RefreshToken       = require('./RefreshToken.model');

/* ─── Associations ─────────────────────────────────────── */

// Student ↔ Cart
Student.hasMany(Cart,   { foreignKey: 'student_id', as: 'cartItems' });
Cart.belongsTo(Student, { foreignKey: 'student_id' });

// MenuItem ↔ Cart
MenuItem.hasMany(Cart,  { foreignKey: 'item_id' });
Cart.belongsTo(MenuItem, { foreignKey: 'item_id', as: 'menuItem' });

// Student ↔ Order
Student.hasMany(Order,   { foreignKey: 'student_id', as: 'orders' });
Order.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

// Order ↔ OrderItem
Order.hasMany(OrderItem,    { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order,  { foreignKey: 'order_id' });

// MenuItem ↔ OrderItem
MenuItem.hasMany(OrderItem,    { foreignKey: 'item_id' });
OrderItem.belongsTo(MenuItem,  { foreignKey: 'item_id', as: 'menuItem' });

// Student ↔ WalletTransaction
Student.hasMany(WalletTransaction,   { foreignKey: 'student_id', as: 'transactions' });
WalletTransaction.belongsTo(Student, { foreignKey: 'student_id' });

module.exports = {
  Student,
  Admin,
  OtpRecord,
  MenuItem,
  Cart,
  Order,
  OrderItem,
  WalletTransaction,
  RefreshToken,
};
