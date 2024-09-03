import { renderInviteForm, renderConsultRoom } from '../render/consultRender.js'

const token = localStorage.getItem('token')

export async function addListenerConsultBtn (user) {
  console.log(user)
  const consultBtns = document.querySelectorAll('.consult')

  consultBtns.forEach(btn => btn.addEventListener('click', async (event) => {
    const scheduleId = event.currentTarget.dataset.id
    const inviteForm = document.getElementById('invite-form')

    if (btn.innerText === 'Consult Coach') {
      btn.innerText = 'Cancel'
      await renderInviteForm(scheduleId)
      submitInviteForm(user)
    } else {
      btn.innerText = 'Consult Coach'
      if (inviteForm) {
        inviteForm.remove()
      }
    }
  })
  )
}

export async function submitInviteForm (user) {
  const inviteForm = document.getElementById('invite-form')
  inviteForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const data = {
      scheduleId: formData.get('scheduleId'),
      coachEmail: formData.get('coachEmail')
    }
    console.log(data)
    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      console.log(result)
      const memberId = result.student_id
      const coachId = result.coach_id //! coach role
      const scheduleId = result.schedule_id
      console.log('Invitation sent:', result)
      const roomId = `${memberId}_${coachId}_${scheduleId}`
      console.log(roomId)
      await renderConsultRoom(scheduleId, roomId)
      initConsultSocket(roomId)
    } catch (error) {
      console.error('Error sending invitation:', error)
    }
  })
}

// Init WebSocket connection and event listeners for student
export function initConsultSocket (roomId) {
  const socket = io()// !Connect to the server 'https://www.good-msg.xyz'
  console.log(roomId)
  // Join the room
  socket.emit('joinRoom', roomId)

  // Handle incoming messages
  socket.on('chatMessage', (message) => {
    const messagesList = document.getElementById('messages')
    const messageElement = document.createElement('li')
    messageElement.textContent = message.text
    messagesList.appendChild(messageElement)
  })

  // Listen for notifications
  socket.on('notification', (data) => {
    console.log('Notification received:', data.message)

    // Display the notification
    displayNotification(data.message)
  })

  const sendButton = document.getElementById('sendMessage')
  sendButton.addEventListener('click', () => {
    const messageInput = document.getElementById('message')
    if (messageInput.value.trim()) {
      socket.emit('chatMessage', { text: messageInput.value, roomId })
      messageInput.value = ''
    }
  })
}

export async function displayNotification (message) {
  console.log('displayNotify')
  // Create a notification element
  const notification = document.createElement('div')
  notification.className = 'notification'
  notification.textContent = message

  // Append notification to the body or a specific container
  document.body.appendChild(notification)
  // Remove the notification after a few seconds
  // document.body.removeChild(notification);
}

export async function coachGetNotification () {
  console.log('check if coach got notification')
  try {
    const response = await fetch('/api/invitations', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    const { invitations, coachId } = await response.json()

    // if (invitations.length !== 0) {
    //   initCoachSocket(coachId);
    // }
  } catch (error) {
    console.error('Error fetching notifications:', error)
  }
}

export function initCoachSocket (user) {
  console.log('initCoachSocket')
  const socket = io() // !Connect to the server 'https://www.good-msg.xyz'
  const coachId = user.id
  console.log(coachId)
  // Register the coach with their ID
  socket.emit('register', coachId)

  // Handle notifications
  socket.on('notification', async (data) => {
    console.log('Notification received:', data.message, data.roomId)
    console.log(data.roomId)
    // Display the notification
    await displayNotification(data.message)
    await renderConsultRoom(data.scheduleId, data.roomId) // Render chat room

    // After rendering, join the room
    socket.emit('joinRoom', data.roomId)
    console.log('Joined room:', data.roomId)

    // Handle incoming messages
    socket.on('chatMessage', (message) => {
      const messagesList = document.getElementById('messages')
      const messageElement = document.createElement('li')
      messageElement.textContent = message.text
      messagesList.appendChild(messageElement)
    })

    const sendButton = document.getElementById('sendMessage')
    sendButton.addEventListener('click', () => {
      const messageInput = document.getElementById('message')
      const roomId = document.getElementById('roomId').value
      if (messageInput.value.trim()) {
        socket.emit('chatMessage', { text: messageInput.value, roomId })
        messageInput.value = ''
      }
    })
  })
}
