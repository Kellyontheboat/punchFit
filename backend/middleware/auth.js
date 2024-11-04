const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()
const db = require('../models')
const { Members } = db

function authenticateToken (req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]
  // Authorization: `Bearer ${token}`
  if (token == null) return res.sendStatus(401) // If there's no token, return Unauthorized

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403)

    req.user = user // Store the user info in the request object
    req.memberId = user.id // Attach the memberId to the request
    next() // authenticate pass call the next middleware or route handler
  })
}

async function authorizeCoach (req, res, next) {
  try {
    const memberId = req.memberId
    const member = await Members.findByPk(memberId)

    if (member && member.is_coach) {
      next() // Proceed if the user is a coach
    } else {
      res.sendStatus(403) // Forbidden if the user is not a coach
    }
  } catch (error) {
    console.error('Authorization error:', error)
    res.sendStatus(500)
  }
}

module.exports = { authenticateToken, authorizeCoach }
