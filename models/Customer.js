const mongoose = require('mongoose')
const { withCode } = require('./common')

const customerSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  name: { type: String, required: true, trim: true },
  mobile: { type: String, required: true },
  alternate: { type: String, default: '' },
  location: { type: String, default: 'Sangli' },
  address: { type: String, default: '' },
  email: { type: String, default: '' },
  assignedTo: { type: String, default: '' },
  since: { type: Date, default: Date.now },
  kyc: {
    status: { type: String, default: 'Pending' },
    aadhaar: { type: String, default: '' },
    pan: { type: String, default: '' },
    idProof: { type: String, default: '' },
    idNumber: { type: String, default: '' },
  },
  notes: [{
    id: String,
    text: String,
    staffId: String,
    at: Date,
  }],
}, { timestamps: true })

withCode(customerSchema)
module.exports = mongoose.model('Customer', customerSchema)
