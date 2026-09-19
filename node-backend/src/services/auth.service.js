'use strict';

const bcrypt      = require('bcryptjs');
const crypto      = require('crypto');
const { Op }      = require('sequelize');

const { Student, Admin, OtpRecord, RefreshToken } = require('../models');
const { generateOtp, hashOtp, compareOtp }        = require('../utils/otp.util');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/jwt.util');
const { sendOtpViaMSG91 } = require('../utils/msg91.util');

const OTP_TTL_MINUTES = parseInt(process.env.OTP_EXPIRES_MINUTES, 10) || 10;
const MAX_OTP_ATTEMPTS = 5;

/* ──────────────────────────────────────────────────────
   STUDENT AUTH
   ────────────────────────────────────────────────────── */

/**
 * Register a new student.
 */
const registerStudent = async ({ name, studentClass, roll, section, phone }, file) => {
  // Check uniqueness of composite identity
  const existing = await Student.findOne({
    where: { name, class: studentClass, roll, section },
  });
  if (existing) {
    const err = new Error('A student with this name, class, roll, and section already exists');
    err.statusCode = 409;
    throw err;
  }

  // Check phone uniqueness
  const phoneExists = await Student.findOne({ where: { phone } });
  if (phoneExists) {
    const err = new Error('This phone number is already registered');
    err.statusCode = 409;
    throw err;
  }

  const avatar = file ? `/uploads/${file.filename}` : null;

  const student = await Student.create({
    name,
    class:   studentClass,
    roll,
    section,
    phone,
    avatar,
    wallet_balance: 0.00,
  });

  return sanitizeStudent(student);
};

/**
 * Send login OTP to a student's phone.
 */
const sendStudentOtp = async (phone) => {
  let student = await Student.findOne({ where: { phone } });
  
  if (!student) {
    const err = new Error('No student registered with this phone number');
    err.statusCode = 404;
    throw err;
  }

  if (!student.is_active) {
    const err = new Error('Your account has been deactivated. Contact admin.');
    err.statusCode = 403;
    throw err;
  }

  // Invalidate any previous unused OTPs for this phone
  await OtpRecord.update(
    { is_used: true },
    { where: { phone, purpose: 'login', is_used: false } }
  );

  const otp      = generateOtp();
  const otpHash  = await hashOtp(otp);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await OtpRecord.create({
    phone,
    otp_hash:   otpHash,
    purpose:    'login',
    expires_at: expiresAt,
  });

  const msgStatus = await sendOtpViaMSG91(phone, otp, 'login');

  return { 
    message: `OTP sent to ${phone}. Valid for ${OTP_TTL_MINUTES} minutes.`,
    sms_dispatched: msgStatus.sms_dispatched,
    debug_otp: msgStatus.debug_otp 
  };
};

/**
 * Verify student OTP and issue tokens.
 */
const verifyStudentOtp = async (phone, otp) => {
  const student = await Student.findOne({ where: { phone } });
  if (!student) {
    const err = new Error('Student not found');
    err.statusCode = 404;
    throw err;
  }

  const otpRecord = await OtpRecord.findOne({
    where: {
      phone,
      purpose:   'login',
      is_used:   false,
      expires_at: { [Op.gt]: new Date() },
    },
    order: [['created_at', 'DESC']],
  });

  if (!otpRecord) {
    const err = new Error('OTP expired or not found. Please request a new OTP.');
    err.statusCode = 400;
    throw err;
  }

  // Increment attempts
  otpRecord.attempts += 1;
  if (otpRecord.attempts > MAX_OTP_ATTEMPTS) {
    otpRecord.is_used = true;
    await otpRecord.save();
    const err = new Error('Too many failed attempts. Please request a new OTP.');
    err.statusCode = 429;
    throw err;
  }

  const valid = await compareOtp(otp, otpRecord.otp_hash);
  if (!valid) {
    await otpRecord.save();
    const remaining = MAX_OTP_ATTEMPTS - otpRecord.attempts;
    const err = new Error(`Invalid OTP. ${remaining} attempt(s) remaining.`);
    err.statusCode = 400;
    throw err;
  }

  // Mark OTP as used
  otpRecord.is_used = true;
  await otpRecord.save();

  // Issue tokens
  const payload      = { id: student.id, role: 'student' };
  const accessToken  = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Store hashed refresh token
  await _storeRefreshToken(student.id, 'student', refreshToken);

  return {
    accessToken,
    refreshToken,
    student: sanitizeStudent(student),
    is_new_user: student.name === 'New Student'
  };
};

/**
 * Refresh student access token.
 */
const refreshStudentToken = async (rawRefreshToken) => {
  return _refreshToken(rawRefreshToken, 'student');
};

/**
 * Logout student — revoke refresh token.
 */
const logoutStudent = async (rawRefreshToken) => {
  await _revokeRefreshToken(rawRefreshToken);
};

/* ──────────────────────────────────────────────────────
   ADMIN AUTH
   ────────────────────────────────────────────────────── */

/**
 * Admin login with email + password.
 */
const adminLogin = async (identifier, password) => {
  const admin = await Admin.findOne({ 
    where: { 
      [Op.or]: [{ email: identifier }, { phone: identifier }],
      is_active: true 
    } 
  });
  if (!admin) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const match = await bcrypt.compare(password, admin.password_hash);
  if (!match) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const payload      = { id: admin.id, role: admin.role };
  const accessToken  = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await _storeRefreshToken(admin.id, 'admin', refreshToken);

  return {
    accessToken,
    refreshToken,
    admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
  };
};

const refreshAdminToken = async (rawRefreshToken) => _refreshToken(rawRefreshToken, 'admin');
const logoutAdmin       = async (rawRefreshToken) => _revokeRefreshToken(rawRefreshToken);

/* ──────────────────────────────────────────────────────
   PRIVATE HELPERS
   ────────────────────────────────────────────────────── */

async function _storeRefreshToken(ownerId, ownerType, rawToken) {
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const decoded   = verifyToken(rawToken, 'refresh');
  const expiresAt = new Date(decoded.exp * 1000);

  // Revoke old tokens for this owner (single session per device can be enforced here)
  await RefreshToken.update(
    { is_revoked: true },
    { where: { owner_id: ownerId, owner_type: ownerType, is_revoked: false } }
  );

  await RefreshToken.create({ owner_id: ownerId, owner_type: ownerType, token_hash: tokenHash, expires_at: expiresAt });
}

async function _refreshToken(rawRefreshToken, ownerType) {
  let decoded;
  try {
    decoded = verifyToken(rawRefreshToken, 'refresh');
  } catch {
    const err = new Error('Invalid or expired refresh token');
    err.statusCode = 401;
    throw err;
  }

  const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
  const record    = await RefreshToken.findOne({
    where: {
      token_hash:  tokenHash,
      owner_type:  ownerType,
      is_revoked:  false,
      expires_at:  { [Op.gt]: new Date() },
    },
  });

  if (!record) {
    const err = new Error('Refresh token not found or revoked');
    err.statusCode = 401;
    throw err;
  }

  // Rotate: revoke old and issue new
  record.is_revoked = true;
  await record.save();

  const payload         = { id: decoded.id, role: decoded.role };
  const newAccessToken  = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  await _storeRefreshToken(decoded.id, ownerType, newRefreshToken);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

async function _revokeRefreshToken(rawRefreshToken) {
  const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
  await RefreshToken.update(
    { is_revoked: true },
    { where: { token_hash: tokenHash } }
  );
}

const sanitizeStudent = (s) => ({
  id:             s.id,
  name:           s.name,
  class:          s.class,
  roll:           s.roll,
  section:        s.section,
  phone:          s.phone,
  avatar:         s.avatar,
  wallet_balance: parseFloat(s.wallet_balance),
  is_active:      s.is_active,
  created_at:     s.created_at,
});

const checkUser = async (phone) => {
  const admin = await Admin.findOne({ where: { phone, is_active: true } });
  if (admin) return { type: 'admin', role: admin.role };

  const student = await Student.findOne({ where: { phone, is_active: true } });
  if (student) return { type: 'student' };

  return { type: 'new_user' };
};

module.exports = {
  checkUser,
  registerStudent,
  sendStudentOtp,
  verifyStudentOtp,
  refreshStudentToken,
  logoutStudent,
  adminLogin,
  refreshAdminToken,
  logoutAdmin,
};
