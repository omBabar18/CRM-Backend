const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Staff = require('../models/Staff')
const { permissionsFor, nextCode } = require('../services/access')

const otps = new Map()

function sign(staff) {
  return jwt.sign({ staffId: staff.code }, process.env.JWT_SECRET || 'dggold-crm-dev-secret', { expiresIn: '7d' })
}

function payload(staff) {
  return { token: sign(staff), user: staff.toJSON() }
}

async function login(req, res) {
  const { mobile, password } = req.body
  const staff = await Staff.findOne({ mobile, active: true })
  if (!staff || !(await bcrypt.compare(password || '', staff.password))) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }
  res.json(payload(staff))
}

async function sendOtp(req, res) {
  const staff = await Staff.findOne({ mobile: req.body.mobile, active: true })
  if (!staff) return res.status(404).json({ message: 'No account uses this mobile number.' })
  otps.set(staff.mobile, { code: '1234', exp: Date.now() + 5 * 60 * 1000 })
  res.json({ message: 'OTP sent. Use 1234 for this demo.' })
}

async function verifyOtp(req, res) {
  const record = otps.get(req.body.mobile)
  if (!record || record.exp < Date.now() || record.code !== req.body.otp) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }
  const staff = await Staff.findOne({ mobile: req.body.mobile, active: true })
  if (!staff) return res.status(401).json({ message: 'Invalid credentials' })
  otps.delete(req.body.mobile)
  res.json(payload(staff))
}

async function signup(req, res) {
  const { name, mobile, password } = req.body
  if (!/^\d{10}$/.test(mobile || '')) return res.status(400).json({ message: 'Enter a 10-digit mobile number.' })
  if (await Staff.findOne({ mobile })) return res.status(409).json({ message: 'This mobile is already registered.' })
  const staff = await Staff.create({
    code: await nextCode(Staff, 's'),
    name,
    mobile,
    password: await bcrypt.hash(password || 'gold123', 10),
    role: 'Sales Executive',
    active: true,
    permissions: permissionsFor('Sales Executive'),
  })
  res.status(201).json(payload(staff))
}

async function resetPassword(req, res) {
  const record = otps.get(req.body.mobile)
  if (!record || record.code !== (req.body.otp || '1234')) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }
  const staff = await Staff.findOne({ mobile: req.body.mobile })
  if (!staff) return res.status(404).json({ message: 'No account uses this mobile number.' })
  staff.password = await bcrypt.hash(req.body.password, 10)
  await staff.save()
  otps.delete(req.body.mobile)
  res.json({ message: 'Password updated' })
}

async function me(req, res) {
  res.json({ user: req.user.toJSON() })
}

module.exports = { login, sendOtp, verifyOtp, signup, resetPassword, me }
