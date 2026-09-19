'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Cart = sequelize.define('Cart', {
  id: {
    type:          DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey:    true,
  },
  student_id: {
    type:      DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: { model: 'students', key: 'id' },
    onDelete:   'CASCADE',
  },
  item_id: {
    type:      DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: { model: 'menu_items', key: 'id' },
    onDelete:   'CASCADE',
  },
  quantity: {
    type:      DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
    defaultValue: 1,
    validate:  { min: 1, max: 20 },
  },
}, {
  tableName: 'carts',
  indexes: [
    { unique: true, fields: ['student_id', 'item_id'] },
  ],
});

module.exports = Cart;
