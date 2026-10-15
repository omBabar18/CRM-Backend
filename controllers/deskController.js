const Task = require('../models/Task')
const Review = require('../models/Review')
const Referral = require('../models/Referral')
const Campaign = require('../models/Campaign')
const Activity = require('../models/Activity')
const { seesAll, nextCode } = require('../services/access')

function own(user, field = 'staffId') {
  return seesAll(user) ? {} : { [field]: user.code }
}

async function listTasks(req, res) {
  res.json(await Task.find(own(req.user)).sort({ due: 1 }))
}

async function createTask(req, res) {
  const row = await Task.create({ ...req.body, code: await nextCode(Task, 't'), staffId: req.body.staffId || req.user.code, status: 'Open' })
  res.status(201).json(row)
}

async function setTaskStatus(req, res) {
  const row = await Task.findOne({ code: req.params.id, ...own(req.user) })
  if (!row) return res.status(404).json({ message: 'Task not found' })
  row.status = req.body.status
  await row.save()
  res.json(row)
}

async function listReviews(_req, res) {
  res.json(await Review.find().sort({ createdAt: -1 }))
}

async function requestReview(req, res) {
  const row = await Review.create({
    code: await nextCode(Review, 'rv-'),
    customerId: req.body.customerId,
    staffId: req.user.code,
    status: 'Requested',
    requestedAt: new Date(),
  })
  res.status(201).json(row)
}

async function completeReview(req, res) {
  const row = await Review.findOne({ code: req.params.id })
  if (!row) return res.status(404).json({ message: 'Review not found' })
  row.status = 'Completed'
  row.completedAt = new Date()
  await row.save()
  res.json(row)
}

async function listReferrals(req, res) {
  res.json(await Referral.find(own(req.user)).sort({ date: -1 }))
}

async function createReferral(req, res) {
  const row = await Referral.create({ ...req.body, code: await nextCode(Referral, 'rf-'), staffId: req.user.code, date: new Date() })
  res.status(201).json(row)
}

async function updateReferral(req, res) {
  const row = await Referral.findOne({ code: req.params.id })
  if (!row) return res.status(404).json({ message: 'Referral not found' })
  Object.assign(row, req.body)
  await row.save()
  res.json(row)
}

async function listCampaigns(_req, res) {
  res.json(await Campaign.find().sort({ createdAt: -1 }))
}

async function createCampaign(req, res) {
  const row = await Campaign.create({ ...req.body, code: await nextCode(Campaign, 'cp-'), createdBy: req.user.code })
  res.status(201).json(row)
}

async function listActivities(req, res) {
  const filter = seesAll(req.user) ? {} : { staffId: req.user.code }
  res.json(await Activity.find(filter).sort({ at: -1 }).limit(200))
}

module.exports = {
  listTasks, createTask, setTaskStatus, listReviews, requestReview, completeReview,
  listReferrals, createReferral, updateReferral, listCampaigns, createCampaign, listActivities,
}
