import { coachGetPostItems, coachGetPostContent, addSendMsgListeners, deleteUnreadRoomId } from '../api/consultScript.js'

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
  form.classList.add('invite-form')
  form.dataset.scheduleId = scheduleId
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
  submitButton.dataset.scheduleId = scheduleId
  form.appendChild(submitButton)

  // Append the form to the container
  container.insertAdjacentElement('afterend', form)
}

// for both student and coach in renderCoachConsultRoom
// coach:select all containers first then add scheduleId dataset
// student:get scheduleId directly
export async function renderConsultRoom(roomId, studentName, user) {
  const scheduleId = roomId.split('_')[2]
  console.log(scheduleId)
  let container = document.querySelector(`.post[data-id="${scheduleId}"]`) || document.querySelectorAll('.consult-post')
  
  if (!container) {
    console.error('Container element not found')
    return
  }

  console.log(container)
  console.log('start rendering consultRoom')
  // Create consult room elements
  const consultRoomDiv = document.createElement('div')
  consultRoomDiv.className = 'consult-room'
  consultRoomDiv.dataset.roomId = roomId
  const consultTitle = document.createElement('div')
  consultTitle.className = 'consult-title'
  // if is the coach's consult room
  if (NodeList.prototype.isPrototypeOf(container) && user.isCoach) {

    if (container.length !== 0) {
      container = container[container.length - 1]
    }
    console.log(container)
    consultTitle.textContent = 'Reply:'
    // add roomTitle
    const roomTitle = document.createElement('div')
    roomTitle.classList.add('room-title')
    roomTitle.innerText = `From student ${studentName}:`
    const postWrapper = document.querySelectorAll('.post-wrapper')
    // hide all postWrapper(let the filtered one show)
    postWrapper.forEach(post => post.style.display = 'none')
    postWrapper[postWrapper.length - 1].insertAdjacentElement('afterbegin', roomTitle)
    console.log(roomId)
    const studentId = roomId.split('_')[0]
    // Check if postWrapper is a NodeList and has elements
    // renderPostContent first(postWrapper created) then renderConsultRoom
    if (postWrapper.length > 0) {
      // add student into studentList
      postWrapper[postWrapper.length - 1].dataset.studentId = studentId // add studentId to the last postWrapper
      const studentListContainer = document.getElementById('student-list-container')
      const existStudentItem = studentListContainer.querySelector(`.student-list-item[data-student-id="${studentId}"]`)
      if (!existStudentItem) {
      const studentListItem = document.createElement('div')
      studentListItem.classList.add('student-list-item')
      studentListItem.dataset.studentId = studentId 
      studentListItem.innerText = studentName
      studentListContainer.appendChild(studentListItem)
      }
    }
  } else {
    consultTitle.textContent = 'Online coach real-time consultation:'
    const consultBtn = document.querySelector(`.consult[data-id="${scheduleId}"]`)
    consultBtn.remove()
  }

  const chatDiv = document.createElement('div')
  chatDiv.id = 'chat'
  chatDiv.classList.add('chat-room')
  const messagesList = document.createElement('ul')
  messagesList.id = 'messages'
  messagesList.classList.add('messages-list')
  messagesList.dataset.roomId = roomId

  const messageInput = document.createElement('input')
  messageInput.id = 'message'
  messageInput.classList.add('message-input')
  messageInput.type = 'text'
  messageInput.placeholder = 'Type a message'

  const sendButton = document.createElement('button')
  sendButton.id = 'sendMessage'
  sendButton.classList.add('send-message-btn')
  sendButton.textContent = 'Send'

  const roomIdInput = document.createElement('input')
  roomIdInput.id = 'roomId'
  roomIdInput.classList.add('room-id-input')
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
  addSendMsgListeners(user)
}

// source:coachGetPostContent(scheduleId)
export async function renderConsultPostContent (post) {
  console.log(post)
  const postContainer = document.getElementById('consult-post-container')
  // Create a post wrapper
  const newPostWrapper = document.createElement('div')
  newPostWrapper.classList.add('post-wrapper')
  postContainer.appendChild(newPostWrapper)
  console.log(newPostWrapper)

  const allPostWrapper = document.querySelectorAll('.post-wrapper')
  console.log(allPostWrapper)

  const postWrapper = allPostWrapper[allPostWrapper.length - 1]
  console.log(postWrapper)
  // Create a container for each post
  const postElement = document.createElement('div')
  postElement.classList.add('consult-post')
  // postElement.dataset.id = post.id

  const scheduleNameDiv = document.createElement('div')
  scheduleNameDiv.classList.add('schedule-name')
  const now = new Date()
  const formattedDate = now.toLocaleString('en-US', { timeZone: 'Asia/Taipei', hour12: false })

  scheduleNameDiv.innerText = `${post.scheduleName}`// / ${formattedDate}
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
}

// source:coachGetPostItems(scheduleId)
export async function renderExerciseInConsult (scheduleItems) {
  const existingConsultPost = document.querySelectorAll('.consult-post')
  const consultPost = existingConsultPost[existingConsultPost.length - 1]
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

export async function renderFirstStudentPost () {
  console.log('renderFirstStudentPost')
  const firstStudentItem = document.querySelector('.student-list-item')
  console.log(firstStudentItem)
  if (firstStudentItem) {
    firstStudentItem.classList.add('active')
    const currentStudentId = firstStudentItem.dataset.studentId
    const currentStudentPosts = document.querySelectorAll(`.post-wrapper[data-student-id="${currentStudentId}"]`)
    console.log(currentStudentPosts)
    currentStudentPosts.forEach(item => item.style.display = 'block')
    console.log(currentStudentPosts)
  }
}

export async function renderFilteredStudentList(studentId) {
  console.log('renderFilteredStudentList');
  // Hide all posts first
  const allPosts = document.querySelectorAll('.post-wrapper');
  allPosts.forEach(post => post.style.display = 'none');

  // Show only the posts of the clicked student
  const currentStudentPosts = document.querySelectorAll(`.post-wrapper[data-student-id="${studentId}"]`);
  currentStudentPosts.forEach(post => post.style.display = 'block');
}

export async function renderNotificationDot(unreadRoomIds) {
  const studentIds = unreadRoomIds.map(roomId => roomId.split('_')[0])
  const allItems = Array.from(document.querySelectorAll('.student-list-item'));
  let studentListItems = []

  studentIds.forEach(id => {
    console.log(allItems,"allItems")
    const item = allItems.find(item => item.dataset.studentId === id)
    if (item) {
      studentListItems.push(item)
    }
  })
  console.log(studentListItems)
  allItems.forEach(item => {
    // Create a new redDot for each item
    const redDot = document.createElement('div');
    redDot.classList.add('red-dot');
    redDot.style.display = 'none';

    // Only insert if there isn't already a red-dot
    if (!item.querySelector('.red-dot')) {
      item.insertAdjacentElement('afterbegin', redDot);
    }
  });
  console.log(studentListItems)
  studentListItems.forEach(item => {
    item.querySelector('.red-dot').style.display = 'block';
  })
}

export async function renderConsultRoomUnread(unreadRoomIds, user) { //render for user
  console.log('renderConsultRoomUnread', unreadRoomIds)
  const unreadScheduleIds = unreadRoomIds.map(roomId => roomId.split('_')[2])
  console.log(unreadScheduleIds)

  //student's post
  unreadScheduleIds.forEach(scheduleId => {
    const post = document.querySelector(`.post[data-id="${scheduleId}"]`)
    console.log(post)

    if (post) { // a way to check if user is student
      const postWrapper = post.closest('.post-wrapper');
      postWrapper.style.border = '1px solid red';
      postWrapper.style.backgroundColor = '#696969';
      postWrapper.classList.add('unread') 

      // Get the calendar instance
      const calendar = window.calendar; // Use the globally accessible calendar instance

      if (!calendar) {
        console.error('Calendar not initialized');
        return;
      }

      const calendarEl = document.getElementById('calendar');
      const eventElement = calendarEl.querySelector(`[data-schedule-id="${scheduleId}"]`);
      console.log(eventElement,"eventElement")

      if (eventElement) {
        eventElement.style.backgroundColor = '#FF00FF';

        const titleElement = eventElement.querySelector('.fc-event-title');
        if (titleElement) {
          titleElement.innerText += ' 🔔'; // Add bell icon to the title text
        }
      }
    }
  }) 

  //coach's post
  unreadRoomIds.forEach(roomId => {
    const post = document.querySelector(`.consult-room[data-room-id="${roomId}"]`)
    if (post) { // a way to check if user is coach
      const postWrapper = post.closest('.post-wrapper');
      postWrapper.style.border = '3px solid';
      postWrapper.style.backgroundColor = '#696969';
      postWrapper.classList.add('unread')  
    }
  })
}

//addListenerPost(user) clear unread consultRoom background and border
export async function clearConsultRoomUnread(user) {

  console.log('clearConsultRoomUnread')
  const allPosts = document.querySelectorAll('.post-wrapper');
  allPosts.forEach(post => {
    post.addEventListener('click', async () => {
      
      console.log(post)
      if (!post.querySelector('#messages')) {
        return
      }

      if(post.classList.contains('unread')){
        console.log(post.querySelector('#messages').dataset.roomId)
        const roomId = post.querySelector('#messages').dataset.roomId

        if (roomId) {
          console.log('Clicked post roomId:', roomId);
          await deleteUnreadRoomId(roomId)
        } else {
          console.log('No roomId found for this post');
        }
        post.classList.remove('unread')
        post.style.border = '';
        post.style.backgroundColor = '';

        // when clear consultRoom unread, check if student still(need red dot) has unread post
        if (user.isCoach) {
          console.log(roomId)
          const clickedStudentId = roomId.split('_')[0]
          // Get all visible post-wrappers
          const visiblePostWrappers = document.querySelectorAll('.post-wrapper[style*="display: block"]');
          // Check if any visible post-wrapper has the 'unread' class
          const hasUnread = Array.from(visiblePostWrappers).some(wrapper => wrapper.classList.contains('unread'));

          // If no visible post-wrapper has 'unread' class, hide the red dot
          if (!hasUnread) {
            const studentListItem = document.querySelector(`.student-list-item[data-student-id="${clickedStudentId}"]`);
            if (studentListItem) {
              const redDot = studentListItem.querySelector('.red-dot');
              if (redDot) {
                redDot.style.display = 'none';
              }
            }
          }
        } else { //if user is student, clear calendar event notification
          const scheduleId = roomId.split('_')[2]

          const calendarEl = document.getElementById('calendar');
          const eventElement = calendarEl.querySelector(`[data-schedule-id="${scheduleId}"]`);
          console.log(eventElement, "eventElement")

          if (eventElement) {
            eventElement.style.backgroundColor = '#3788d8';

            const titleElement = eventElement.querySelector('.fc-event-title');
            if (titleElement) {
              // Remove the bell icon if it exists
              titleElement.innerText = titleElement.innerText.replace(' 🔔', '');
            }
          }
        }
      }
      

      
      
    })
  });

}
//export async function renderConsultRoom
// export async function renderSelectedStudentListItem(studentId) {
//   console.log('renderSelectedStudentListItem');
//   const studentListContainer = document.getElementById('student-list-container');
//   const studentListItems = studentListContainer.querySelectorAll('.student-list-item');

//   studentListItems.forEach(item => {
//     if (item.dataset.studentId === studentId) {
//       item.classList.add('selected');
//     }
//   });
// }

// export async function renderCoachConsultRoom(studentName, incomeNotification) {
//   if (window.location.pathname === '/consult') {
//     console.log(incomeNotification)
//     // Render chat room
//     const itemData = await coachGetPostItems(incomeNotification.scheduleId)
//     const post = await coachGetPostContent(incomeNotification.scheduleId)
//     console.log(post)
//     //await renderConsultPostContent(post)
//     console.log(itemData)
//     const items = itemData.items
//     //await renderExerciseInConsult(items)
//     //await renderConsultRoom(incomeNotification.scheduleId, incomeNotification.roomId, studentName, user)
//   }
// }

