'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Student = sequelize.define('Student', {
  id: {
    type:          DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey:    true,
  },
  name: {
    type:      DataTypes.STRING(100),
    allowNull: false,
    comment:   'Full name of the student',
  },
  class: {
    type:      DataTypes.STRING(20),
    allowNull: false,
    comment:   'e.g. 10, 11A, 12-Science',
  },
  roll: {
    type:      DataTypes.STRING(20),
    allowNull: false,
    comment:   'Roll number within the section',
  },
  section: {
    type:      DataTypes.STRING(10),
    allowNull: false,
    comment:   'e.g. A, B, C',
  },
  phone: {
    type:      DataTypes.STRING(15),
    allowNull: false,
    unique:    true,
    comment:   'Mobile number for OTP login',
  },
  avatar: {
    type:      DataTypes.STRING(255),
    allowNull: true,
    comment:   'Path to student avatar image',
  },
  wallet_balance: {
    type:         DataTypes.DECIMAL(10, 2),
    allowNull:    false,
    defaultValue: 0.00,
    comment:      'Current wallet balance in INR',
  },
  is_active: {
    type:         DataTypes.BOOLEAN,
    defaultValue: true,
  },
  deleted_at: {
    type:      DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName:   'students',
  paranoid:    true,           // soft-delete via deleted_at
  indexes: [
    {
      unique: true,
      fields: ['name', 'class', 'roll', 'section'],
      name:   'unique_student_identity',
    },
  ],
});

module.exports = Student;
