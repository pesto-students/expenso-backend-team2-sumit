const express = require('express')
const { verifyToken } = require('../../middleware/auth.middleware')
const { getTeams } = require('./teams.controller')

const TeamsRouter = express.Router()

TeamsRouter.get('/', verifyToken, getTeams)

module.exports = TeamsRouter
