const express = require('express')
const { verifyToken } = require('../../utils/auth')
const Teams = require('../../model/teams')
const { getTeamsRequest, postTeamsRequest, deleteTeamsRequest, getByIdTeamRequest } = require('./teams.controller')


const TeamsRouter = express.Router()



TeamsRouter.get('/', getTeamsRequest);
TeamsRouter.get('/:id', getByIdTeamRequest);
TeamsRouter.post('/', postTeamsRequest);
TeamsRouter.delete('/:id', deleteTeamsRequest);

module.exports = TeamsRouter
