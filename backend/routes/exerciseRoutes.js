const express = require('express')
const router = express.Router()
const exerciseControllers = require('../controllers/exerciseControllers')

// router /api
// Define the route to handle query parameters
router.get('/sections', exerciseControllers.getBodySections)

// Get parts for a specific section
router.get('/sections/:sectionId/parts', exerciseControllers.getBodyPartsBySections)

router.get('/parts/:partId/exercises', exerciseControllers.getExercisesByPart)

// Get exercises for a specific part
// router.get('/api/parts/:partId/exercises', (req, res) => {
//   const partId = req.params.partId;
//   const partExercises = exercises[partId] || [];
//   res.json(partExercises);
// });

module.exports = router
