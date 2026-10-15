const jwt = require('jsonwebtoken')
const Staff = require('../models/Staff')

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return res.status(401).json({ message: 'Sign in required' })
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dggold-crm-dev-secret')
    const staff = await Staff.findOne({ code: payload.staffId, active: true })
    if (!staff) return res.status(401).json({ message: 'Sign in required' })
    req.user = staff
    next()
  } catch {
    res.status(401).json({ message: 'Sign in required' })
  }
}

function requirePerm(key) {
  return (req, res, next) => {
    const { can } = require('../services/access')
    if (!can(req.user, key)) return res.status(403).json({ message: 'Your role cannot open this module' })
    next()
  }
}

module.exports = { requireAuth, requirePerm }
