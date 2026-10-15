const mongoose = require('mongoose')
const { withCode } = require('./common')

const purchaseSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  customerId: String,
  staffId: String,
  leadId: String,
  date: { type: Date, default: Date.now },
  goldType: String,
  grossWeight: Number,
  netWeight: Number,
  purity: String,
  rate: Number,
  deduction: { type: Number, default: 0 },
  grossValue: Number,
  finalPayable: Number,
  paymentMode: String,
}, { timestamps: true })

withCode(purchaseSchema)
module.exports = mongoose.model('Purchase', purchaseSchema)
