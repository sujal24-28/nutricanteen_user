'use strict';

const adminService = require('../services/admin.service');
const { successResponse } = require('../utils/response.util');

const getDashboard = async (req, res, next) => {
  try {
    const data = await adminService.getDashboard();
    return successResponse(res, data);
  } catch (err) { next(err); }
};

const listStudents = async (req, res, next) => {
  try {
    const data = await adminService.listStudents(req.query);
    return successResponse(res, data);
  } catch (err) { next(err); }
};

const getStudent = async (req, res, next) => {
  try {
    const data = await adminService.getStudent(req.params.id);
    return successResponse(res, data);
  } catch (err) { next(err); }
};

const creditWallet = async (req, res, next) => {
  try {
    const { amount, description } = req.body;
    const result = await adminService.creditWallet(req.params.id, parseFloat(amount), description);
    return successResponse(res, result, result.message);
  } catch (err) { next(err); }
};

const debitWallet = async (req, res, next) => {
  try {
    const { amount, description } = req.body;
    const result = await adminService.debitWallet(req.params.id, parseFloat(amount), description);
    return successResponse(res, result, result.message);
  } catch (err) { next(err); }
};

const toggleStudentStatus = async (req, res, next) => {
  try {
    const result = await adminService.toggleStudentStatus(req.params.id);
    return successResponse(res, result, 'Student status updated');
  } catch (err) { next(err); }
};

const createAdmin = async (req, res, next) => {
  try {
    const admin = await adminService.createAdmin(req.body);
    return successResponse(res, admin, 'Admin created', 201);
  } catch (err) { next(err); }
};

module.exports = { getDashboard, listStudents, getStudent, creditWallet, debitWallet, toggleStudentStatus, createAdmin };
