const Lead = require('../models/Lead')
const Customer = require('../models/Customer')
const Activity = require('../models/Activity')
const Staff = require('../models/Staff')
const { seesAll, NO_NEXT_ACTION, OUTCOME_STATUS, nextCode } = require('../services/access')

function scope(user) {
  return seesAll(user) ? {} : { assignedTo: user.code }
}

async function list(req, res) {
  const leads = await Lead.find(scope(req.user)).sort({ createdAt: -1 })
  res.json(leads)
}

async function create(req, res) {
  const body = req.body
  if (!/^\d{10}$/.test(body.mobile || '')) return res.status(400).json({ message: 'Enter a 10-digit mobile number.' })
  const terminal = ['Converted', 'Not Interested', 'Lost', 'Invalid'].includes(body.status)
  if (!terminal && !body.nextFollowUp) return res.status(400).json({ message: 'Every active lead needs a next follow-up.' })
  let assignedTo = body.assignedTo
  if (!assignedTo) assignedTo = await lightestOwner()
  const lead = await Lead.create({
    ...body,
    code: await nextCode(Lead, 'DG-L-'),
    assignedTo,
    expectedAmount: Number(body.expectedAmount) || 0,
    goldWeight: Number(body.goldWeight) || 0,
    timeline: [],
  })
  res.status(201).json(lead)
}

async function update(req, res) {
  const lead = await Lead.findOne({ code: req.params.id, ...scope(req.user) })
  if (!lead) return res.status(404).json({ message: 'Lead not found' })
  const next = { ...lead.toObject(), ...req.body }
  const terminal = ['Converted', 'Not Interested', 'Lost', 'Invalid'].includes(next.status)
  if (!terminal && !next.nextFollowUp) return res.status(400).json({ message: 'Set the next follow-up before leaving this lead open.' })
  Object.assign(lead, req.body)
  if (req.body.status === 'Converted' && !lead.convertedAt) lead.convertedAt = new Date()
  await lead.save()
  res.json(lead)
}

async function logCall(req, res) {
  const lead = await Lead.findOne({ code: req.params.id, ...scope(req.user) })
  if (!lead) return res.status(404).json({ message: 'Lead not found' })
  const { outcome, notes, nextFollowUp } = req.body
  if (!NO_NEXT_ACTION.includes(outcome) && !nextFollowUp) {
    return res.status(400).json({ message: 'Choose the next follow-up. Every active lead needs a next action.' })
  }
  const now = new Date()
  await Activity.create({ code: await nextCode(Activity, 'a'), type: 'call', staffId: req.user.code, leadId: lead.code, at: now, outcome })
  if (lead.nextFollowUp) {
    await Activity.create({ code: await nextCode(Activity, 'a'), type: 'followup', staffId: req.user.code, leadId: lead.code, at: now, outcome })
  }
  lead.lastContact = now
  lead.lastOutcome = outcome
  lead.notes = notes || lead.notes
  lead.nextFollowUp = NO_NEXT_ACTION.includes(outcome) ? null : nextFollowUp
  lead.status = OUTCOME_STATUS[outcome] || lead.status
  lead.timeline.unshift({ id: `tl-${Date.now()}`, at: now, type: 'call', text: notes || outcome, outcome, staffId: req.user.code })
  if (outcome === 'Converted') {
    lead.convertedAt = now
    let customer = await Customer.findOne({ mobile: lead.mobile })
    if (!customer) {
      customer = await Customer.create({
        code: await nextCode(Customer, 'DG-C-'),
        name: lead.name,
        mobile: lead.mobile,
        alternate: lead.alternate,
        location: lead.location,
        address: `${lead.location}, Sangli, Maharashtra`,
        assignedTo: lead.assignedTo,
        since: now,
        kyc: { status: 'Pending', aadhaar: '', pan: '' },
        notes: [],
      })
    }
    lead.customerId = customer.code
    await Activity.create({ code: await nextCode(Activity, 'a'), type: 'conversion', staffId: req.user.code, leadId: lead.code, at: now, outcome })
  }
  await lead.save()
  res.json(lead)
}

async function lightestOwner() {
  const pool = await Staff.find({ active: true, role: { $in: ['Sales Executive', 'Calling Executive'] } })
  if (!pool.length) {
    const admin = await Staff.findOne({ role: 'Admin' })
    return admin?.code || ''
  }
  const loads = await Promise.all(pool.map(async (person) => {
    const count = await Lead.countDocuments({ assignedTo: person.code, status: { $nin: ['Converted', 'Lost', 'Invalid', 'Not Interested'] } })
    return { code: person.code, count }
  }))
  loads.sort((a, b) => a.count - b.count)
  return loads[0].code
}

module.exports = { list, create, update, logCall }
