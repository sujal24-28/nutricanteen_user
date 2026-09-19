'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type:          DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey:    true,
  },
  order_id: {
    type:      DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: { model: 'orders', key: 'id' },
    onDelete:   'CASCADE',
  },
  item_id: {
    type:      DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: { model: 'menu_items', key: 'id' },
  },
  quantity: {
    type:      DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
  },
  unit_price: {
    type:      DataTypes.DECIMAL(8, 2),
    allowNull: false,
    comment:   'Price at the time of order — snapshot to preserve history',
  },
}, {
  tableName:  'order_items',
  timestamps: false,
});

module.exports = OrderItem;
