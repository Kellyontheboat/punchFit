const express = require('express');
const path = require('path');
const app = express();
const exerciseRoutes = require('./routes/exerciseRoutes');
const port = 3000;

// Serve static files from the frontend/public directory
//app.use(express.static(path.join(__dirname, '../frontend/public')));

// API routes
app.use('/api', exerciseRoutes);

// Frontend routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

app.get('/exercises', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/exercises.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


// backend / app.js
// backend / routes / exercisesRoutes.js
// frontend / public / exercises.html