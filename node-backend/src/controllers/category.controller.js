'use strict';

const categoryService = require('../services/category.service');
const { successResponse } = require('../utils/response.util');

const listCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.listCategories();
    return successResponse(res, categories);
  } catch (err) {
    next(err);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    return successResponse(res, category, 'Category created successfully', 201);
  } catch (err) {
    next(err);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const result = await categoryService.deleteCategory(req.params.id);
    return successResponse(res, result, 'Category deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listCategories,
  createCategory,
  deleteCategory,
};
