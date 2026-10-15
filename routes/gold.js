const router = require('express').Router()
const gold = require('../controllers/goldController')

router.get('/purchases', gold.listPurchases)
router.post('/purchases', gold.createPurchase)
router.get('/loans', gold.listLoans)
router.post('/loans', gold.createLoan)
router.post('/loans/:id/payments', gold.addPayment)
router.patch('/loans/:id/status', gold.setStatus)

module.exports = router
