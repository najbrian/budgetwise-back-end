const express = require('express');
const verifyToken = require('../middleware/verify-token.js');
const Budget = require('../models/budget.js')
const router = express.Router();
const expenseRouter = require('./expenses.js')

// ========== Public Routes ===========

// ========= Protected Routes =========
router.use(verifyToken);
//create budget//
router.post('/', async (req, res) => {
  try {
    req.body.owner = req.user._id
    const newBudget = await Budget.create(req.body)
    newBudget._doc.owner = req.user
    res.status(201).json(newBudget)
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
})

router.get('/', async (req, res) => {
  try {
    const budgets = await Budget.find({owner: req.user._id})
      .populate('owner')
      .sort({ createdAt: 'desc' })
    res.status(200).json(budgets)
  } catch (error) {
    res.status(500).json(error)
  }
})

router.get('/:budgetId', async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.budgetId).populate('owner')
    res.status(200).json(budget)
  } catch (error) {
    res.status(500).json(error)
  }
})

router.put('/:budgetId', async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.budgetId)

    if (!budget.owner.equals(req.user._id)) {
      return res.status(403).send("You are not allowed to make changes to this budget.")
    }

    const updateBudget = await Budget.findByIdAndUpdate(
      req.params.budgetId,
      req.body,
      { new: true }
    )
    updateBudget._doc.owner = req.user
    res.status(200).json(updateBudget)
  } catch (error) {
    res.status(500).json(error)
  }
})

router.delete('/:budgetId', async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.budgetId)

    if (!budget.owner.equals(req.user._id)) {
      return res.status(403).send("You are not allowed to delete this budget.")
    }
    const deleteBudget= await Budget.findByIdAndDelete(req.params.budgetId)
    res.status(200).json(deleteBudget)
  } catch (error) {
    res.status(500).json(error)
  }
})

router.get('/:budgetId/expenses/:expenseId', async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.budgetId)
    const expense = budget.expense.id(req.params.expenseId)
    if (!expense) return res.status(404).send('Expense not found');
    res.status(200).json(expense)
  } catch (error) {
    console.error('Error fetching expense:', error)
    res.status(500).json(error)
  }
});

router.use('/:budgetId/expenses', expenseRouter)

module.exports = router
