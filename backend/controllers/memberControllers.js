const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../models')
const { validationResult } = require('express-validator')
const { redisClient } = require('../services/redisService')
const { Members } = db

const dotenv = require('dotenv')
dotenv.config()
const SECRET_KEY = process.env.SECRET_KEY

const authControllers = {
  register: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: `${errors.array()}. Invalid input` })
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
      res.status(500).json({ message: `${error.message}. Internal server error` })
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body

    try {
      const member = await Members.findOne({ where: { email } })

      if (!member || !await bcrypt.compare(password, member.password)) {
        return res.status(401).json({ message: 'Invalid email or password' })
      }
      // if login email is one of the test account
      // Check if the email is a test account
      const testAccounts = await redisClient.hGetAll('testAccount')
      const isTestAccount = Object.values(testAccounts).some(account => {
        const parsedAccount = JSON.parse(account)
        return parsedAccount.testEmail === email
      })

      if (isTestAccount) {
        const onlineKeys = await redisClient.keys('testAccountOnline:*')
        const onlineEmails = onlineKeys.map(key => key.split(':')[1])

        if (onlineEmails.includes(email)) {
          return res.status(400).json({ message: 'This account is already online' })
        }
        // Set the account as online with a TTL of 1 hour
        await redisClient.setEx(`testAccountOnline:${email}`, 3600, 'online')
      }

      const token = jwt.sign({ id: member.id, username: member.username, email: member.email, isCoach: member.is_coach }, SECRET_KEY, { expiresIn: '1h' })
      return res.json({ token, isCoach: member.is_coach })
    } catch (error) {
      res.status(500).json({ message: `${error.message}. Internal server error` })
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
      res.status(500).json({ error: `${error.message}. Internal server error` })
    }
  },
  getTestAccount: async (req, res) => {
    try {
      const testAccounts = await redisClient.hGetAll('testAccount')
      const onlineKeys = await redisClient.keys('testAccountOnline:*')

      const onlineEmails = onlineKeys.map(key => key.split(':')[1])
      // Convert the retrieved data into an array of objects
      const accountsArray = Object.entries(testAccounts)
        .map(([key, value]) => {
          const account = JSON.parse(value)
          return { user: key, ...account }
        })
        .filter(account => !onlineEmails.includes(account.testEmail))

      res.status(200).json(accountsArray)
    } catch (error) {
      res.status(500).json({ error: `${error.message}. Failed to get test account` })
    }
  },
  removeTestAccount: async (req, res) => {
    const { user } = req.body
    try {
      await redisClient.del(`testAccountOnline:${user.email}`)
      res.status(200).json({ message: 'Test account removed successfully' })
    } catch (error) {
      res.status(500).json({ error: `${error.message}. Failed to remove test account` })
    }
  }
}

module.exports = authControllers
