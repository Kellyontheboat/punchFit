const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../models')
const { validationResult } = require('express-validator')
const { Members } = db

const dotenv = require('dotenv')
dotenv.config()
const SECRET_KEY = process.env.SECRET_KEY

const authControllers = {
  register: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password } = req.body

    try {
      // Check if the email is already registered
      const existingMember = await Members.findOne({ where: { email } })
      if (existingMember) {
        return res.status(400).json({ message: 'Email has been registered!' })
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10)
      // Create the new member
      await Members.create({
        username: name,
        email,
        password: hashedPassword
      })
      res.status(201).send('User registered successfully')
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body

    try {
      const member = await Members.findOne({ where: { email } })

      if (!member || !await bcrypt.compare(password, member.password)) {
        return res.status(401).json({ message: 'Invalid email or password' })
      }
      const token = jwt.sign({ id: member.id, username: member.username, email: member.email }, SECRET_KEY, { expiresIn: '1h' })
      return res.json({ token })
    } catch (error) {
      console.error('Error during login process:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  authenticate: (req, res) => {
    res.json({ data: req.user })
  },
  getRole: async (req, res) => {
    try {
      const memberId = req.memberId
      const member = await Members.findByPk(memberId)

      if (!member) {
        return res.status(404).json({ error: 'Member not found' })
      }

      res.json({ isCoach: member.is_coach })
    } catch (error) {
      console.error('Error fetching user role:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

module.exports = authControllers
