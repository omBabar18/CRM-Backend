const mongoose = require('mongoose')
const { withCode } = require('./common')

const staffSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  name: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  active: { type: Boolean, default: true },
  permissions: {
    viewAllLeads: Boolean,
    manageStaff: Boolean,
    setTargets: Boolean,
    viewReports: Boolean,
    manageFinance: Boolean,
  },
}, { timestamps: true })

withCode(staffSchema)
module.exports = mongoose.model('Staff', staffSchema)
