const express = require('express')
const cookieParser = require('cookie-parser');
const csrfProtection = require('./middleware/csrf');
const helmet = require('helmet');
const http = require('http')
const { redisClient, connectRedis } = require('./services/redisService')
const { initializeSocket } = require('./services/socketService')

const path = require('path')
const app = express()
app.use(cookieParser());
// Apply CSRF protection to routes that modify data
app.use('/api', csrfProtection, (req, res, next) => {
  res.cookie('XSRF-TOKEN', req.csrfToken()); // Send CSRF token to client
  next();
});
// Use Helmet to set security headers
// Configure Helmet to set a custom Content Security Policy
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'https://d348uiae81km7c.cloudfront.net'],
      scriptSrc: ["'self'", "https://code.jquery.com", 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.global.min.js',
], // Allow jQuery from CDN
      styleSrc: ["'self'", "'unsafe-inline'",
        'https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css',
        'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/main.min.css',], // Allow inline styles
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://i.pinimg.com", "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/", "https://d348uiae81km7c.cloudfront.net",], // Allow images from specific sources
      connectSrc: ["'self'", "https://your-api-domain.com"],
      frameSrc: [
        "'self'",
        "https://giphy.com", // Allow framing from Giphy
      ],
    },
  })
);


const { sequelize } = require('./models')

const exerciseRoutes = require('./routes/exerciseRoutes')
const memberRoutes = require('./routes/memberRoutes')
const moduleRoutes = require('./routes/moduleRoutes')
const scheduleRoutes = require('./routes/scheduleRoutes')
const invitationRoutes = require('./routes/invitationRoutes')

const port = 3000

app.use(express.json())
// Serve static files from the frontend/public directory
app.use(express.static(path.join(__dirname, '../frontend/public')))

app.use('/node_modules', express.static(path.join(__dirname, '../node_modules')))

// Make sure all static files are served correctly(with css function)
app.use('/sections/:sectionId', express.static(path.join(__dirname, '../frontend/public')))

app.use('/parts/:partId', express.static(path.join(__dirname, '../frontend/public')))

app.use('/user/:memberId', express.static(path.join(__dirname, '../frontend/public')))

// !API routes
app.use('/api', exerciseRoutes, memberRoutes, moduleRoutes, scheduleRoutes, invitationRoutes)

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

app.get('/posts', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/post.html'))
})

app.get('/consult', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/consult.html'))
})

async function startServer () {
  try {
    //await testRedisConnection()
    await connectRedis()

    await sequelize.sync({ alter: false })

    // Initialize Socket.io with the HTTP server
    const server = http.createServer(app)
    server.timeout = 600000
    const io = initializeSocket(server)

    // Start the server
    server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`)
    })
  } catch (error) {
    console.error('Error during server startup:', error)
    process.exit(9000) // Exit the process with an error code
  }
}

// Start the server
startServer()

// Handle process termination
process.on('SIGINT', () => {
  console.log('Closing Redis client...')
  redisClient.quit(() => {
    console.log('Redis client closed')
    process.exit(0)
  })
})