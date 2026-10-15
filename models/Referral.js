const mongoose = require('mongoose')
const { withCode } = require('./common')

const referralSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  referrerId: String,
  referredName: String,
  referredMobile: String,
  date: { type: Date, default: Date.now },
  converted: { type: Boolean, default: false },
  reward: { type: Number, default: 500 },
  rewardStatus: { type: String, default: 'Pending' },
  staffId: String,
}, { timestamps: true })

withCode(referralSchema)
module.exports = mongoose.model('Referral', referralSchema)
