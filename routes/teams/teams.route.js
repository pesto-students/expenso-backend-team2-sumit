const express = require('express')
const { verifyToken } = require('../../utils/auth')
const { getTeams } = require('./teams.controller')

const TeamsRouter = express.Router()

TeamsRouter.get('/', verifyToken, getTeams)

module.exports = TeamsRouter
