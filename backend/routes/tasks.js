const express = require('express');
const { body } = require('express-validator');
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All task routes are protected
router.use(protect);

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed'])
    .withMessage('Invalid status value'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority value'),
  body('due_date').optional({ checkFalsy: true }).isDate().withMessage('Invalid date format'),
];

router.route('/').get(getTasks).post(taskValidation, createTask);
router.route('/:id').get(getTask).put(taskValidation, updateTask).delete(deleteTask);

module.exports = router;
