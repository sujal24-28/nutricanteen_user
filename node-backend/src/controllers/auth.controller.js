'use strict';

const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response.util');

/* ── Student Auth ── */

const register = async (req, res, next) => {
  try {
    const { name, class: studentClass, roll, section, phone } = req.body;
    const student = await authService.registerStudent({ name, studentClass, roll, section, phone }, req.file);
    return successResponse(res, student, 'Student registered successfully', 201);
  } catch (err) { next(err); }
};

const sendStudentOtp = async (req, res, next) => {
  try {
    const result = await authService.sendStudentOtp(req.body.phone);
    return successResponse(res, result, result.message);
  } catch (err) { next(err); }
};

const verifyStudentOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    const tokens = await authService.verifyStudentOtp(phone, otp);
    return successResponse(res, tokens, 'Login successful');
  } catch (err) { next(err); }
};

const refreshStudentToken = async (req, res, next) => {
  try {
    const tokens = await authService.refreshStudentToken(req.body.refresh_token);
    return successResponse(res, tokens, 'Token refreshed');
  } catch (err) { next(err); }
};

const logoutStudent = async (req, res, next) => {
  try {
    await authService.logoutStudent(req.body.refresh_token);
    return successResponse(res, null, 'Logged out successfully');
  } catch (err) { next(err); }
};

/* ── Admin Auth ── */

const adminLogin = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const tokens = await authService.adminLogin(identifier, password);
    return successResponse(res, tokens, 'Admin login successful');
  } catch (err) { next(err); }
};

const refreshAdminToken = async (req, res, next) => {
  try {
    const tokens = await authService.refreshAdminToken(req.body.refresh_token);
    return successResponse(res, tokens, 'Token refreshed');
  } catch (err) { next(err); }
};

const logoutAdmin = async (req, res, next) => {
  try {
    await authService.logoutAdmin(req.body.refresh_token);
    return successResponse(res, null, 'Logged out successfully');
  } catch (err) { next(err); }
};

const checkUser = async (req, res, next) => {
  try {
    const result = await authService.checkUser(req.body.phone);
    return successResponse(res, result, 'User type checked');
  } catch (err) { next(err); }
};

module.exports = {
  checkUser,
  register, sendStudentOtp, verifyStudentOtp, refreshStudentToken, logoutStudent,
  adminLogin, refreshAdminToken, logoutAdmin,
};
