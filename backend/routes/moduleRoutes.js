const express = require('express')
const router = express.Router()
const moduleControllers = require('../controllers/moduleControllers')
const authenticateToken = require('../middleware/auth')

router.post('/modules', authenticateToken, moduleControllers.createModule
)

router.get('/sections/modules', authenticateToken, moduleControllers.getModulesBySections)

router.get('/sections/:sectionId/modules', authenticateToken, moduleControllers.getModuleBySection)

router.get('/modules/:moduleId/exercises', authenticateToken, moduleControllers.getExerciseInModule)

router.patch('/modules/:moduleId/exercises', authenticateToken, moduleControllers.updateExerciseInModule)

module.exports = router
