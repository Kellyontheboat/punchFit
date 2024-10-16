const express = require('express')
const { body, validationResult } = require('express-validator');
const router = express.Router()
const scheduleControllers = require('../controllers/scheduleControllers')
const { authenticateToken } = require('../middleware/auth')
const upload = require('../middleware/upload.js')
const multer = require('multer')

router.post('/schedules', authenticateToken, (req, res, next) => {
  upload.single('video')(req, res, (err) => { // Pass err as the first argument
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' })
    } else if (err) {
      return res.status(500).json({ error: 'An error occurred during file upload.' })
    }
    next();
  });
},
  [
    body('scheduleName').notEmpty().withMessage('Schedule name is required'),
    body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date'),
    body('captionInput').optional().isString().withMessage('Caption must be a string'),
  ],
  (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Proceed with schedule creation if no error
    scheduleControllers.createSchedule(req, res)
  }
);

router.get('/schedules', authenticateToken, scheduleControllers.getMemberSchedules)

router.post('/scheduleItems', authenticateToken, [
  body('sectionIds')
    .isArray({ min: 1 }).withMessage('Section IDs must be an array with at least one element')
    .custom((sectionIds) => {
      return sectionIds.every(id => Number.isInteger(id) && id >= 1 && id <= 7);
    }).withMessage('Each section ID must be an integer between 1 and 7'),
  body('scheduleId').isInt().withMessage('Schedule ID must be an integer'),
],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    scheduleControllers.addIntoScheduleItems(req, res);
  })

router.get('/schedules/:scheduleId/items', authenticateToken, scheduleControllers.getItemsInSchedule)

router.put('/scheduleItems/update', authenticateToken, scheduleControllers.updateSchedule)

router.get('/schedules/:scheduleId/:roomId/video', authenticateToken, scheduleControllers.getScheduleById)

router.delete('/schedules/:scheduleId', authenticateToken, scheduleControllers.deleteSchedule)

module.exports = router
