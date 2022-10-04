module.exports = function (app) {
  app.use("/api/auth", require("./user/user.route"));
  app.use("/api/teams", require("./teams/teams.route"));
  app.use("/api/expense", require("./expense/expense.route"));
};
