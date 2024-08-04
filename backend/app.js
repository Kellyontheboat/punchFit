const express = require('express')
const path = require('path')
const app = express()
const { sequelize } = require('./models')
const exerciseRoutes = require('./routes/exerciseRoutes')
const port = process.env.PORT || 3000

// Serve static files from the frontend/public directory
app.use(express.static(path.join(__dirname, '../frontend/public')))

// API routes
app.use('/api', exerciseRoutes)

// Frontend routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'))
})

app.get('/sections/:sectionId/parts', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/parts.html'))
})

app.get('/parts/:partId/exercises', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/exercises.html'))
})

// Sync models and start the server
sequelize.sync({ alter: false }).then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
  })
}).catch(error => {
  console.error('Unable to sync the database:', error)
})

// backend / app.js
// backend / routes / exercisesRoutes.js
// frontend / public / exercises.html
