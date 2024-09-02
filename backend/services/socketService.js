const { Server } = require('socket.io');

let io;

function initializeSocket(server) {
  io = new Server(server);

  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });

    // Handle other events
    socket.on('chatMessage', (message) => {
      console.log('message received:', message);
      io.emit('chatMessage', message);
    });
  });

  return io;
}

function getIo() {
  if (!io) {
    throw new Error('Socket.io has not been initialized');
  }
  return io;
}

module.exports = {
  initializeSocket,
  getIo,
};
