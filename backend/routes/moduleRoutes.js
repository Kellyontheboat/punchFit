const express = require('express')
const router = express.Router()
const moduleControllers = require('../controllers/moduleControllers')

router.post('/modules', moduleControllers.createModule
)

// remember to add authenticate middleware
router.get('/members/:memberId/modules', moduleControllers.getModules)

router.get('/parts/:partId/modules', moduleControllers.getModuleByPart)

router.get('/sections/:sectionId/modules', moduleControllers.getModuleBySection)

// remember to add authenticate middleware
router.get('/modules/:moduleId/exercises', moduleControllers.getExerciseInModule)

router.post('/modules/:moduleId/exercises', moduleControllers.addExerciseToModule)

module.exports = router
