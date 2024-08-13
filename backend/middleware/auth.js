const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

function authenticateToken (req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]
  // Authorization: `Bearer ${token}`
  if (token == null) return res.sendStatus(401) // If there's no token, return Unauthorized

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403)

    req.user = user // Store the user info in the request object
    next() // authenticate pass call the next middleware or route handler
  })
}

module.exports = authenticateToken
