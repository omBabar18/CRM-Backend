const mongoose = require('mongoose')
const { withCode } = require('./common')

const activitySchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  type: String,
  staffId: String,
  leadId: String,
  at: { type: Date, default: Date.now },
  outcome: String,
}, { timestamps: true })

withCode(activitySchema)
module.exports = mongoose.model('Activity', activitySchema)
