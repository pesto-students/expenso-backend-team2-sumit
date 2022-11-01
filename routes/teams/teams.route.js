const express = require('express')
const { verifyToken } = require('../../middleware/auth.middleware')
const { getTeams, addNewTeam } = require('./teams.controller')

const TeamsRouter = express.Router()



TeamsRouter.get('/', verifyToken, getTeams)
TeamsRouter.post('/new', verifyToken, addNewTeam)

module.exports = TeamsRouter
