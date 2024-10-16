const express = require('express')
const { body, validationResult, param } = require('express-validator');
const router = express.Router()
const moduleControllers = require('../controllers/moduleControllers')
const { authenticateToken } = require('../middleware/auth')

router.post('/modules', authenticateToken, [
  body('section_id')
    .isInt({ min: 1, max: 7 })
    .withMessage('Section ID must be an integer between 1 and 7'),
],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    moduleControllers.createModule(req, res);
  }
)

router.get('/sections/modules', authenticateToken, moduleControllers.getModulesBySections)

router.get('/sections/:sectionId/modules', authenticateToken, moduleControllers.getModuleBySection)

router.get('/modules/:moduleId/exercises', authenticateToken, moduleControllers.getExerciseInModule)

router.patch('/modules/:moduleId/exercises', authenticateToken, [
  param('moduleId').isInt().withMessage('Module ID must be an integer'),
  body('updatedItems').isArray().withMessage('Updated items must be an array'),
  body('existingItemIds').isArray().withMessage('Existing item IDs must be an array'),
],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    moduleControllers.updateExerciseInModule(req, res);
  })

module.exports = router
