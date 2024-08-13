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

    const { username, email, password } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)

    try {
      await Members.createMember(username, email, hashedPassword)
      res.status(201).send('User registered successfully')
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body

    try {
      const member = await Members.findOne({ where: { email } })
      console.log(member)

      if (!member || !await bcrypt.compare(password, member.password)) {
        return res.status(401).json({ message: 'Invalid credentials' })
      }
      console.log(member.email)
      const token = jwt.sign({ id: member.id, username: member.username, email: member.email }, SECRET_KEY, { expiresIn: '1h' })
      console.log('aaaaaaaaaaa', token)
      return res.json({ token })
    } catch (error) {
      console.error('Error during login process:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  authenticate: (req, res) => {
    res.json({ data: req.user })
  }
  // authenticate: (req, res, next) => {
  //   const token = req.header('Authorization')?.replace('Bearer ', '')
  //   if (!token) {
  //     return res.status(401).json({ message: 'No token provided' })
  //   }

  //   try {
  //     const decoded = jwt.verify(token, SECRET_KEY)
  //     req.user = decoded
  //     console.log('req.user authenticate', req.user)
  //     res.json({ data: req.user })
  //   } catch (error) {
  //     res.status(401).json({ message: 'Invalid token' })
  //   }
  // }
}

module.exports = authControllers
