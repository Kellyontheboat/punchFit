const express = require('express')
const router = express.Router()
const exerciseControllers = require('../controllers/exerciseControllers')

// router /api
// Define the route to handle query parameters
router.get('/sections', exerciseControllers.getBodySections)

// Get parts for a specific section
router.get('/sections/:sectionId/parts', exerciseControllers.getBodyPartsBySections)

router.get('/parts/:partId/exercises', exerciseControllers.getExercisesByPart)

module.exports = router
