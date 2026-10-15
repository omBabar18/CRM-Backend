const router = require('express').Router()
const desk = require('../controllers/deskController')

router.get('/tasks', desk.listTasks)
router.post('/tasks', desk.createTask)
router.patch('/tasks/:id', desk.setTaskStatus)
router.get('/reviews', desk.listReviews)
router.post('/reviews', desk.requestReview)
router.patch('/reviews/:id', desk.completeReview)
router.get('/referrals', desk.listReferrals)
router.post('/referrals', desk.createReferral)
router.patch('/referrals/:id', desk.updateReferral)
router.get('/campaigns', desk.listCampaigns)
router.post('/campaigns', desk.createCampaign)
router.get('/activities', desk.listActivities)

module.exports = router
