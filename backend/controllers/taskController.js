const { validationResult } = require('express-validator');
const { Task } = require('../models');
const { Op } = require('sequelize');

/**
 * @desc  Create a new task
 * @route POST /api/tasks
 * @access Private
 */
const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, description, priority, due_date } = req.body;

    const task = await Task.create({
      title,
      description,
      priority,
      due_date,
      user_id: req.user.id,
    });

    res.status(201).json({ success: true, message: 'Task created', task });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc  Get all tasks for logged-in user
 * @route GET /api/tasks
 * @access Private
 */
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, search, page = 1, limit = 20 } = req.query;
    const where = { user_id: req.user.id };

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) {
      where.title = { [Op.iLike]: `%${search}%` };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: tasks } = await Task.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      tasks,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc  Get single task by ID
 * @route GET /api/tasks/:id
 * @access Private
 */
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc  Update task
 * @route PUT /api/tasks/:id
 * @access Private
 */
const updateTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const task = await Task.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const { title, description, status, priority, due_date } = req.body;
    await task.update({ title, description, status, priority, due_date });

    res.json({ success: true, message: 'Task updated', task });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc  Delete task
 * @route DELETE /api/tasks/:id
 * @access Private
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await task.destroy();
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask };
