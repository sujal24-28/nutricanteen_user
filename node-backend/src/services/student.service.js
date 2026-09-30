'use strict';

const { Student, School } = require('../models');

/**
 * Get student profile by ID with associated school details.
 */
const getProfile = async (studentId) => {
  const student = await Student.findByPk(studentId, {
    attributes: ['id', 'name', 'class', 'roll', 'section', 'phone', 'wallet_balance', 'is_active', 'school_id', 'created_at'],
    include: [{ model: School, as: 'school', attributes: ['id', 'name', 'address'] }]
  });
  if (!student) {
    const err = new Error('Student not found');
    err.statusCode = 404;
    throw err;
  }
  const s = student.toJSON();
  return {
    ...s,
    school_id: s.school_id || null,
    school_name: s.school?.name || null,
    school: s.school ? { id: s.school.id, name: s.school.name, address: s.school.address } : null,
  };
};

/**
 * Update student profile (name, class, section, roll, phone, school_id).
 */
const updateProfile = async (studentId, data) => {
  const student = await Student.findByPk(studentId);
  if (!student) {
    const err = new Error('Student not found');
    err.statusCode = 404;
    throw err;
  }

  const { phone, name, className, class: cls, class_name, section, rollNo, roll, roll_no, school_id, city_id, schoolId } = data;

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

  const targetSchoolId = school_id !== undefined ? school_id : (city_id !== undefined ? city_id : schoolId);
  if (targetSchoolId !== undefined && targetSchoolId !== null) {
    student.school_id = parseInt(targetSchoolId, 10) || null;
  }

  await student.save();
  return getProfile(studentId);
};

module.exports = { getProfile, updateProfile };
