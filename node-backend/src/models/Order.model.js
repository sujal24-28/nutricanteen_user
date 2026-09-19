'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type:          DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey:    true,
  },
  student_id: {
    type:      DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: { model: 'students', key: 'id' },
  },
  total_amount: {
    type:      DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type:         DataTypes.ENUM('pending', 'accepted', 'confirmed', 'ready', 'delivered', 'cancelled'),
    defaultValue: 'pending',
  },
  pickup_time: {
    type:      DataTypes.DATE,
    allowNull: true,
    comment:   'Requested pickup time set by student at order time',
  },
  note: {
    type:      DataTypes.STRING(300),
    allowNull: true,
    comment:   'Optional note to canteen (e.g. no onions)',
  },
  cancelled_at: {
    type:      DataTypes.DATE,
    allowNull: true,
  },
  cancel_reason: {
    type:      DataTypes.STRING(200),
    allowNull: true,
  },
}, {
  tableName: 'orders',
  indexes:   [{ fields: ['student_id'] }, { fields: ['status'] }],
});

module.exports = Order;
