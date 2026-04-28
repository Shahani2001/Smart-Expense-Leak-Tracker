const express = require('express');
const Expense = require('../models/Expense');
const authMiddleware = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

const router = express.Router();
const allowedCategories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Shopping', 'Health', 'Other'];

const expenseValidation = [
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('category').isIn(allowedCategories).withMessage('Invalid category'),
  body('note').optional().isString().trim().isLength({ max: 300 }).withMessage('Note cannot exceed 300 characters'),
];

// Add expense
router.post('/', authMiddleware, expenseValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, category, note } = req.body;

    const expense = new Expense({
      userId: req.userId,
      amount,
      category,
      note,
    });

    await expense.save();
    res.status(201).json({ message: 'Expense added', expense });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user expenses
router.get('/', authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.userId }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get expense by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense || expense.userId.toString() !== req.userId) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update expense
router.put('/:id', authMiddleware, expenseValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, category, note } = req.body;
    const existingExpense = await Expense.findById(req.params.id);

    if (!existingExpense || existingExpense.userId.toString() !== req.userId) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    existingExpense.amount = amount;
    existingExpense.category = category;
    existingExpense.note = note;
    const expense = await existingExpense.save();

    res.json({ message: 'Expense updated', expense });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete expense
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense || expense.userId.toString() !== req.userId) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await expense.deleteOne();
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
