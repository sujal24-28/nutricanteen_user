'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const School = sequelize.define('School', {
  id: {
    type:          DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey:    true,
  },
  name: {
    type:      DataTypes.STRING(150),
    allowNull: false,
  },
  address: {
    type:      DataTypes.TEXT,
    allowNull: true,
  },
  is_active: {
    type:         DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  tableName: 'schools',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = School;
