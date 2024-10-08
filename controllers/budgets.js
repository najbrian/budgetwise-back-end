const express = require('express');
const verifyToken = require('../middleware/verify-token.js');
const Budget = require('../models/budget.js')
const User = require('../models/user.js')
const router = express.Router();
const expenseRouter = require('./expenses.js')

// ========== Public Routes ===========

// ========= Protected Routes =========
router.use(verifyToken);
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
    const budgets = await Budget.find({$or: [{owner: req.user._id}, {canEdit: req.user._id}]})
      .populate('owner')
      .populate('canEdit')
      .sort({ createdAt: 'desc' })

      const users = await User.find({_id: { $ne: req.user._id}})
    res.status(200).json({budgets, users})
  } catch (error) {
    res.status(500).json(error)
  }
})

router.get('/:budgetId', async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.budgetId).populate(['owner', 'canEdit', 'expense.owner', 'expense.notes.owner'])
    res.status(200).json(budget)
  } catch (error) {
    res.status(500).json(error)
    console.log(error)
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

router.use('/:budgetId/expenses', expenseRouter)

module.exports = router
