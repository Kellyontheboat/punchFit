const express = require('express')
const router = express.Router()
const scheduleControllers = require('../controllers/scheduleControllers')

router.post('/modules', scheduleControllers.createModule
)

module.exports = router