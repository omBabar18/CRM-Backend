const mongoose = require('mongoose')
const { withCode } = require('./common')

const purchaseSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  customerId: String,
  staffId: String,
  leadId: String,
  date: { type: Date, default: Date.now },
  goldType: String,
  description: String,
  grossWeight: Number,
  netWeight: Number,
  stoneDeduct: { type: Number, default: null },
  purity: String,
  rate: Number,
  deduction: { type: Number, default: 0 },
  otherDeduction: { type: Number, default: 0 },
  adjustment: { type: Number, default: 0 },
  advance: { type: Number, default: 0 },
  grossValue: Number,
  finalPayable: Number,
  paymentMode: String,
  testMethod: { type: String, default: '' },
  testResult: { type: String, default: '' },
  remarks: { type: String, default: '' },
  utr: { type: String, default: '' },
  bank: { type: String, default: '' },
  address: { type: String, default: '' },
  alternate: { type: String, default: '' },
  idProof: { type: String, default: '' },
  idNumber: { type: String, default: '' },
  pan: { type: String, default: '' },
}, { timestamps: true })

withCode(purchaseSchema)
module.exports = mongoose.model('Purchase', purchaseSchema)
