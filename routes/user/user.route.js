const express = require('express')
const { signup, login } = require('./user.controller')
const { verifyToken } = require('../../utils/auth')

const UserRouter = express.Router()

UserRouter.post('/signup', signup)
UserRouter.post('/login', login)

module.exports = UserRouter
