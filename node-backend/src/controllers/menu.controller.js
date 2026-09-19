'use strict';

const menuService = require('../services/menu.service');
const { successResponse } = require('../utils/response.util');

const listItems = async (req, res, next) => {
  try {
    const data = await menuService.listItems(req.query);
    return successResponse(res, data);
  } catch (err) { next(err); }
};

const getItem = async (req, res, next) => {
  try {
    const item = await menuService.getItem(req.params.id);
    return successResponse(res, item);
  } catch (err) { next(err); }
};

const createItem = async (req, res, next) => {
  try {
    const item = await menuService.createItem(req.body, req.file);
    return successResponse(res, item, 'Menu item created', 201);
  } catch (err) { next(err); }
};

const updateItem = async (req, res, next) => {
  try {
    const item = await menuService.updateItem(req.params.id, req.body, req.file);
    return successResponse(res, item, 'Menu item updated');
  } catch (err) { next(err); }
};

const deleteItem = async (req, res, next) => {
  try {
    await menuService.deleteItem(req.params.id);
    return successResponse(res, null, 'Menu item deleted');
  } catch (err) { next(err); }
};

module.exports = { listItems, getItem, createItem, updateItem, deleteItem };
