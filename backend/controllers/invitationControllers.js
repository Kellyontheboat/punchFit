const db = require('../models')
const { Invitations, Members } = db
const { notifyUserAboutInvitation } = require('../services/notificationService')
const { redisClient } = require('../services/redisService')
const { createMessage } = require('../services/messageService')

const invitationControllers = {

  createInvitation: async (req, res) => {
    try {
      const studentId = req.memberId
      const { scheduleId } = req.body
      const studentMember = await Members.findByPk(studentId)
      const studentName = studentMember.username
      const studentEmail = studentMember.email
      const coachEmail = `coach${studentEmail}`
      let coachMember = await Members.findOne({ where: { email: coachEmail } })
      if (!coachMember) { // prepare a public coach for testing
        coachMember = await Members.findOne({ where: { email: 'coachJenny@gmail.com' } })
      }

      if (!coachMember || !studentMember) {
        return res.status(404).json({ error: 'Coach/Student not found' })
      }

      const invitation = await Invitations.create({
        schedule_id: scheduleId,
        student_id: studentId,
        coach_id: coachMember.id,
        status: 'pending'
      })

      const roomId = `${studentId}_${coachMember.id}_${scheduleId}`
      console.log(studentMember, 'ooooo')
      res.status(201).json({ invitation, studentName })

      // Notify the coach
      console.log('Notifying user...')
      const message = 'You have a new consultation request!'
      // emit notification to the coach
      notifyUserAboutInvitation(coachMember.id, message, roomId, scheduleId, studentName, studentId)

      await redisClient.sAdd(`notification_coachId:${coachMember.id}`, JSON.stringify({ studentName, studentId }))

      // create a message to the coach and Save into DB
      await createMessage({
        roomId,
        senderId: studentId,
        messageText: message
      })
    } catch (error) {
      res.status(500).json({
        error: `${error.message}. Error creating invitation`
      })
    }
  },
  getInvitationsForCoach: async (req, res) => {
    try {
      const coachId = req.memberId
      const key = `notification_coachId:${coachId}`
      const invitations = await redisClient.sMembers(key)

      // await Invitations.findAll({ where: { coach_id: coachId } })
      console.log(invitations, 'here invitations')
      if (invitations.length === 0) {
        return res.status(200).json({
          message: 'No pending invitations',
          invitations: [],
          studentName: null
        })
      }

      // Parse each notification back into an object
      return invitations.map(notification => JSON.parse(notification))
    } catch (error) {
      res.status(500).json({ error: `${error.message}. Error fetching invitations` })
    }
  },
  deleteUnreadRoomId: async (req, res) => {
    const { roomId } = req.params
    const memberId = req.memberId
    await redisClient.sRem(`unreadRoomIds:${memberId}`, roomId)
    res.status(200).json({ message: 'Unread room ID deleted' })
    // Get messages from Redis
    const messagesKey = `messages:${roomId}`
    const messagesJson = await redisClient.get(messagesKey)

    if (messagesJson) {
      const messages = JSON.parse(messagesJson)// messages array

      // Update each message object
      const updatedMessages = messages.map(message => {
        message.read = 1
        return message
      })

      // Save the updated messages back to Redis
      await redisClient.set(messagesKey, JSON.stringify(updatedMessages))
    }
  }
}

module.exports = invitationControllers
