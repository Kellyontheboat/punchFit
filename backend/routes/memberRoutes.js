const express = require('express')
const { body, validationResult } = require('express-validator');
const router = express.Router()
const memberControllers = require('../controllers/memberControllers')
const { authenticateToken } = require('../middleware/auth')

// ! /api
// Define the route to handle query parameters
router.get('/user/auth', authenticateToken, memberControllers.authenticate)

router.put('/user/auth', [
  body('email').isEmail().withMessage('Invalid email or password'),
  body('password').isLength({ min: 6, max: 20 }).withMessage('Invalid email or password'),
],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    memberControllers.login(req, res);
  })

router.post('/user', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Email must be valid'),
  body('password').isLength({ min: 6, max: 20 }).withMessage('Password must be at least 6 characters long and less than 20 characters'),
],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    memberControllers.register(req, res);
  })

router.get('/user-role', authenticateToken, memberControllers.getRole)

router.get('/testAccount', memberControllers.getTestAccount)

router.put('/testAccount', authenticateToken, [
  body('user').notEmpty().withMessage('User information is required'),
],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    memberControllers.removeTestAccount(req, res);
  })
module.exports = router
