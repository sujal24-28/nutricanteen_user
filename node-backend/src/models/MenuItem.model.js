'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MenuItem = sequelize.define('MenuItem', {
  id: {
    type:          DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey:    true,
  },
  name: {
    type:      DataTypes.STRING(150),
    allowNull: false,
  },
  description: {
    type:      DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type:      DataTypes.DECIMAL(8, 2),
    allowNull: false,
    validate:  { min: 0 },
  },
  category: {
    type:         DataTypes.STRING(50),
    allowNull:    false,
    defaultValue: 'General',
    comment:      'e.g. Breakfast, Lunch, Snacks, Beverages',
  },
  image_url: {
    type:      DataTypes.STRING(500),
    allowNull: true,
  },
  is_available: {
    type:         DataTypes.BOOLEAN,
    defaultValue: true,
  },
  daily_limit: {
    type:      DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    comment:   'Max units available per day; NULL = unlimited',
  },
  deleted_at: {
    type:      DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'menu_items',
  paranoid:  true,
});

module.exports = MenuItem;
