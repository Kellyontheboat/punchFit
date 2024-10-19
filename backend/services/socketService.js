const { Server } = require('socket.io')
const redisAdapter = require('socket.io-redis')
const redisConfig = require('../config/redisConfig')
const { redisClient } = require('../services/redisService') //, redisPubClient, redisSubClient
const { getSchedulesForUser, getMessagesForRoom, saveMessageToRoom, getPostItems, getPostContent } = require('../services/messageService')
const jwt = require('jsonwebtoken')
const sanitizeHtml = require('sanitize-html')

let io
const userSocketMap = new Map()

function initializeSocket (server) {
  io = new Server(server)

  // Use Redis adapter for Socket.IO
  io.adapter(redisAdapter({
    host: redisConfig.host,
    port: redisConfig.port
  }))

  console.log('redisConfig', redisConfig)
  // Add authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error('Authentication error: No token provided'))
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        return next(new Error('Authentication error: Invalid token'))
      }

      // Attach the decoded user information to the socket
      socket.user = decoded
      socket.memberId = decoded.id
      socket.isCoach = decoded.isCoach
      next()
    })
  })

  io.on('connection', (socket) => {
    console.log(`User ${socket.memberId} connected. Is coach: ${socket.isCoach}`)

    // Register the userId and socketId mapping
    userSocketMap.set(socket.memberId, socket.id)
    console.log(`User ${socket.memberId} registered with socket ${socket.id}`)

    // Handle user connection
    socket.on('userOnline', async () => {
      const { schedules, unreadRoomIds } = await getSchedulesForUser(socket.memberId, socket.isCoach)
      console.log('schedules here', socket.memberId, socket.isCoach, schedules)
      const roomPromises = schedules.map(async (schedule) => {
        socket.join(schedule.roomId)
        const { messages, studentName } = await getMessagesForRoom(schedule.roomId)
        const items = await getPostItems(schedule.id)
        const content = await getPostContent(schedule.id)
        return { roomId: schedule.roomId, messages, items, content, studentName }
      })

      const roomsData = await Promise.all(roomPromises)
      console.log('roomsData allRoomMessages', roomsData)
      socket.emit('allRoomMessages', { roomsData, unreadRoomIds })
      if (unreadRoomIds.length > 0) {
        redisClient.SADD(`unreadRoomIds:${socket.memberId}`, unreadRoomIds)
      }

      // if isCoach, get postItems and postContent
      // emit postItems and postContent
    })

    // Handle chat messages
    socket.on('chatMessage', async (message) => {
      try {
        // Validate message length
        if (typeof message.text !== 'string' || message.text.length > 200) {
          throw new Error('Invalid message length')
        }

        // Sanitize message content
        const sanitizedMessageText = sanitizeHtml(message.text, {
          allowedTags: [], // Disallow all HTML tags
          allowedAttributes: {}
        })

        // Update the message with sanitized content
        message.text = sanitizedMessageText

        console.log('message received:', message)
        await saveMessageToRoom(message) // save into DB and Redis

        // Emit the message to the room
        io.to(message.roomId).emit('chatMessage', message)
        const role = message.user.isCoach ? 'coach' : 'student'
        let receiverId
        if (role === 'student') {
          receiverId = message.roomId.split('_')[1]
        } else {
          receiverId = message.roomId.split('_')[0]
        }
        console.log('receiverId', message.roomId)
        const roomIds = []
        roomIds.push(message.roomId)
        if (roomIds.length > 0) {
          redisClient.SADD(`unreadRoomIds:${receiverId}`, roomIds)
        }
      } catch (error) {
        console.error('Error handling chat message:', error)
      }
    })

    // Handle room joining
    socket.on('joinRoom', (roomId) => {
      socket.join(roomId)
      console.log(`User joined room: ${roomId}`)
    })

    // Handle disconnection and remove from map
    socket.on('disconnect', () => {
      userSocketMap.delete(socket.memberId)
      console.log(`User ${socket.memberId} disconnected`)
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

async function notifyUser (userId, message, roomId, scheduleId, studentName, studentId) {
  const socketId = userSocketMap.get(userId)
  if (socketId) {
    const io = getIo()
    io.to(socketId).emit('notification', { message, roomId, scheduleId, studentName, studentId })
  }
}

module.exports = {
  initializeSocket,
  getIo,
  notifyUser,
  io: () => io // Export as a function to init
}
