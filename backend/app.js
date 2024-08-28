const express = require('express')
const path = require('path')
const http = require('http')
const { Server } = require('socket.io')
const { sequelize } = require('./models')
const exerciseRoutes = require('./routes/exerciseRoutes')
const memberRoutes = require('./routes/memberRoutes')
const moduleRoutes = require('./routes/moduleRoutes')
const scheduleRoutes = require('./routes/scheduleRoutes')

const port = 3000
const app = express()
const server = http.createServer(app) // Create an HTTP server
const io = new Server(server) // Initialize Socket.io with the HTTP server

// Socket.io connection
io.on('connection', (socket) => {
  console.log('a user connected')
  // Handle socket events here
})

// Middleware and API routes
app.use(express.json())
app.use(express.static(path.join(__dirname, '../frontend/public')))
app.use('/node_modules', express.static(path.join(__dirname, '../node_modules')))
app.use('/sections/:sectionId', express.static(path.join(__dirname, '../frontend/public')))
app.use('/parts/:partId', express.static(path.join(__dirname, '../frontend/public')))
app.use('/user/:memberId', express.static(path.join(__dirname, '../frontend/public')))
app.use('/api', exerciseRoutes, memberRoutes, moduleRoutes, scheduleRoutes)

// Frontend routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'))
})

app.get('/training', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/training.html'))
})

app.get('/menu', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/menu.html'))
})

app.get('/module', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/module.html'))
})

app.get('/sections/:sectionId/parts', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/parts.html'))
})

app.get('/parts/:partId/exercises', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/exercises.html'))
})

app.get('/schedules', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/schedules.html'))
})

app.get('/consult', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/consult.html'))
})

// Sync models and start the server
sequelize.sync({ alter: false }).then(() => {
  server.listen(port, '0.0.0.0', () => { // Use the HTTP server for listening
    console.log(`Server is running on http://localhost:${port}`)
  })
}).catch(error => {
  console.error('Unable to sync the database:', error)
})

// backend / app.js
// backend / routes / exercisesRoutes.js
// frontend / public / exercises.html
