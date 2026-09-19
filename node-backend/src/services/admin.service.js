'use strict';

const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { Student, Admin, Order, WalletTransaction } = require('../models');
const { parsePagination, paginationMeta } = require('../utils/pagination.util');

/**
 * List all students with optional search.
 */
const listStudents = async (query) => {
  const { page, limit, offset } = parsePagination(query);
  const where = {};

  if (query.search) {
    where[Op.or] = [
      { name:    { [Op.like]: `%${query.search}%` } },
      { phone:   { [Op.like]: `%${query.search}%` } },
      { class:   { [Op.like]: `%${query.search}%` } },
      { section: { [Op.like]: `%${query.search}%` } },
    ];
  }
  if (query.class)   where.class   = query.class;
  if (query.section) where.section = query.section;

  const { count, rows } = await Student.findAndCountAll({
    where,
    attributes: ['id', 'name', 'class', 'roll', 'section', 'phone', 'wallet_balance', 'is_active', 'created_at'],
    order:      [['class', 'ASC'], ['section', 'ASC'], ['roll', 'ASC']],
    limit,
    offset,
  });

  return { students: rows, meta: paginationMeta(count, page, limit) };
};

/**
 * Get a single student with their wallet summary.
 */
const getStudent = async (studentId) => {
  const student = await Student.findByPk(studentId, {
    attributes: ['id', 'name', 'class', 'roll', 'section', 'phone', 'wallet_balance', 'is_active'],
  });
  if (!student) {
    const err = new Error('Student not found');
    err.statusCode = 404;
    throw err;
  }

  const orderCount = await Order.count({ where: { student_id: studentId } });
  const totalSpent = await WalletTransaction.sum('amount', {
    where: { student_id: studentId, type: 'debit' },
  });

  return {
    ...student.toJSON(),
    order_count:  orderCount,
    total_spent:  parseFloat(totalSpent || 0),
  };
};

/**
 * Manually credit a student's wallet (superadmin only).
 */
const creditWallet = async (studentId, amount, description) => {
  if (!amount || amount <= 0) {
    const err = new Error('Invalid amount');
    err.statusCode = 400;
    throw err;
  }

  let newBalance;
  await sequelize.transaction(async (t) => {
    const student = await Student.findByPk(studentId, { lock: true, transaction: t });
    if (!student) {
      const err = new Error('Student not found');
      err.statusCode = 404;
      throw err;
    }
    newBalance = parseFloat(student.wallet_balance) + parseFloat(amount);

    await student.update({ wallet_balance: newBalance }, { transaction: t });
    await WalletTransaction.create({
      student_id:    studentId,
      type:          'credit',
      amount:        parseFloat(amount),
      balance_after: newBalance,
      description:   description || `Admin manual credit`,
    }, { transaction: t });
  });

  return { message: 'Wallet credited successfully', new_balance: newBalance };
};

/**
 * Manually debit a student's wallet (admin or superadmin).
 */
const debitWallet = async (studentId, amount, description) => {
  if (!amount || amount <= 0) {
    const err = new Error('Invalid amount');
    err.statusCode = 400;
    throw err;
  }

  let newBalance;
  await sequelize.transaction(async (t) => {
    const student = await Student.findByPk(studentId, { lock: true, transaction: t });
    if (!student) {
      const err = new Error('Student not found');
      err.statusCode = 404;
      throw err;
    }
    
    if (parseFloat(student.wallet_balance) < parseFloat(amount)) {
      const err = new Error('Insufficient wallet balance');
      err.statusCode = 400;
      throw err;
    }
    
    newBalance = parseFloat(student.wallet_balance) - parseFloat(amount);

    await student.update({ wallet_balance: newBalance }, { transaction: t });
    await WalletTransaction.create({
      student_id:    studentId,
      type:          'debit',
      amount:        parseFloat(amount),
      balance_after: newBalance,
      description:   description || `Admin manual debit / Counter purchase`,
    }, { transaction: t });
  });

  return { message: 'Wallet debited successfully', new_balance: newBalance };
};

/**
 * Toggle student active/inactive.
 */
const toggleStudentStatus = async (studentId) => {
  const student = await Student.findByPk(studentId);
  if (!student) {
    const err = new Error('Student not found');
    err.statusCode = 404;
    throw err;
  }
  student.is_active = !student.is_active;
  await student.save();
  return { is_active: student.is_active };
};

/**
 * Dashboard summary statistics.
 */
const getDashboard = async () => {
  const [
    totalStudents,
    totalOrders,
    pendingOrders,
    totalRevenue,
  ] = await Promise.all([
    Student.count(),
    Order.count(),
    Order.count({ where: { status: ['pending', 'confirmed'] } }),
    WalletTransaction.sum('amount', { where: { type: 'debit' } }),
  ]);

  return {
    total_students:  totalStudents,
    total_orders:    totalOrders,
    pending_orders:  pendingOrders,
    total_revenue:   parseFloat(totalRevenue || 0),
  };
};

/**
 * Create a new admin account (superadmin only).
 */
const createAdmin = async ({ name, email, password, role }) => {
  const existing = await Admin.findOne({ where: { email } });
  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }
  const salt         = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);
  const admin = await Admin.create({ name, email, password_hash: passwordHash, role: role || 'staff' });
  return { id: admin.id, name: admin.name, email: admin.email, role: admin.role };
};

module.exports = {
  listStudents,
  getStudent,
  creditWallet,
  debitWallet,
  toggleStudentStatus,
  getDashboard,
  createAdmin,
};
