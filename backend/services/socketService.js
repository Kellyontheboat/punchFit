const { Server } = require('socket.io')

let io
const userSocketMap = new Map()

function initializeSocket (server) {
  io = new Server(server)

  io.on('connection', (socket) => {
    console.log('a user connected')

    // Register the userId and socketId mapping
    socket.on('register', (userId) => {
      userSocketMap.set(userId, socket.id)
      console.log(`User ${userId} registered with socket ${socket.id}`)
    })

    // Handle room joining
    socket.on('joinRoom', (roomId) => {
      socket.join(roomId)
      console.log(`User joined room: ${roomId}`)
    })

    // Handle disconnection and remove from map
    socket.on('disconnect', () => {
      userSocketMap.forEach((value, key) => {
        if (value === socket.id) {
          userSocketMap.delete(key)
          console.log(`User ${key} disconnected`)
        }
      })
    })

    // Handle chat messages
    socket.on('chatMessage', (message) => {
      console.log('message received:', message)
      io.to(message.roomId).emit('chatMessage', message)
    })
  })

  return io
}

function getIo () {
  if (!io) {
    throw new Error('Socket.io has not been initialized')
  }
  return io
}

async function notifyUser (userId, message, roomId) {
  const socketId = userSocketMap.get(userId)
  if (socketId) {
    const io = getIo()
    io.to(socketId).emit('notification', { message, roomId })
  }
}

module.exports = {
  initializeSocket,
  getIo,
  notifyUser
}
