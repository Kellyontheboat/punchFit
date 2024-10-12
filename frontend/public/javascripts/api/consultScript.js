import { renderInviteForm, renderConsultRoom, renderConsultPostContent, renderExerciseInConsult, renderFirstStudentPost, renderFilteredStudentList, renderNotificationDot, renderConsultRoomUnread, clearConsultRoomUnread } from '../render/consultRender.js'

let socket;

const token = localStorage.getItem('token')

export async function addListenerConsultBtn (user) {
  console.log(user)
  const consultBtns = document.querySelectorAll('.consult')

  consultBtns.forEach(btn => btn.addEventListener('click', async (event) => {
    const scheduleId = event.currentTarget.dataset.id
    const inviteForm = document.querySelector(`#invite-form input[name="scheduleId"][value="${scheduleId}"]`)?.closest('#invite-form');
    console.log(inviteForm)
    if (btn.innerText === 'Consult Coach') {
      btn.innerText = 'Cancel'
      btn.classList.add('cancel-consult-btn')
      console.log(scheduleId)
      //addListenerCancelConsultBtn(scheduleId)
      await renderInviteForm(scheduleId)
      submitInviteForm(user, socket)
    } else { // if the btn innerText is Cancel been clicked
      btn.innerText = 'Consult Coach'
      if (inviteForm) {
        inviteForm.remove()
      }
    }
  })
  )
}

export async function submitInviteForm(user) {
  const inviteForm = document.getElementById('invite-form');
  inviteForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    const submitBtn = document.querySelector('.share-btn')
    const consultBtn = document.querySelector('.consult')
    submitBtn.style.display = 'none'
    consultBtn.style.display = 'none'

    const formData = new FormData(event.target)
    const data = {
      scheduleId: formData.get('scheduleId')
    };

    try {
      // Wait for the response before proceeding
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Error sending invitation');

      const { invitation, studentName } = await response.json();
      const { student_id, coach_id, schedule_id } = invitation;
      const roomId = `${student_id}_${coach_id}_${schedule_id}`;

      //add studentName if not exist
      //const studentListContainer = document.getElementById('consult-student-list-container');
      //console.log(studentListContainer)
      // if (studentListContainer) {
      //   const existingStudentItems = studentListContainer.querySelectorAll('.student-list-item');
      //   let studentExists = false;
      //   for (let item of existingStudentItems) {
      //     if (item.textContent.trim() === studentName) {
      //       studentExists = true;
      //       break; //once found, break the loop
      //     }
      //   }

      //   if (!studentExists) {
      //     const newStudentItem = document.createElement('div');
      //     newStudentItem.className = 'student-list-item';
      //     newStudentItem.dataset.studentId = student_id;
      //     newStudentItem.textContent = studentName;
      //     studentListContainer.appendChild(newStudentItem);
      //   }
      // }
      await renderConsultRoom(roomId, studentName, user);

      if (socket) {
        console.log('Socket connection status:', socket.connected);
        
        // Set up a listener for the joinRoomResponse event
        socket.on('joinRoomResponse', (response) => {
          console.log(`Received joinRoomResponse for room ${response.roomId}:`, response);
        });

        socket.emit('joinRoom', roomId, (response) => {
          console.log(`Joined new room emit callback: ${roomId}`, response);
        });
        sendMessage(roomId, "教練想諮詢有關本次訓練！", user)


      } else {
        console.error('Socket is not initialized');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
    }
  });
}

export async function coachGetPostItems (roomId) {
  const scheduleId = roomId.split('_')[2]
  const response1 = await fetch(`/api/schedules/${scheduleId}/items?consulting=true`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const postItems = await response1.json()
  console.log('postItems:', postItems)
  return postItems
}

export async function coachGetPostContent (roomId) {
  const scheduleId = roomId.split('_')[2]
  const response2 = await fetch(`/api/schedules/${scheduleId}/${roomId}/video?consulting=true`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  const postContent = await response2.json()
  console.log('postContent:', postContent)
  return postContent
}

export function initUserSocket(user) {
  console.log('initUserSocket', user)
  if (!socket) {
    socket = io({
      auth: { token }
    });

  socket.on('connect', () => {
    console.log('Connected to server');
    socket.emit('userOnline');
    //handleUserRooms(user)
  });

    socket.on('allRoomMessages', async ({roomsData, unreadRoomIds}) => { //roomsData: [{ roomId: schedule.roomId, messages }]
      console.log('Received all room messages:', roomsData, unreadRoomIds);

    for (const { roomId, messages, studentName } of roomsData) {

      if (user.isCoach) {
      console.log('roomId:', roomId, 'messages:', messages)

      const itemData = await coachGetPostItems(roomId);
      const post = await coachGetPostContent(roomId);

      console.log('post:', post)
      await renderConsultPostContent(post);
      console.log('itemData:', itemData.items)
      await renderExerciseInConsult(itemData.items);
        await renderConsultRoom(roomId, studentName, user);
        await renderMessages(roomId, messages, user);
        
    } else {
      await renderConsultRoom(roomId, studentName, user);
      await renderMessages(roomId, messages, user);
      }
    }

      if (user.isCoach) {

        //const notificationData = await coachGetNotification() 
        //console.log('notificationData', notificationData)
        await renderFirstStudentPost()
        addListenerStudentList()
        renderNotificationDot(unreadRoomIds) //studentList
        await renderConsultRoomUnread(unreadRoomIds, user)
        clearConsultRoomUnread(user) //addListenerPost if click then clear unread
      } else {
        await renderConsultRoomUnread(unreadRoomIds, user)
        clearConsultRoomUnread(user)
      }
  });

  socket.emit('joinRoom', (roomId) => {
    console.log(`Joined new room: ${roomId}`);
    renderConsultRoom(roomId, user.username, user.id);
    renderMessages(roomId, messages, user);
  });

  socket.on('chatMessage', (message) => {
    console.log('Received chat message:', message);
    appendMessage(message.roomId, message, user);

    //
    if (message.user.id !== user.id){
      let unreadRoomIds = []
      unreadRoomIds.push(message.roomId)
      renderConsultRoomUnread(unreadRoomIds, user)// include render calendar bell

      if (user.isCoach) {// if is coach, render red dot on studentList
        renderNotificationDot(unreadRoomIds)
      }
    }
    
  });

    socket.on('notification', async(data) => {
      console.log('Notification received:', data);
      console.log('user role', user)
      if (user.isCoach) {
        console.log('user is coach')
        await handleCoachNotification(data, user, socket); // prepare post content
        let unreadRoomIds = []
        unreadRoomIds.push(data.roomId)
        console.log('notification data', data)
        renderNotificationDot(unreadRoomIds)
        renderConsultRoomUnread(unreadRoomIds, user)
      }
    });

    socket.on('joinRoomResponse', (response) => {
      console.log(`Received joinRoomResponse for room ${response.roomId}:`, response);
    });
    return socket;
  }
}

// prepare post content and render for coach
async function handleCoachNotification(data, user, socket) {
  console.log('handleCoachNotification', data)
  const { scheduleId, roomId, studentName } = data;
  const itemData = await coachGetPostItems(data.roomId);
  const post = await coachGetPostContent(data.roomId);
  await renderConsultPostContent(post); //create postWrapper
  await renderExerciseInConsult(itemData.items);
  await renderConsultRoom(roomId, studentName, user); //will none all postWrapper
  const studentId = document.querySelector('.student-list-item.active')?.dataset.studentId
  renderFilteredStudentList(studentId)//render back the post none by renderConsultRoom
  clearConsultRoomUnread(user)
  console.log('handleCoachNotification socket', socket)
  if (socket) {
    socket.emit('joinRoom', (roomId), (response) => {
      console.log(`Joined new room emit: ${roomId}`, response);
    });
  } else {
    console.error('Socket is not initialized');
  }
}

async function renderMessages(roomId, messages, user) {
  const messagesList = document.querySelector(`#messages[data-room-id="${roomId}"]`);
  if (!messagesList) return;
  console.log(messagesList)
  messagesList.innerHTML = '';
  console.log(user)
  messages.forEach(message => appendMessage(roomId, message, user));
}

// handle chat message
function appendMessage(roomId, message, user) {
  console.log(message, user.id)
  const messagesList = document.querySelector(`#messages[data-room-id="${roomId}"]`);
  console.log(messagesList)
  if (!messagesList) {
    console.error(`Message list not found for room ${roomId}`);
    return;
  }
  console.log(messagesList)
  const messageElement = document.createElement('li');
  const hr = document.createElement('hr')
  console.log(message.sender_id)

  // Check if the message is from the current user
  if ((message.sender_id || message.user.id) === user.id) {

    messageElement.textContent = `You: ${message.message_text || message.text}`
    messageElement.style.textAlign = 'right'
  } else {
    messageElement.textContent = `${user.isCoach ? 'Student' : 'Coach'}: ${message.message_text || message.text}`
    messageElement.style.textAlign = 'left'
  }
  messageElement.appendChild(hr)
  messagesList.appendChild(messageElement)
}

export function addSendMsgListeners(user) {
  console.log('addSendMsgListeners', user);
  document.querySelectorAll('.send-message-btn').forEach(button => {
    // Remove any existing listener to prevent duplicates
    button.removeEventListener('click', button.sendMessageHandler);
    button.sendMessageHandler = (event) => sendMessageHandler(event, user);
    button.addEventListener('click', button.sendMessageHandler);
  });
}

function sendMessageHandler(event, user) {
  const button = event.target;
  const chatRoom = button.closest('.chat-room');
  if (!chatRoom) {
    console.error('Chat room not found');
    return;
  }

  const roomId = chatRoom.querySelector('.room-id-input').value;
  const messageInput = chatRoom.querySelector('.message-input');

  if (!roomId) {
    console.error('Room ID not found');
    return;
  }

  if (messageInput && messageInput.value.trim()) {
    sendMessage(roomId, messageInput.value.trim(), user);
    messageInput.value = '';
  } else {
    console.error('Message input not found or empty');
  }
}

function sendMessage(roomId, text, user) {
  if(!socket) {
    socket = io({
      auth: { token }
    });
  }
    console.log('Sending message:', { roomId, text });
  socket.emit('chatMessage', { roomId, text, user });
}

export async function addListenerStudentList() {
  const studentListContainer = document.getElementById('student-list-container');
  studentListContainer.removeEventListener('click', handleStudentClick);
  studentListContainer.addEventListener('click', handleStudentClick);
}

function handleStudentClick(event) {
  const studentItem = event.target.closest('.student-list-item');
  if (studentItem) {
    const clickedStudentId = studentItem.dataset.studentId;
    console.log('Clicked student ID:', clickedStudentId);

    // Remove 'active' class from all student items
    const allStudentItems = document.querySelectorAll('.student-list-item');
    allStudentItems.forEach(item => item.classList.remove('active'));

    studentItem.classList.add('active');

    renderFilteredStudentList(clickedStudentId);
  }
}

//delete unreadRoomIds set in redis after user click on the post
export async function deleteUnreadRoomId(roomId) {
  const response = await fetch(`/api/unreadRoomIds/${roomId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

}

export async function coachGetNotification() {
  console.log('check if coach got notification')
  try {
    const response = await fetch('/api/invitations', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const invitationContent = await response.json()
    //const invitationContent = invitationData
    console.log('coachGetNotification', invitationContent)
    return invitationContent
    // const { invitations, studentNames, studentMemberIds } = invitationContent
    // console.log('coachGetNotification', { invitations, studentNames, studentMemberIds })
    // return ({ invitations, studentNames, studentMemberIds })
  } catch (error) {
    console.error('Error fetching notifications:', error)
  }
}

// export async function displayNotification(message) {
//   const redDot = document.querySelector('.red-dot')
//   redDot.style.display = 'block'
//   const welcomeContainer = document.querySelector('.welcome')
//   welcomeContainer.innerText = 'Consultation request:'

//   addListenerNotification()
// }

// export async function addListenerNotification() {
//   const notificationIcon = document.querySelector('.red-dot')
//   notificationIcon.addEventListener('click', () => {
//     // Hide the chat icon
//     const svgElement = document.querySelector('svg')
//     const redDot = document.querySelector('.red-dot')
//     const beforeConsult = document.querySelector('.before-consult')
//     beforeConsult.style.display = 'none'
//     svgElement.style.display = 'none'
//     redDot.style.display = 'none'

//     // Show the consult content post from student
//     const consultContainer = document.getElementById('consult-post-container')
//     consultContainer.style.display = 'block'
//   })
// }