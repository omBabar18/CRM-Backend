const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Staff = require('../models/Staff')
const { permissionsFor, nextCode } = require('../services/access')
const { sendVerificationEmail } = require('../services/mail')

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
  if (staff.emailVerified === false) {
    return res.status(403).json({ message: 'Open the verification link in your email, then sign in.' })
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
  const { name, mobile, email, password } = req.body
  const address = String(email || '').trim().toLowerCase()
  if (!name?.trim()) return res.status(400).json({ message: 'Enter your name.' })
  if (!/^\d{10}$/.test(mobile || '')) return res.status(400).json({ message: 'Enter a 10-digit mobile number.' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) return res.status(400).json({ message: 'Enter a valid email address.' })
  if (!password || String(password).length < 6) return res.status(400).json({ message: 'Use a password of at least 6 characters.' })
  if (await Staff.findOne({ mobile })) return res.status(409).json({ message: 'This mobile is already registered.' })
  if (await Staff.findOne({ email: address })) return res.status(409).json({ message: 'This email is already registered.' })
  const token = crypto.randomBytes(32).toString('hex')
  const staff = await Staff.create({
    code: await nextCode(Staff, 's'),
    name: name.trim(),
    mobile,
    email: address,
    password: await bcrypt.hash(password, 10),
    role: 'Sales Executive',
    active: true,
    emailVerified: false,
    verifyToken: token,
    verifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    permissions: permissionsFor('Sales Executive'),
  })
  const origin = process.env.PUBLIC_API_URL || `http://localhost:${process.env.PORT || 5000}`
  const link = `${origin}/api/auth/verify-email?token=${token}`
  try {
    await sendVerificationEmail({ to: address, name: staff.name, link })
  } catch (error) {
    await Staff.deleteOne({ _id: staff._id })
    console.error('Verification email failed:', error.message)
    return res.status(502).json({ message: 'Could not send the verification email. Check the mailbox login and try again.' })
  }
  res.status(201).json({ message: 'Check your email and open the verification link, then sign in.' })
}

async function verifyEmail(req, res) {
  const frontend = process.env.FRONTEND_URL || 'http://localhost:5173'
  const token = String(req.query.token || '')
  const staff = token
    ? await Staff.findOne({ verifyToken: token }).select('+verifyToken +verifyExpires')
    : null
  if (!staff || !staff.verifyExpires || staff.verifyExpires.getTime() < Date.now()) {
    return res.redirect(`${frontend}/login?verified=0`)
  }
  staff.emailVerified = true
  staff.verifyToken = undefined
  staff.verifyExpires = undefined
  await staff.save()
  res.redirect(`${frontend}/login?verified=1`)
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

module.exports = { login, sendOtp, verifyOtp, signup, verifyEmail, resetPassword, me }
