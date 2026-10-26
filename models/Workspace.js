const mongoose = require('mongoose')

const workspaceSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'main' },
  rates: {
    k24: { type: Number, default: 7240 },
    k22: { type: Number, default: 6640 },
    k18: { type: Number, default: 5430 },
    updatedAt: { type: Date, default: Date.now },
  },
  targets: { type: mongoose.Schema.Types.Mixed, default: {} },
  automations: { type: [mongoose.Schema.Types.Mixed], default: [] },
  settings: {
    reviewLink: { type: String, default: '' },
    city: { type: String, default: 'Sangli, Maharashtra' },
    receipt: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
}, { timestamps: true })

module.exports = mongoose.model('Workspace', workspaceSchema)
