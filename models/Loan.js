const mongoose = require('mongoose')
const { withCode } = require('./common')

const loanSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  customerId: String,
  staffId: String,
  description: { type: String, default: 'Pledged gold' },
  itemCount: { type: Number, default: 1 },
  weight: Number,
  grossWeight: Number,
  deductWeight: { type: Number, default: 0 },
  purity: String,
  rate: Number,
  loanAmount: Number,
  interestRate: Number,
  processingFee: { type: Number, default: 0 },
  scheme: { type: String, default: '' },
  frequency: { type: String, default: 'Bullet' },
  disburseMode: { type: String, default: '' },
  utr: { type: String, default: '' },
  address: { type: String, default: '' },
  alternate: { type: String, default: '' },
  kycType: { type: String, default: '' },
  kycNumber: { type: String, default: '' },
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
