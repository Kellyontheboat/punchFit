const express = require('express')
const router = express.Router()
const scheduleControllers = require('../controllers/scheduleControllers')
const authenticateToken = require('../middleware/auth')
const { upload } = require('../middleware/upload')

router.post('/schedules', authenticateToken, upload.single('video'), scheduleControllers.createSchedule)

router.get('/schedules', authenticateToken, scheduleControllers.getMemberSchedules)

router.post('/scheduleItems', authenticateToken, scheduleControllers.addIntoScheduleItems)

router.get('/schedules/:scheduleId/items', authenticateToken, scheduleControllers.getItemsInSchedule)

router.put('/scheduleItems/update', authenticateToken, scheduleControllers.updateSchedule)

router.delete('/schedules/:scheduleId', authenticateToken, scheduleControllers.deleteSchedule)

module.exports = router
