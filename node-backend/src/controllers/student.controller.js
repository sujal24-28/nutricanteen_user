'use strict';

const studentService = require('../services/student.service');
const { successResponse } = require('../utils/response.util');

const getProfile = async (req, res, next) => {
  try {
    const student = await studentService.getProfile(req.user.id);
    return successResponse(res, student);
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const student = await studentService.updateProfile(req.user.id, req.body, req.file);
    return successResponse(res, student, 'Profile updated');
  } catch (err) { next(err); }
};

module.exports = { getProfile, updateProfile };
