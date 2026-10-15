const mongoose = require('mongoose')
const { withCode } = require('./common')

const taskSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  type: String,
  title: { type: String, required: true },
  leadId: String,
  customerId: String,
  staffId: String,
  due: Date,
  status: { type: String, default: 'Open' },
  notes: { type: String, default: '' },
}, { timestamps: true })

withCode(taskSchema)
module.exports = mongoose.model('Task', taskSchema)
