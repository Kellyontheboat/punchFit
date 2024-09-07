import { renderInviteForm, renderConsultRoom, renderCoachConsultRoom, renderConsultPostContent, renderExerciseInConsult } from '../render/consultRender.js'

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
    const submitBtn = document.querySelector('.share-btn')
    submitBtn.style.display = 'none'
    const formData = new FormData(event.target)
    const data = {
      scheduleId: formData.get('scheduleId')
      // coachEmail: formData.get('coachEmail')
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
      const invitationData = await response.json()
      const result = invitationData.invitation
      const studentName = invitationData.studentName
      const memberId = result.student_id
      const coachId = result.coach_id
      const scheduleId = result.schedule_id
      console.log('Invitation sent:', result)
      const roomId = `${memberId}_${coachId}_${scheduleId}`
      console.log(roomId)
      await renderConsultRoom(scheduleId, roomId, studentName)
      initConsultSocket(roomId)
    } catch (error) {
      console.error('Error sending invitation:', error)
    }
  })
}

// Init WebSocket connection and event listeners for student
// Join room.handle incoming msg.notification
export function initConsultSocket (roomId) {
  const socket = io()
  console.log(roomId)
  // Join the room
  socket.emit('joinRoom', roomId)

  // Handle incoming messages
  socket.on('chatMessage', (message) => {
    const messagesList = document.getElementById('messages')
    const messageElement = document.createElement('li')
    const hr = document.createElement('hr')

    const userId = token
    // Check if the message is from the current user
    if (message.senderId === userId) {
      messageElement.textContent = `You: ${message.text}`
      messageElement.style.textAlign = 'right'
    } else {
      messageElement.textContent = `Coach: ${message.text}`
      messageElement.style.textAlign = 'left'
    }
    messageElement.appendChild(hr)
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
    const userId = token
    if (messageInput.value.trim()) {
      socket.emit('chatMessage', { text: messageInput.value, roomId, senderId: userId })
      messageInput.value = ''
    }
  })
}

export async function displayNotification (message) {
  const redDot = document.querySelector('.red-dot')
  redDot.style.display = 'block'
  const welcomeContainer = document.querySelector('.welcome')
  welcomeContainer.innerText = 'Consultation request:'

  addListenerNotification()
}

//
export async function coachGetNotification () {
  console.log('check if coach got notification')
  try {
    const response = await fetch('/api/invitations', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const invitationContent = await response.json()
    const { invitations, studentName } = invitationContent
    console.log()
    return ({ invitations, studentName })
  } catch (error) {
    console.error('Error fetching notifications:', error)
  }
}

export async function coachGetPostItems (scheduleId) {
  console.log(scheduleId)
  const response1 = await fetch(`/api/schedules/${scheduleId}/items?consulting=true`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const postItems = await response1.json()
  console.log(postItems)
  return postItems
}

export async function coachGetPostContent (scheduleId) {
  console.log(scheduleId)
  const response2 = await fetch(`/api/schedules/${scheduleId}/video?consulting=true`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  const postContent = await response2.json()
  console.log(postContent)
  return postContent
}

export async function initCoachSocket (user, studentName) {
  console.log('initCoachSocket')
  const socket = io()
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

    // Render chat room
    // coach get the student content
    const itemData = await coachGetPostItems(data.scheduleId)
    const items = itemData.items
    const post = await coachGetPostContent(data.scheduleId)
    await renderConsultPostContent(post)
    console.log(itemData)
    await renderExerciseInConsult(items)
    await renderConsultRoom(data.scheduleId, data.roomId, studentName)

    // After rendering, join the room
    socket.emit('joinRoom', data.roomId)
    console.log('Joined room:', data.roomId)

    // Handle incoming messages
    socket.on('chatMessage', (message) => {
      const messagesList = document.getElementById('messages')
      const messageElement = document.createElement('li')
      const hr = document.createElement('hr')
      const userId = token
      // Check if the message is from the current user
      if (message.senderId === userId) {
        messageElement.textContent = `You: ${message.text}`
        messageElement.style.textAlign = 'right'
      } else {
        messageElement.textContent = `Student: ${message.text}`
        messageElement.style.textAlign = 'left'
      }
      messageElement.appendChild(hr)
      messagesList.appendChild(messageElement)
    })

    const sendButton = document.getElementById('sendMessage')
    sendButton.addEventListener('click', () => {
      const messageInput = document.getElementById('message')
      const userId = token
      const roomId = document.getElementById('roomId').value
      if (messageInput.value.trim()) {
        socket.emit('chatMessage', { text: messageInput.value, roomId, senderId: userId })
        messageInput.value = ''
      }
    })
  })
}

export async function addListenerNotification () {
  const notificationIcon = document.querySelector('.red-dot')
  notificationIcon.addEventListener('click', () => {
    // Hide the chat icon
    const svgElement = document.querySelector('svg')
    const redDot = document.querySelector('.red-dot')
    const beforeConsult = document.querySelector('.before-consult')
    beforeConsult.style.display = 'none'
    svgElement.style.display = 'none'
    redDot.style.display = 'none'

    // Show the consult content post from student
    const consultContainer = document.getElementById('consult-post-container')
    consultContainer.style.display = 'block'
  })
}
