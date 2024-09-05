const express = require('express')
const router = express.Router()
const memberControllers = require('../controllers/memberControllers')
const { authenticateToken, authorizeCoach } = require('../middleware/auth')

// ! /api
// Define the route to handle query parameters
router.get('/user/auth', authenticateToken, memberControllers.authenticate)

router.put('/user/auth', memberControllers.login)

router.post('/user', memberControllers.register)

router.get('/user-role', authenticateToken, memberControllers.getRole)

module.exports = router
