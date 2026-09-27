'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Banner = sequelize.define('Banner', {
  id: {
    type:          DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey:    true,
  },
  image_url: {
    type:      DataTypes.STRING(500),
    allowNull: true,
  },
  title: {
    type:         DataTypes.STRING(150),
    allowNull:    true,
    defaultValue: 'Fresh & Nutritious Meals',
  },
  subtitle: {
    type:         DataTypes.STRING(255),
    allowNull:    true,
    defaultValue: 'Hygienic and wholesome food prepared fresh daily!',
  },
  is_active: {
    type:         DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'banners',
  timestamps: true,
});

module.exports = Banner;
