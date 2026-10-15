const mongoose = require('mongoose')
const { withCode } = require('./common')

const campaignSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  name: String,
  bucket: String,
  templateId: String,
  createdBy: String,
  customerIds: [String],
}, { timestamps: true })

withCode(campaignSchema)
module.exports = mongoose.model('Campaign', campaignSchema)
