const router = require('express').Router()
const customers = require('../controllers/customerController')

router.get('/', customers.list)
router.post('/', customers.create)
router.get('/:id', customers.getOne)
router.patch('/:id', customers.update)
router.post('/:id/notes', customers.addNote)

module.exports = router
