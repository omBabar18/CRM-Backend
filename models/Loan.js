const mongoose = require('mongoose')
const { withCode } = require('./common')

const loanSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  customerId: String,
  staffId: String,
  weight: Number,
  purity: String,
  rate: Number,
  loanAmount: Number,
  interestRate: Number,
  processingFee: { type: Number, default: 0 },
  startDate: Date,
  dueDate: Date,
  status: { type: String, default: 'Active' },
  payments: [{
    id: String,
    date: Date,
    amount: Number,
    mode: String,
    note: String,
  }],
}, { timestamps: true })

withCode(loanSchema)
module.exports = mongoose.model('Loan', loanSchema)
