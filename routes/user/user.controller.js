const { User } = require('../../model/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

async function signup(req, res, next) {
  const { name, email, password } = req.body
  let existingUser = null

  try {
    existingUser = await User.findOne({ email })
  } catch (error) {}
  if (existingUser !== null) {
    return res
      .status(400)
      .json({ message: `Email: ${email} is already registered.` })
  }

  const hashedPassword = bcrypt.hashSync(password)
  const user = new User({
    name,
    email,
    password: hashedPassword,
  })
  try {
    await user.save()
  } catch (error) {
    console.log(error)
  }

  return res.status(201).json({ message: user })
}

async function login(req, res) {
  const { email, password } = req.body

  let existingUser = null

  try {
    existingUser = await User.findOne({ email })
  } catch (error) {
    console.log(error)
  }

  if (existingUser === null) {
    res.status(400).json({ message: 'User not found. Please register' })
  }
  if (!bcrypt.compareSync(password, existingUser.password)) {
    res.status(400).json({ message: 'Invalid password' })
  }

  const SECRET_KEY = process.env.JWT_SECRET_KEY
  const token = jwt.sign({ id: existingUser._id }, SECRET_KEY, {
    expiresIn: String(process.env.JWT_TOKEN_EXPIRATION_TIME),
  })

  res.cookie(existingUser._id, token, {
    path: '/',
    expires: new Date(Date.now() + 1000 * 10),
    httpOnly: true,
    sameSite: 'lax',
  })

  return res
    .status(200)
    .json({ message: 'Successfully Logged in', user: existingUser })
}

module.exports = { signup, login }
