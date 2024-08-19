const express = require('express')
const router = express.Router()
const scheduleControllers = require('../controllers/scheduleControllers')
const authenticateToken = require('../middleware/auth')

router.post('/schedules', authenticateToken, scheduleControllers.createSchedule
)

router.get('/schedules', authenticateToken, scheduleControllers.getMemberSchedules)

router.post('/scheduleItems', authenticateToken, scheduleControllers.addIntoScheduleItems)

router.get('/schedules/:scheduleId/items', authenticateToken, scheduleControllers.getItemsInSchedule)

router.put('/scheduleItems/update', authenticateToken, scheduleControllers.updateSchedule)

module.exports = router
