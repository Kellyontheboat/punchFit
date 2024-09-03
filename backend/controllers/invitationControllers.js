const db = require('../models')
const { Invitations, Members } = db
const { getIo, notifyUser } = require('../services/socketService')

const invitationControllers = {

  createInvitation: async (req, res) => {
    try {
      const studentId = req.memberId
      const { scheduleId, coachEmail } = req.body

      const coachMember = await Members.findOne({ where: { email: coachEmail } })

      if (!coachMember) {
        return res.status(404).json({ error: 'Coach not found' })
      }

      const invitation = await Invitations.create({
        schedule_id: scheduleId,
        student_id: studentId,
        coach_id: coachMember.id,
        status: 'pending'
      })

      const roomId = `${studentId}_${coachMember.id}_${scheduleId}`

      res.status(201).json(invitation)

      // Notify the coach
      const message = 'You have a new consultation request!'
      await notifyUser(coachMember.id, message, roomId)
    } catch (error) {
      console.error('Error details:', error)
      res.status(500).json({ error: 'Error creating invitation' })
    }
  },

  getInvitationsForCoach: async (req, res) => {
    try {
      const coachId = req.memberId
      const invitations = await Invitations.findAll({ where: { coach_id: coachId } })
      res.json({ invitations, coachId })
      console.log('nnn', invitations)
    } catch (error) {
      res.status(500).json({ error: 'Error fetching invitations' })
    }
  },

  updateInvitationStatus: async (req, res) => {
    try {
      const invitationId = req.params.id
      const { status } = req.body
      const [updated] = await Invitations.update({ status }, { where: { id: invitationId } })
      if (updated) {
        const updatedInvitation = await Invitations.findByPk(invitationId)
        res.json(updatedInvitation)
      }
    } catch (error) {
      res.status(500).json({ error: 'Error updating invitation' })
    }
  }
}

module.exports = invitationControllers
