const Purchase = require('../models/Purchase')
const Loan = require('../models/Loan')
const { nextCode } = require('../services/access')

const factors = { '24K (995)': 0.995, '22K (916)': 0.916, '20K (833)': 0.833, '18K (750)': 0.75 }

async function listPurchases(_req, res) {
  res.json(await Purchase.find().sort({ date: -1 }))
}

async function createPurchase(req, res) {
  const net = Number(req.body.netWeight) || 0
  const rate = Number(req.body.rate) || 0
  const deduction = Number(req.body.deduction) || 0
  const grossValue = Math.round(net * rate)
  const row = await Purchase.create({
    ...req.body,
    code: await nextCode(Purchase, 'DG-GP-'),
    staffId: req.body.staffId || req.user.code,
    date: req.body.date || new Date(),
    grossValue,
    finalPayable: grossValue - deduction,
  })
  res.status(201).json(row)
}

async function listLoans(_req, res) {
  res.json(await Loan.find().sort({ startDate: -1 }))
}

async function createLoan(req, res) {
  const factor = factors[req.body.purity] || 0.916
  const suggested = Math.round(Number(req.body.weight || 0) * Number(req.body.rate || 0) * factor * 0.75)
  const row = await Loan.create({
    ...req.body,
    code: await nextCode(Loan, 'DG-LN-'),
    staffId: req.body.staffId || req.user.code,
    loanAmount: Number(req.body.loanAmount) || suggested,
    startDate: req.body.startDate || new Date(),
    payments: [],
  })
  res.status(201).json(row)
}

async function addPayment(req, res) {
  const loan = await Loan.findOne({ code: req.params.id })
  if (!loan) return res.status(404).json({ message: 'Loan not found' })
  loan.payments.push({
    id: `pay-${Date.now()}`,
    date: req.body.date || new Date(),
    amount: Number(req.body.amount) || 0,
    mode: req.body.mode || 'UPI',
    note: req.body.note || '',
  })
  const paid = loan.payments.reduce((sum, payment) => sum + payment.amount, 0)
  if (paid >= loan.loanAmount) loan.status = 'Closed'
  await loan.save()
  res.json(loan)
}

async function setStatus(req, res) {
  const loan = await Loan.findOne({ code: req.params.id })
  if (!loan) return res.status(404).json({ message: 'Loan not found' })
  loan.status = req.body.status
  await loan.save()
  res.json(loan)
}

module.exports = { listPurchases, createPurchase, listLoans, createLoan, addPayment, setStatus }
