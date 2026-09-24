'use strict';

const { Student } = require('../models');

/**
 * Get student profile by ID.
 */
const getProfile = async (studentId) => {
  const student = await Student.findByPk(studentId, {
    attributes: ['id', 'name', 'class', 'roll', 'section', 'phone', 'wallet_balance', 'is_active', 'created_at'],
  });
  if (!student) {
    const err = new Error('Student not found');
    err.statusCode = 404;
    throw err;
  }
  return student;
};

/**
 * Update student profile (name, class, section, roll, phone).
 */
const updateProfile = async (studentId, data) => {
  const student = await Student.findByPk(studentId);
  if (!student) {
    const err = new Error('Student not found');
    err.statusCode = 404;
    throw err;
  }

  const { phone, name, className, class: cls, class_name, section, rollNo, roll, roll_no } = data;

  if (phone && phone !== student.phone) {
    const conflict = await Student.findOne({ where: { phone } });
    if (conflict) {
      const err = new Error('Phone number already in use');
      err.statusCode = 409;
      throw err;
    }
    student.phone = phone;
  }

  if (name) student.name = name;
  if (className || cls || class_name) student.class = className || cls || class_name;
  if (section) student.section = section;
  if (rollNo || roll || roll_no) student.roll = rollNo || roll || roll_no;

  await student.save();
  return student;
};

module.exports = { getProfile, updateProfile };
