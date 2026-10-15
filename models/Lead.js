const mongoose = require('mongoose')
const { withCode } = require('./common')

const leadSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  name: { type: String, required: true, trim: true },
  mobile: { type: String, required: true },
  alternate: { type: String, default: '' },
  location: { type: String, default: 'Sangli' },
  source: { type: String, default: 'Walk-in' },
  requirement: { type: String, default: 'Sell Gold' },
  expectedAmount: { type: Number, default: 0 },
  goldWeight: { type: Number, default: 0 },
  assignedTo: { type: String, default: '' },
  status: { type: String, default: 'New' },
  priority: { type: String, default: 'Medium' },
  createdAt: { type: Date, default: Date.now },
  lastContact: Date,
  nextFollowUp: Date,
  notes: { type: String, default: '' },
  lastOutcome: { type: String, default: '' },
  customerId: { type: String, default: null },
  convertedAt: Date,
  timeline: [{
    id: String,
    at: Date,
    type: String,
    text: String,
    outcome: String,
    staffId: String,
  }],
}, { timestamps: { createdAt: 'savedAt', updatedAt: 'updatedAt' } })

withCode(leadSchema)
module.exports = mongoose.model('Lead', leadSchema)
