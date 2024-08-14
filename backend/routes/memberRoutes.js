const express = require('express')
const router = express.Router()
const memberControllers = require('../controllers/memberControllers')
const authenticateToken = require('../middleware/auth')

// ! /api
// Define the route to handle query parameters
router.get('/user/auth', authenticateToken, memberControllers.authenticate)

router.put('/user/auth', memberControllers.login)

router.post('/user', memberControllers.register)

module.exports = router
