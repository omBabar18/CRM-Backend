const Customer = require('../models/Customer')
const { seesAll, presentCustomer, nextCode } = require('../services/access')

function scope(user) {
  return seesAll(user) ? {} : { assignedTo: user.code }
}

async function list(req, res) {
  const rows = await Customer.find(scope(req.user)).sort({ since: -1 })
  res.json(rows.map((row) => presentCustomer(row, req.user)))
}

async function getOne(req, res) {
  const row = await Customer.findOne({ code: req.params.id, ...scope(req.user) })
  if (!row) return res.status(404).json({ message: 'Customer not found' })
  res.json(presentCustomer(row, req.user))
}

async function create(req, res) {
  if (!/^\d{10}$/.test(req.body.mobile || '')) return res.status(400).json({ message: 'Enter a 10-digit mobile number.' })
  if (await Customer.findOne({ mobile: req.body.mobile })) return res.status(409).json({ message: 'Mobile already exists' })
  const customer = await Customer.create({
    ...req.body,
    code: await nextCode(Customer, 'DG-C-'),
    assignedTo: req.body.assignedTo || req.user.code,
    since: new Date(),
    notes: [],
  })
  res.status(201).json(presentCustomer(customer, req.user))
}

async function update(req, res) {
  const row = await Customer.findOne({ code: req.params.id, ...scope(req.user) })
  if (!row) return res.status(404).json({ message: 'Customer not found' })
  if (req.body.kyc && !['Admin', 'Manager', 'Accountant'].includes(req.user.role)) delete req.body.kyc
  Object.assign(row, req.body)
  await row.save()
  res.json(presentCustomer(row, req.user))
}

async function addNote(req, res) {
  const row = await Customer.findOne({ code: req.params.id, ...scope(req.user) })
  if (!row) return res.status(404).json({ message: 'Customer not found' })
  row.notes.unshift({ id: `n-${Date.now()}`, text: req.body.text, staffId: req.user.code, at: new Date() })
  await row.save()
  res.json(presentCustomer(row, req.user))
}

module.exports = { list, getOne, create, update, addNote }
