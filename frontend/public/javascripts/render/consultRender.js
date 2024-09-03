export async function renderInviteForm (scheduleId) {
  // Get the container element where the form will be appended
  const container = document.querySelector(`.post[data-id="${scheduleId}"]`)

  if (!container) {
    console.error('Container element not found')
    return
  }

  // Create the form element
  const form = document.createElement('form')
  form.id = 'invite-form'

  // Create hidden input for scheduleId
  const scheduleInput = document.createElement('input')
  scheduleInput.type = 'hidden'
  scheduleInput.name = 'scheduleId'
  scheduleInput.value = scheduleId
  form.appendChild(scheduleInput)

  // Create input for coachId
  const coachInput = document.createElement('input')
  coachInput.type = 'email'
  coachInput.name = 'coachEmail'
  coachInput.placeholder = 'Coach Email'
  coachInput.required = true
  form.appendChild(coachInput)

  // Create submit button
  const submitButton = document.createElement('button')
  submitButton.type = 'submit'
  submitButton.textContent = 'Consult Coach'
  form.appendChild(submitButton)

  // Append the form to the container
  // container.appendChild(form);
  container.insertAdjacentElement('afterend', form)
}

// for both student and coach
export async function renderConsultRoom (scheduleId, roomId) {
  const container = document.querySelector(`.post[data-id="${scheduleId}"]`) || document.body

  if (!container) {
    console.error('Container element not found')
    return
  }
  console.log('start rendering consultRoom')
  // Create consult room elements
  const consultRoomDiv = document.createElement('div')
  consultRoomDiv.className = 'consult-room'

  const consultTitle = document.createElement('div')
  consultTitle.className = 'consult-title'
  consultTitle.textContent = 'Online Coach'

  const chatDiv = document.createElement('div')
  chatDiv.id = 'chat'

  const messagesList = document.createElement('ul')
  messagesList.id = 'messages'

  const messageInput = document.createElement('input')
  messageInput.id = 'message'
  messageInput.type = 'text'
  messageInput.placeholder = 'Type a message'

  const sendButton = document.createElement('button')
  sendButton.id = 'sendMessage'
  sendButton.textContent = 'Send'

  const roomIdInput = document.createElement('input')
  roomIdInput.id = 'roomId'
  roomIdInput.type = 'hidden'
  roomIdInput.value = roomId

  // Append elements to the chat div
  chatDiv.appendChild(messagesList)
  chatDiv.appendChild(messageInput)
  chatDiv.appendChild(sendButton)
  chatDiv.appendChild(roomIdInput)

  // Append elements to the consult room div
  consultRoomDiv.appendChild(consultTitle)
  consultRoomDiv.appendChild(chatDiv)

  container.insertAdjacentElement('afterend', consultRoomDiv)
}
