const router = require('express').Router()
const leads = require('../controllers/leadController')

router.get('/', leads.list)
router.post('/', leads.create)
router.patch('/:id', leads.update)
router.post('/:id/calls', leads.logCall)

module.exports = router
