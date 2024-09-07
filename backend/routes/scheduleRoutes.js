const express = require('express')
const router = express.Router()
const scheduleControllers = require('../controllers/scheduleControllers')
const { authenticateToken } = require('../middleware/auth')
const upload = require('../middleware/upload.js')
const multer = require('multer')

router.post('/schedules', authenticateToken, (req, res) => {
  upload.single('video')(req, res, (err) => { // Pass err as the first argument
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' })
    } else if (err) {
      return res.status(500).json({ error: 'An error occurred during file upload.' })
    }

    // Proceed with schedule creation if no error
    scheduleControllers.createSchedule(req, res)
  })
})

router.get('/schedules', authenticateToken, scheduleControllers.getMemberSchedules)

router.post('/scheduleItems', authenticateToken, scheduleControllers.addIntoScheduleItems)

router.get('/schedules/:scheduleId/items', authenticateToken, scheduleControllers.getItemsInSchedule)

router.put('/scheduleItems/update', authenticateToken, scheduleControllers.updateSchedule)

router.get('/schedules/:scheduleId/video', authenticateToken, scheduleControllers.getScheduleById)

router.delete('/schedules/:scheduleId', authenticateToken, scheduleControllers.deleteSchedule)

module.exports = router
