const express = require('express')
const router = express.Router()
const scheduleControllers = require('../controllers/scheduleControllers')

router.post('/modules', scheduleControllers.createModule
)

router.post('/exercises', scheduleControllers.addExercise)

router.get('/members/:memberId/modules', scheduleControllers.getModules)

module.exports = router
