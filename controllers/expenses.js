const express = require('express')
const Budget = require('../models/budget')
const router = express.Router({ mergeParams: true })

router.post('/', async (req, res) => {
  try {
    req.body.owner = req.user._id
    const budget = await Budget.findById(req.params.budgetId)
    budget.expense.push(req.body)
    await budget.save()

    const newExpense = budget.expense[budget.expense.length - 1]
    newExpense._doc.owner = req.user

    res.status(201).json(newExpense)
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

    const expenseNote = budget.expense.id(req.params.expenseId)
    const newNote = expenseNote.notes[expenseNote.notes.length - 1]
    newNote._doc.owner = req.user

    
    res.status(201).json(newNote)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  } 
})
module.exports = router