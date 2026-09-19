'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RefreshToken = sequelize.define('RefreshToken', {
  id: {
    type:          DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey:    true,
  },
  // Polymorphic: belongs to either a student or admin
  owner_id: {
    type:      DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  owner_type: {
    type:      DataTypes.ENUM('student', 'admin'),
    allowNull: false,
  },
  token_hash: {
    type:      DataTypes.STRING(255),
    allowNull: false,
    unique:    true,
    comment:   'SHA-256 hash of the raw refresh token',
  },
  expires_at: {
    type:      DataTypes.DATE,
    allowNull: false,
  },
  is_revoked: {
    type:         DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'refresh_tokens',
  indexes:   [{ fields: ['owner_id', 'owner_type'] }],
});

module.exports = RefreshToken;
