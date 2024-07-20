const express = require('express');
const router = express.Router();
const exerciseControllers = require('../controllers/exerciseControllers');

// Define the route to handle query parameters
router.get('/exercises', exerciseControllers.getExercisesByBodyPart);

module.exports = router;