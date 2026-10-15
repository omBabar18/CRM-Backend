const Staff = require('../models/Staff')
const Workspace = require('../models/Workspace')
const bcrypt = require('bcryptjs')
const { permissionsFor, can, nextCode } = require('../services/access')

async function workspace() {
  return Workspace.findOne({ key: 'main' })
}

async function listStaff(_req, res) {
  res.json(await Staff.find().sort({ name: 1 }))
}

async function createStaff(req, res) {
  if (!can(req.user, 'manageStaff')) return res.status(403).json({ message: 'Your role cannot open this module' })
  if (await Staff.findOne({ mobile: req.body.mobile })) return res.status(409).json({ message: 'Mobile already exists' })
  const row = await Staff.create({
    code: await nextCode(Staff, 's'),
    name: req.body.name,
    mobile: req.body.mobile,
    password: await bcrypt.hash(req.body.password || 'gold123', 10),
    role: req.body.role,
    active: true,
    permissions: permissionsFor(req.body.role),
  })
  res.status(201).json(row)
}

async function updateStaff(req, res) {
  if (!can(req.user, 'manageStaff')) return res.status(403).json({ message: 'Your role cannot open this module' })
  const row = await Staff.findOne({ code: req.params.id })
  if (!row) return res.status(404).json({ message: 'Employee not found' })
  if (req.body.role && req.body.role !== row.role) req.body.permissions = permissionsFor(req.body.role)
  if (req.body.password) req.body.password = await bcrypt.hash(req.body.password, 10)
  Object.assign(row, req.body)
  await row.save()
  res.json(row)
}

async function removeStaff(req, res) {
  if (!can(req.user, 'manageStaff')) return res.status(403).json({ message: 'Your role cannot open this module' })
  if (req.params.id === req.user.code) return res.status(400).json({ message: 'You cannot remove your own account' })
  await Staff.deleteOne({ code: req.params.id })
  res.json({ ok: true })
}

async function getWorkspace(_req, res) {
  res.json(await workspace())
}

async function updateRates(req, res) {
  if (!can(req.user, 'setTargets')) return res.status(403).json({ message: 'Your role cannot open this module' })
  const doc = await workspace()
  doc.rates = { ...doc.rates.toObject(), ...req.body, updatedAt: new Date() }
  await doc.save()
  res.json(doc.rates)
}

async function updateTargets(req, res) {
  if (!can(req.user, 'setTargets')) return res.status(403).json({ message: 'Your role cannot open this module' })
  const doc = await workspace()
  doc.targets = req.body
  doc.markModified('targets')
  await doc.save()
  res.json(doc.targets)
}

async function toggleAutomation(req, res) {
  if (!can(req.user, 'setTargets') && req.user.role !== 'Admin') return res.status(403).json({ message: 'Your role cannot open this module' })
  const doc = await workspace()
  const rule = doc.automations.find((item) => item.id === req.params.id)
  if (!rule) return res.status(404).json({ message: 'Rule not found' })
  rule.enabled = !rule.enabled
  doc.markModified('automations')
  await doc.save()
  res.json(doc.automations)
}

module.exports = { listStaff, createStaff, updateStaff, removeStaff, getWorkspace, updateRates, updateTargets, toggleAutomation }
