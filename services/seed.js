const bcrypt = require('bcryptjs')
const Staff = require('../models/Staff')
const Customer = require('../models/Customer')
const Lead = require('../models/Lead')
const Workspace = require('../models/Workspace')
const { permissionsFor } = require('./access')

async function seedIfEmpty() {
  const existing = await Staff.countDocuments()
  if (existing) return
  const password = await bcrypt.hash('gold123', 10)
  const people = [
    ['s1', 'Aarti Deshmukh', '9876543210', 'Admin'],
    ['s2', 'Rahul Patil', '9876500002', 'Manager'],
    ['s3', 'Sneha Kulkarni', '9876500003', 'Sales Executive'],
    ['s4', 'Amit Jadhav', '9876500004', 'Calling Executive'],
    ['s5', 'Neha Shah', '9876500005', 'Accountant'],
  ]
  await Staff.insertMany(people.map(([code, name, mobile, role]) => ({
    code, name, mobile, role, password, active: true, permissions: permissionsFor(role),
  })))
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(11, 0, 0, 0)
  await Customer.create({
    code: 'DG-C-501',
    name: 'Lata Chavan',
    mobile: '9765432108',
    location: 'Miraj',
    address: 'Miraj, Sangli, Maharashtra',
    assignedTo: 's3',
    since: new Date(),
    kyc: { status: 'Verified', aadhaar: 'XXXX-XXXX-4412', pan: 'CHVPL4412K' },
    notes: [],
  })
  await Lead.create({
    code: 'DG-L-2401',
    name: 'Vikram More',
    mobile: '9822011101',
    location: 'Vishrambag',
    source: 'Google Ads',
    requirement: 'Sell Gold',
    expectedAmount: 185000,
    goldWeight: 28,
    assignedTo: 's3',
    status: 'Follow-up',
    priority: 'High',
    nextFollowUp: tomorrow,
    notes: '22K jewellery. Wants cash after 4 PM.',
    lastOutcome: 'Interested',
    timeline: [],
  })
  await Workspace.create({
    key: 'main',
    rates: { k24: 7240, k22: 6640, k18: 5430, updatedAt: new Date() },
    targets: {
      daily: { leads: 8, calls: 10, followups: 8, visits: 3, conversions: 2, goldSale: 350000, goldLoan: 250000, revenue: 25000, reviews: 2, referrals: 1 },
      weekly: { leads: 40, calls: 55, followups: 40, visits: 12, conversions: 8, goldSale: 1800000, goldLoan: 1200000, revenue: 120000, reviews: 8, referrals: 4 },
      monthly: { leads: 80, calls: 48, followups: 36, visits: 14, conversions: 8, goldSale: 2200000, goldLoan: 700000, revenue: 180000, reviews: 10, referrals: 6 },
    },
    automations: [
      { id: 'assign', name: 'Auto lead assignment', detail: 'New leads rotate to the sales or calling executive with the lightest open queue.', enabled: true },
      { id: 'followup', name: 'Follow-up reminders', detail: 'Remind the owner on the morning a follow-up is due.', enabled: true },
      { id: 'overdue', name: 'Overdue alerts', detail: 'Keep overdue follow-ups pinned for the owner, manager, and admin.', enabled: true },
      { id: 'review', name: 'Review request after transaction', detail: 'After a gold sale or loan disbursement, create a Google review task.', enabled: true },
    ],
    settings: { reviewLink: '', city: 'Sangli, Maharashtra' },
  })
  console.log('Seeded demo staff. Sign in with 9876543210 / gold123')
}

module.exports = { seedIfEmpty }
