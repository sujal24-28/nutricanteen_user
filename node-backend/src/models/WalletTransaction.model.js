'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WalletTransaction = sequelize.define('WalletTransaction', {
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
  type: {
    type:      DataTypes.ENUM('credit', 'debit'),
    allowNull: false,
  },
  amount: {
    type:      DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  balance_after: {
    type:      DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment:   'Wallet balance immediately after this transaction',
  },
  ref_id: {
    type:      DataTypes.STRING(100),
    allowNull: true,
    comment:   'Reference to order_id or topup request id',
  },
  description: {
    type:      DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName:  'wallet_transactions',
  updatedAt:  false,          // Immutable ledger — no updates
  indexes:    [{ fields: ['student_id'] }],
});

module.exports = WalletTransaction;
