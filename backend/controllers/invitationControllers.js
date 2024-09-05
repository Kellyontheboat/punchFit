const db = require('../models')
const { Invitations, Members } = db
const { getIo, notifyUser } = require('../services/socketService')

const invitationControllers = {

  createInvitation: async (req, res) => {
    try {
      const studentId = req.memberId
      const { scheduleId } = req.body
      const studentMember = await Members.findByPk(studentId)
      const studentName = studentMember.username
      const studentEmail = studentMember.email
      const coachEmail = `coach${studentEmail}`
      const coachMember = await Members.findOne({ where: { email: coachEmail } })

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
      const message = 'You have a new consultation request!'
      await notifyUser(coachMember.id, message, roomId, scheduleId, studentName)
    } catch (error) {
      console.error('Error details:', error)
      res.status(500).json({ error: 'Error creating invitation' })
    }
  },

  getInvitationsForCoach: async (req, res) => {
    try {
      const coachId = req.memberId
      const invitations = await Invitations.findAll({ where: { coach_id: coachId } })
      const studentMemberId = invitations[0].student_id
      const studentMember = await Members.findByPk(studentMemberId)
      const studentName = studentMember.username
      res.json({ invitations, coachId, studentName })
      console.log('nnn', studentName)
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
