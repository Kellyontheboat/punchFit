import { coachGetPostItems, coachGetPostContent } from '../api/consultScript.js'

const token = localStorage.getItem('token')
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

  // Create submit button
  const submitButton = document.createElement('button')
  submitButton.type = 'submit'
  submitButton.classList.add('share-btn')
  submitButton.textContent = 'Agree to share exercise record'
  form.appendChild(submitButton)

  // Append the form to the container
  container.insertAdjacentElement('afterend', form)
}

export async function renderCoachConsultRoom (studentName, incomeNotification) {
  if (window.location.pathname === '/consult') {
    console.log(incomeNotification)
    // Render chat room
    const itemData = await coachGetPostItems(incomeNotification.scheduleId)
    const post = await coachGetPostContent(incomeNotification.scheduleId)
    console.log(post)
    await renderConsultPostContent(post)
    console.log(itemData)
    const items = itemData.items
    await renderExerciseInConsult(items)
    await renderConsultRoom(incomeNotification.scheduleId, incomeNotification.roomId, studentName)
  }
}

// for both student and coach in renderCoachConsultRoom
export async function renderConsultRoom (scheduleId, roomId, studentName) {
  const container = document.querySelector(`.post[data-id="${scheduleId}"]`) || document.querySelector('.consult-post')

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
  // if is the coach's consult room
  if (container.classList.contains('consult-post')) {
    consultTitle.textContent = 'Reply:'
    // add roomTitle
    const roomTitle = document.createElement('div')
    roomTitle.classList.add('room-title')
    roomTitle.innerText = `From student ${studentName}:`
    const postWrapper = document.querySelector('.post-wrapper')
    postWrapper.insertAdjacentElement('afterbegin', roomTitle)
  } else {
    consultTitle.textContent = 'Online coach real-time consultation:'
  }

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

  sendButton.addEventListener('click', () => {
    const messageInput = document.getElementById('message')
    const userId = token
    const roomId = document.getElementById('roomId').value
    if (messageInput.value.trim()) {
      const socket = io()
      socket.emit('chatMessage', { text: messageInput.value, roomId, senderId: userId })
      messageInput.value = ''
    }
  })

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

// source:coachGetPostContent(scheduleId)
export async function renderConsultPostContent (post) {
  console.log(post)
  const postContainer = document.getElementById('consult-post-container')
  // Create a post wrapper
  const postWrapper = document.createElement('div')
  postWrapper.classList.add('post-wrapper')

  // Create a container for each post
  const postElement = document.createElement('div')
  postElement.classList.add('consult-post')
  // postElement.dataset.id = post.id

  const scheduleNameDiv = document.createElement('div')
  scheduleNameDiv.classList.add('schedule-name')
  const now = new Date()
  const formattedDate = now.toLocaleString('en-US', { timeZone: 'Asia/Taipei', hour12: false })

  scheduleNameDiv.innerText = `${post.scheduleName} / ${formattedDate}`
  postElement.appendChild(scheduleNameDiv)

  // Container for user note and coach comment
  const textContainer = document.createElement('div')
  textContainer.classList.add('text-post')
  // Create and append the content
  const contentElement = document.createElement('p')
  contentElement.textContent = post.scheduleContent
  textContainer.appendChild(contentElement)
  scheduleNameDiv.appendChild(textContainer)

  // Create and append the video if available
  if (post.scheduleWithVideoUrl) {
    const videoContainer = document.createElement('div')
    videoContainer.classList.add('consult-video-post')
    const videoElement = document.createElement('video')
    videoElement.controls = true

    const sourceElement = document.createElement('source')
    sourceElement.src = post.scheduleWithVideoUrl
    sourceElement.type = 'video/mp4'

    videoElement.appendChild(sourceElement)
    videoContainer.appendChild(videoElement)
    scheduleNameDiv.insertAdjacentElement('afterend', videoContainer)
  }
  // Append the post to the container
  postWrapper.appendChild(postElement)
  postContainer.appendChild(postWrapper)
}

// source:coachGetPostItems(scheduleId)
export async function renderExerciseInConsult (scheduleItems) {
  const consultPost = document.querySelector('.consult-post')

  const exerciseContainer = document.createElement('div')
  exerciseContainer.classList.add('consult-exercise-post')

  // Create a wrapper div for exercises
  const moduleWrap = document.createElement('div')
  moduleWrap.classList.add('module-wrap')

  // Create a container for exercises
  const menuEditing = document.createElement('div')
  menuEditing.classList.add('module-editing', 'list-group')

  // Create a list for exercises
  const exerciseList = document.createElement('ul')
  exerciseList.classList.add('list-group')

  scheduleItems.forEach(item => {
    // Create list item for each exercise
    const exerciseItem = document.createElement('li')
    exerciseItem.classList.add('list-group-item', 'menu-module-item')
    exerciseItem.dataset.id = item.id

    // Add exercise details
    const exerciseDetails = document.createElement('div')
    exerciseDetails.classList.add('exercise-details')
    exerciseDetails.textContent = `${item.reps} reps / ${item.sets} sets / ${item.weight} kg`

    const exerciseSection = document.createElement('strong')
    const exerciseName = document.createElement('em')
    exerciseName.innerText = `${item.exercise.name}`
    exerciseSection.innerText = `${item.section.section_name}: `
    const exerciseSectionName = document.createElement('div')

    exerciseSectionName.appendChild(exerciseSection)
    exerciseSectionName.appendChild(exerciseName)
    exerciseItem.appendChild(exerciseSectionName)
    exerciseItem.appendChild(exerciseDetails)
    exerciseList.appendChild(exerciseItem)
  })

  menuEditing.appendChild(exerciseList)
  moduleWrap.appendChild(menuEditing)

  // Append the module wrap to the post container
  exerciseContainer.appendChild(moduleWrap)
  consultPost.appendChild(exerciseContainer)
}
