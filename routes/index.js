module.exports = function (app) {
  app.use('/auth', require('./user/user.route'))
  app.use('/teams', require('./teams/teams.route'))
}
