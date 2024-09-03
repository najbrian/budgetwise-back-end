const express = require('express')
const Budget = require('../models/budget')
const router = express.Router({ mergeParams: true })

router.get('/:expenseId', async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.budgetId).populate(['owner', 'expense.owner', 'expense.notes.owner'])
    const expense = budget.expense.id(req.params.expenseId)
    if (!expense) return res.status(404).send('Expense not found!!!!!!!');
    res.status(200).json(expense)
  } catch (error) {
    console.error('Error fetching expense:', error)
    res.status(500).json(error)
  }
});

router.post('/', async (req, res) => {
  try {
    req.body.owner = req.user._id
    const budget = await Budget.findById(req.params.budgetId).populate('owner')
    budget.expense.push(req.body)
    await budget.save()

    const newExpense = budget.expense[budget.expense.length - 1]
    newExpense._doc.owner = req.user

    res.status(201).json(newExpense)
  } catch (error) {
    res.status(500).json(error)
  }
})

router.put('/:expenseId', async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.budgetId)
    const updatedExpense = await budget.expense.id(req.params.expenseId)
    updatedExpense.name = req.body.name
    updatedExpense.amount = req.body.amount
    updatedExpense.type = req.body.type
    await budget.save()
    res.status(200).json(updatedExpense)
  } catch (error) {
    res.status(500).json(error)
  }
})

router.delete('/:expenseId', async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.budgetId)
    budget.expense.remove({ _id: req.params.expenseId })
    await budget.save()
    res.status(200).json({ message: 'Delete Successful' })
  } catch (error) {
    res.status(500).json(error)
  }
})

router.post('/:expenseId/notes', async (req, res) => {
  try {
    req.body.owner = req.user._id
    const budget = await Budget.findById(req.params.budgetId)
    const expense = budget.expense.id(req.params.expenseId)
    expense.notes.push(req.body)
    await budget.save()
    const newNote = expense.notes[expense.notes.length - 1]
    newNote._doc.owner = req.user
    res.status(201).json(newNote)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
})

router.put('/:expenseId/notes/:noteId', async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.budgetId)
    const expense = await budget.expense.id(req.params.expenseId)
    if (!expense.owner.equals(req.user._id)) {
      return res.status(403).send('You are not allowed to make changes to this expense.')
    }
    const updatedExpenseNote = expense.notes.id(req.params.noteId)
    updatedExpenseNote.text = req.body.text
    await budget.save()
    res.status(200).json({message: "Note Updated"})
  } catch (error) {
    res.status(500).json(error)
  }
})

router.delete('/:expenseId/notes/:noteId', async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.budgetId)
    const expense = await budget.expense.id(req.params.expenseId)
    if (!expense.owner.equals(req.user._id)) {
      return res.status(403).send('You are not allowed to make changes to this expense.')
    }
    if (!expense.notes.id({ _id: req.params.noteId})) {
      return res.status(404).send('This note does not exist')
    }
    expense.notes.remove({ _id: req.params.noteId})
    await budget.save()
    res.status(200).json(budget)
  } catch (error) {
    res.status(500).json(error)
  }
})

module.exports = router