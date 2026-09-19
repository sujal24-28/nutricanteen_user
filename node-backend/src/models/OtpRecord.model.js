'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OtpRecord = sequelize.define('OtpRecord', {
  id: {
    type:          DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey:    true,
  },
  phone: {
    type:      DataTypes.STRING(15),
    allowNull: false,
    comment:   '10-digit mobile number',
  },
  otp_hash: {
    type:      DataTypes.STRING(255),
    allowNull: false,
    comment:   'bcrypt hash of the OTP',
  },
  purpose: {
    type:      DataTypes.ENUM('login', 'topup'),
    allowNull: false,
  },
  expires_at: {
    type:      DataTypes.DATE,
    allowNull: false,
  },
  is_used: {
    type:         DataTypes.BOOLEAN,
    defaultValue: false,
  },
  attempts: {
    type:         DataTypes.TINYINT.UNSIGNED,
    defaultValue: 0,
    comment:      'Number of failed verify attempts',
  },
}, {
  tableName: 'otp_records',
  indexes: [
    { fields: ['phone', 'purpose'] },
  ],
});

module.exports = OtpRecord;
