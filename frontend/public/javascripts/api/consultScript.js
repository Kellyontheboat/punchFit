import { renderInviteForm, renderConsultRoom, renderConsultPostContent, renderExerciseInConsult, renderFirstStudentPost, renderFilteredStudentList, renderNotificationDot, renderConsultRoomUnread, clearConsultRoomUnread } from '../render/consultRender.js'
import { getCookie } from './authScript.js'
let socket;

const csrfToken = getCookie('XSRF-TOKEN')
const token = localStorage.getItem('token')

export async function addListenerConsultBtn (user) {
  const consultBtns = document.querySelectorAll('.consult')

  consultBtns.forEach(btn => btn.addEventListener('click', async (event) => {
    const scheduleId = event.currentTarget.dataset.id
    if (btn.innerText === 'Consult Coach') {
      btn.innerText = 'Cancel'
      btn.classList.add('cancel-consult-btn')
      await renderInviteForm(scheduleId)
      submitInviteForm(user, scheduleId)
    } else { // if the btn innerText is Cancel been clicked
      btn.innerText = 'Consult Coach'
      if (inviteForm) {
        inviteForm.remove()
      }
    }
  })
  )
}

let inviteFormListener = null;

export async function submitInviteForm(user, scheduleId) {
  const inviteForm = document.querySelector(`.invite-form[data-schedule-id="${scheduleId}"]`)
  // Remove existing listener if any
  if (inviteFormListener) {
    inviteForm.removeEventListener('submit', inviteFormListener);
  }

  //inviteForm.addEventListener('submit', async (event) => {
  inviteFormListener = async (event) => {
    event.preventDefault()
    const submitBtn = document.querySelector('.share-btn')
    submitBtn.style.display = 'none'

    const formData = new FormData(event.target)
    const data = {
      scheduleId: formData.get('scheduleId')
    };

    // Convert scheduleId to number and perform client-side validation
    data.scheduleId = Number(data.scheduleId);
    if (!data.scheduleId || Number.isNaN(data.scheduleId)) {
      alert('Invalid schedule ID. Please ensure it is a valid number.');
      submitBtn.style.display = 'block';
      return;
    }
    
    try {
      // Wait for the response before proceeding
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Error sending invitation');

      const { invitation, studentName } = await response.json();
      const { student_id, coach_id, schedule_id } = invitation;
      const roomId = `${student_id}_${coach_id}_${schedule_id}`;

      await renderConsultRoom(roomId, studentName, user);

      if (socket) {
        
        // Set up a listener for the joinRoomResponse event
        socket.on('joinRoomResponse', (response) => {
          console.log('joinRoomResponse', response)
        });

        socket.emit('joinRoom', roomId, (response) => {
          console.log(`Joined new room emit callback: ${roomId}`, response);
        });
        sendMessage(roomId, "Hi教練，想諮詢有關本次訓練！", user)

      } else {
        console.error('Socket is not initialized');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
    }
  };
  inviteForm.addEventListener('submit', inviteFormListener);

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
  return postContent
}

export function initUserSocket(user) {
  if (!socket) {
    socket = io({
      auth: { token }
    });

  socket.on('connect', () => {
    socket.emit('userOnline');
  });

    socket.on('allRoomMessages', async ({roomsData, unreadRoomIds}) => { //roomsData: [{ roomId: schedule.roomId, messages }]

    for (const { roomId, messages, studentName } of roomsData) {

      if (user.isCoach) {

      const itemData = await coachGetPostItems(roomId);
      const post = await coachGetPostContent(roomId);

      await renderConsultPostContent(post);
      await renderExerciseInConsult(itemData.items);
        await renderConsultRoom(roomId, studentName, user);
        await renderMessages(roomId, messages, user);
        
    } else {
      await renderConsultRoom(roomId, studentName, user);
      await renderMessages(roomId, messages, user);
      }
    }

      if (user.isCoach) {
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
    renderConsultRoom(roomId, user.username, user.id);
    renderMessages(roomId, messages, user);
  });

  socket.on('chatMessage', (message) => {
    appendMessage(message.roomId, message, user);

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
      if (user.isCoach) {
        await handleCoachNotification(data, user, socket); // prepare post content
        let unreadRoomIds = []
        unreadRoomIds.push(data.roomId)
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
  const { scheduleId, roomId, studentName } = data;
  const itemData = await coachGetPostItems(data.roomId);
  const post = await coachGetPostContent(data.roomId);
  await renderConsultPostContent(post); //create postWrapper
  await renderExerciseInConsult(itemData.items);
  await renderConsultRoom(roomId, studentName, user); //will none all postWrapper
  const studentId = document.querySelector('.student-list-item.active')?.dataset.studentId
  renderFilteredStudentList(studentId)//render back the post none by renderConsultRoom
  clearConsultRoomUnread(user)
  if (socket) {
    socket.emit('joinRoom', (roomId), (response) => {
      console.log(`Joined new room emit: ${roomId}`, response);
    });
    const messages = [{text: "Hi教練，想諮詢有關本次訓練！", sender_id: `${roomId.split('_')[0]}`, user: {id: `${roomId.split('_')[1]}`}}]
    renderMessages(roomId, messages, user)
  } else {
    console.error('Socket is not initialized');
  }
}

async function renderMessages(roomId, messages, user) {
  const messagesList = document.querySelector(`#messages[data-room-id="${roomId}"]`);
  if (!messagesList) return;
  messagesList.innerHTML = '';
  messages.forEach(message => appendMessage(roomId, message, user));
}

// handle chat message
function appendMessage(roomId, message, user) {
  const messagesList = document.querySelector(`#messages[data-room-id="${roomId}"]`);
  if (!messagesList) {
    return;
  }
  const messageElement = document.createElement('li');
  const hr = document.createElement('hr')

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
    return;
  }

  const roomId = chatRoom.querySelector('.room-id-input').value;
  const messageInput = chatRoom.querySelector('.message-input');

  if (!roomId) {
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
  if (text > 200) {
    alert('Message is too long. Please limit your message to 200 characters.');
    return;
  }
  if(!socket) {
    socket = io({
      auth: { token }
    });
  }

  if (text.length > 200) {
    alert('Message is too long. Please limit your message to 200 characters.');
    return;
  }
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
      Authorization: `Bearer ${token}`,
      'X-CSRF-Token': csrfToken
    }
  })

}

export async function coachGetNotification() {
  try {
    const response = await fetch('/api/invitations', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const invitationContent = await response.json()
    return invitationContent

  } catch (error) {
    console.error('Error fetching notifications:', error)
  }
}