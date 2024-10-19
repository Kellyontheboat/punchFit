const { notifyUser } = require('./socketService')

async function notifyUserAboutInvitation (userId, message, roomId, scheduleId, studentName, studentId) {
  try {
    await notifyUser(userId, message, roomId, scheduleId, studentName, studentId)
  } catch (error) {
    console.error('Error notifying user:', error)
  }
}

module.exports = {
  notifyUserAboutInvitation
}
