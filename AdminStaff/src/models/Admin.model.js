'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Admin = sequelize.define('Admin', {
  id: {
    type:          DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey:    true,
  },
  name: {
    type:      DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type:      DataTypes.STRING(150),
    allowNull: true,
    unique:    true,
  },
  phone: {
    type:      DataTypes.STRING(15),
    allowNull: true,
    unique:    true,
  },
  password_hash: {
    type:      DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type:         DataTypes.ENUM('superadmin', 'staff'),
    defaultValue: 'staff',
  },
  is_active: {
    type:         DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'admins',
});

module.exports = Admin;
