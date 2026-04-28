const express = require('express');
const Expense = require('../models/Expense');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get category-based spending insights
router.get('/category-breakdown', authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.userId });
    
    const categoryBreakdown = {};
    expenses.forEach(expense => {
      if (!categoryBreakdown[expense.category]) {
        categoryBreakdown[expense.category] = 0;
      }
      categoryBreakdown[expense.category] += expense.amount;
    });

    res.json(categoryBreakdown);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get total spending
router.get('/total-spending', authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.userId });
    const totalSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const count = expenses.length;

    res.json({ totalSpending, count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Detect repeated small expenses (expense leaks)
router.get('/leak-detection', authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.userId });
    
    const leaks = [];
    const threshold = 50; // Small expenses under $50
    
    // Group by category and find repeated small expenses
    const categoryExpenses = {};
    expenses.forEach(expense => {
      if (!categoryExpenses[expense.category]) {
        categoryExpenses[expense.category] = [];
      }
      categoryExpenses[expense.category].push(expense);
    });

    // Analyze for leaks
    Object.keys(categoryExpenses).forEach(category => {
      const categoryExps = categoryExpenses[category];
      const smallExpenses = categoryExps.filter(e => e.amount < threshold);
      
      if (smallExpenses.length > 2) {
        const totalLeak = smallExpenses.reduce((sum, e) => sum + e.amount, 0);
        leaks.push({
          category,
          count: smallExpenses.length,
          totalAmount: totalLeak,
          averageAmount: (totalLeak / smallExpenses.length).toFixed(2),
          message: `You have ${smallExpenses.length} small expenses in ${category} totaling $${totalLeak.toFixed(2)}`,
        });
      }
    });

    res.json(leaks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Identify unusual spending spikes
router.get('/spending-spikes', authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.userId }).sort({ date: -1 });
    
    if (expenses.length < 2) {
      return res.json([]);
    }

    // Calculate average
    const average = expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length;
    const stdDev = Math.sqrt(
      expenses.reduce((sum, e) => sum + Math.pow(e.amount - average, 2), 0) / expenses.length
    );

    // Detect spikes (amounts > average + 2 * stdDev)
    const spikes = expenses.filter(e => e.amount > average + 2 * stdDev);

    res.json({
      average: average.toFixed(2),
      standardDeviation: stdDev.toFixed(2),
      spikes: spikes.map(spike => ({
        ...spike.toObject(),
        deviationFromAverage: (spike.amount - average).toFixed(2),
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
