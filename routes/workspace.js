const router = require('express').Router()
const workspace = require('../controllers/workspaceController')

router.get('/', workspace.getWorkspace)
router.patch('/rates', workspace.updateRates)
router.patch('/targets', workspace.updateTargets)
router.patch('/receipt', workspace.updateReceipt)
router.patch('/automations/:id', workspace.toggleAutomation)
router.get('/staff', workspace.listStaff)
router.post('/staff', workspace.createStaff)
router.patch('/staff/:id', workspace.updateStaff)
router.delete('/staff/:id', workspace.removeStaff)

module.exports = router
