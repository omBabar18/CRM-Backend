const router = require('express').Router()
const auth = require('../controllers/authController')
const { requireAuth } = require('../middleware/auth')

router.post('/login', auth.login)
router.post('/otp', auth.sendOtp)
router.post('/otp/verify', auth.verifyOtp)
router.post('/signup', auth.signup)
router.post('/reset', auth.resetPassword)
router.get('/me', requireAuth, auth.me)

module.exports = router
