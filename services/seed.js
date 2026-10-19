const bcrypt = require('bcryptjs')
const Staff = require('../models/Staff')
const Workspace = require('../models/Workspace')
const { permissionsFor } = require('./access')

const EMPTY_PERIOD = { leads: 0, calls: 0, followups: 0, visits: 0, conversions: 0, purchases: 0, customers: 0, goldSale: 0, goldLoan: 0, revenue: 0, reviews: 0, referrals: 0 }

async function seedIfEmpty() {
  const password = await bcrypt.hash('Super@0001', 10)
  await Staff.updateOne(
    { email: 'dggold0001@gmail.com' },
    {
      $setOnInsert: {
        code: 's1',
        name: 'Super Admin',
        mobile: '9876500001',
        email: 'dggold0001@gmail.com',
        password,
        role: 'Super Admin',
        active: true,
        emailVerified: true,
        permissions: permissionsFor('Super Admin'),
      },
    },
    { upsert: true },
  )
  const workspace = await Workspace.findOne({ key: 'main' })
  if (!workspace) {
    await Workspace.create({
      key: 'main',
      rates: { k24: 0, k22: 0, k18: 0, updatedAt: new Date() },
      targets: { daily: { ...EMPTY_PERIOD }, weekly: { ...EMPTY_PERIOD }, monthly: { ...EMPTY_PERIOD } },
      automations: [],
      settings: { reviewLink: '', city: 'Sangli, Maharashtra' },
    })
  }
  console.log('Super admin is ready in the users collection')
}

module.exports = { seedIfEmpty }
