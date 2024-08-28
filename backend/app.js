const express = require('express')
// const helmet = require('helmet')
const { testRedisConnection, redisClient } = require('./services/redisService');

const path = require('path')
const app = express()

const { sequelize } = require('./models')

const exerciseRoutes = require('./routes/exerciseRoutes')
const memberRoutes = require('./routes/memberRoutes')
const moduleRoutes = require('./routes/moduleRoutes')
const scheduleRoutes = require('./routes/scheduleRoutes')

const port = 3000

// const cspDirectives = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://raw.githubusercontent.com;";

// app.use((req, res, next) => {
//   res.setHeader("Content-Security-Policy", cspDirectives);
//   next();
// });

app.use(express.json())
// Serve static files from the frontend/public directory
app.use(express.static(path.join(__dirname, '../frontend/public')))

app.use('/node_modules', express.static(path.join(__dirname, '../node_modules')))

// Make sure all static files are served correctly(with css function)
app.use('/sections/:sectionId', express.static(path.join(__dirname, '../frontend/public')))

app.use('/parts/:partId', express.static(path.join(__dirname, '../frontend/public')))

app.use('/user/:memberId', express.static(path.join(__dirname, '../frontend/public')))

// !API routes
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

async function startServer() {
  try {
    // Run Redis connection test
    await testRedisConnection();

    // Sync Sequelize models
    await sequelize.sync({ alter: false });

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error during server startup:', error);
    process.exit(9000); // Exit the process with an error code
  }
}

// Start the server
startServer();

//Handle process termination
process.on('SIGINT', () => {
  console.log('Closing Redis client...');
  redisClient.quit(() => {
    console.log('Redis client closed');
    process.exit(0);
  });
});

// backend / app.js
// backend / routes / exercisesRoutes.js
// frontend / public / exercises.html
