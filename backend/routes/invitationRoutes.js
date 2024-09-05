const express = require('express')
const router = express.Router()
const invitationControllers = require('../controllers/invitationControllers')
const { authenticateToken, authorizeCoach } = require('../middleware/auth')

router.post('/invitations', authenticateToken, invitationControllers.createInvitation)
router.get('/invitations', authenticateToken, authorizeCoach, invitationControllers.getInvitationsForCoach)
router.put('/invitations/:id', authenticateToken, invitationControllers.updateInvitationStatus)

module.exports = router
