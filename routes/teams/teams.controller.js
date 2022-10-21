const { Team } = require("../../model/team");
const { User } = require("../../model/user");
const mongoose = require("mongoose");

async function getTeams(req, res) {
  const { userId, role, companyId } = req.credentials;

  console.log("in getTeams");
  const { teams } = await User.findById(userId).select("teams");
  console.log("teamIds: ", teams);

  if (role === "admin") {
    Team.find({ companyId })
      .then((teams) => {
        res.status(200).json({ teams });
      })
      .catch((error) => {
        res.status(400).json({ error });
      });
  } else if (role === "team-manager") {
    Team.find({ companyId, _id: { $in: teams[0] } })
      .then((teams) => {
        res.status(200).json({ teams });
      })
      .catch((error) => {
        res.status(400).json({ error });
      });
  } else if (role === "teams-lead") {
    const teamsArr = [];
    for (let i = 0; i < teamIds.length; i++) {
      const teams = await Team.find({ companyId, _id: teamIds[i] });
      teamsArr.push(teams);
    }
    const teams = teamsArr.flat();
    res.status(200).json({ teams });
  } else {
    res.status(400).json({ message: "You are not authorized to view teams." });
  }
}

function addNewTeam(req, res) {
  const { userId, role, companyId } = req.credentials;
  const { name, description } = req.body;
  if (!name || !description) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const newTeam = new Team({
    name,
    description,
    companyId,
    created_by: userId,
  });
  newTeam
    .save()
    .then((team) => {
      res.status(200).json({ team });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
}
module.exports = { getTeams, addNewTeam };
