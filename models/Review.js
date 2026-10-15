const mongoose = require('mongoose')
const { withCode } = require('./common')

const reviewSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  customerId: String,
  staffId: String,
  status: { type: String, default: 'Pending' },
  requestedAt: Date,
  completedAt: Date,
}, { timestamps: true })

withCode(reviewSchema)
module.exports = mongoose.model('Review', reviewSchema)
