const express = require('express')
const router = express.Router()
const memberControllers = require('../controllers/memberControllers')

// ! /api
// Define the route to handle query parameters
router.get('/user/auth', memberControllers.authenticate)

router.put('/user/auth', memberControllers.login)

// // Get parts for a specific section
// router.get('/sections/:sectionId/parts', exerciseControllers.getBodyPartsBySections)

// router.get('/parts/:partId/exercises', exerciseControllers.getExercisesByPart)

module.exports = router
