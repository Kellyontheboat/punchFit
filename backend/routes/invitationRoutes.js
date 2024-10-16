const express = require('express')
const { body, param, validationResult } = require('express-validator');
const router = express.Router()
const invitationControllers = require('../controllers/invitationControllers')
const { authenticateToken, authorizeCoach } = require('../middleware/auth')

router.post('/invitations', authenticateToken, [
  body('scheduleId').isInt().withMessage('Schedule ID must be a valid integer'),
],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    invitationControllers.createInvitation(req, res);
  })
//router.post('/messages', authenticateToken, invitationControllers.createMessage)
router.get('/invitations', authenticateToken, authorizeCoach, invitationControllers.getInvitationsForCoach)

router.delete('/unreadRoomIds/:roomId', authenticateToken, [
  param('roomId').isString().withMessage('Room ID must be a valid string'),
],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    invitationControllers.deleteUnreadRoomId(req, res);
  })
module.exports = router
