// Ensure you have socket.io-client installed and imported
// import io from 'socket.io-client';

const socket = io('http://localhost:3000') // Adjust the URL as needed

socket.on('connect', () => {
  console.log('Connected to server')
})

// Optionally handle other events
socket.on('disconnect', () => {
  console.log('Disconnected from server')
})

// // Handle incoming chat messages
// export async function handleInMsg () {
//   socket.on('chat message', (message) => {
//     const messagesDiv = document.getElementById('messages');
//     const messageElement = document.createElement('p');
//     messageElement.textContent = message;
//     messagesDiv.appendChild(messageElement);
//   });
// }

// export async function uploadNotification () {
//   // Handle upload notifications
//   socket.on('upload notification', (message) => {
//     alert(`New upload notification: ${message}`);
//   });
// }

// export async function sendMsg () {
//   // Send a chat message
//   document.getElementById('send').addEventListener('click', () => {
//     const messageInput = document.getElementById('message');
//     const message = messageInput.value;
//     socket.emit('chat message', { coachId: 'someCoachId', message: message });
//     messageInput.value = '';
//   });
// }
