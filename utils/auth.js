const jwt = require('jsonwebtoken')

function verifyToken(req, res, next) {
  const { cookie } = req.headers
  const token = cookie.split('=')[1]

  // const { authorization } = req.headers
  // const token = authorization.split(' ')[1]

  if (!token) {
    res.status(404).json({ message: 'No token found' })
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (error, user) => {
    if (error) {
      res.status(404).json({ message: 'Invalid token' })
    }
    req.id = user.id
  })

  next()
}

module.exports = { verifyToken }
