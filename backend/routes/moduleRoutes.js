const express = require('express')
const router = express.Router()
const moduleControllers = require('../controllers/moduleControllers')
const authenticateToken = require('../middleware/auth')

router.post('/modules', moduleControllers.createModule
)

// remember to add authenticate middleware
router.get('/members/:memberId/modules', authenticateToken, moduleControllers.getModules)

router.get('/parts/:partId/modules', authenticateToken, moduleControllers.getModuleByPart)

router.get('/sections/:sectionId/modules', authenticateToken, moduleControllers.getModuleBySection)

router.get('/modules/:moduleId/exercises', authenticateToken, moduleControllers.getExerciseInModule)

router.post('/modules/:moduleId/exercises', authenticateToken, moduleControllers.addExerciseToModule)

module.exports = router
