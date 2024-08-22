const mongoose = require('mongoose')

const notesSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  } 
})

const expenseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Rent/Mortgage','Subscription', 'Groceries', 'Dining Out', 'Entertainment', 'Credit Card', 'Misc'],
  },
  notes: [notesSchema],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
},
{timestamps: true}
)

const budgetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  expense: [expenseSchema],

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
})

const Budget = mongoose.model('Budget', budgetSchema)

module.exports = Budget