const { User } = require("../../model/user");
const { Company } = require("../../model/company");
const { Team } = require("../../model/team");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const generator = require("generate-password");

async function getUsers(req, res) {
  const { userId, role, companyId } = req.credentials;
  console.log("companyId: ", companyId);
  console.log("role: ", role);
  console.log("teamIds: ", teamIds);

  let users = null;
  if (role === "admin") {
    users = await User.find({ companyId });
  } else if (role === "team-manager") {
    users = await User.find({
      teamId: { $in: mongoose.Types.ObjectId(teamIds[0]) },
    });
  } else if (role === "teams-lead") {
    const usersArr = [];
    for (let i = 0; i < teamIds.length; i++) {
      const users = await User.find({
        teamId: mongoose.Types.ObjectId(teamIds[i]),
      });
      usersArr.push(users);
    }
    users = usersArr.flat();
  }
  return res.status(200).json(users);
}

async function addNewUser(req, res) {
  const { userId, role: requestedUser, companyId } = req.credentials;
  if (requestedUser !== "admin") {
    return res
      .status(400)
      .json({ message: "You are not authorized to add new user." });
  }

  const { firstName, lastName, role, email, teams } = req.body;

  if (!firstName || !lastName || !role || !email || !teams) {
    return res.status(400).send("All fields are required!");
  }

  /* Check if user already exists, if not add new user */
  let existingUser = null;
  try {
    existingUser = await User.findOne({ email });
  } catch (error) {
    console.log(error);
  }
  if (existingUser !== null) {
    return res
      .status(400)
      .json({ message: `Email: ${email} is already registered.` });
  }

  /* Check if team exists */
  const teamIds = [];
  for (let i = 0; i < teams.length; i++) {
    const team = await Team.findOne({
      _id: teams[i],
    });
    if (!team) {
      return res
        .status(400)
        .json({ message: `Team: ${teams[i]} does not exist.` });
    }
    teamIds.push(team._id);
  }

  /* If user is team-member, check if team has team-manager and teams-lead in reviewers array of objects*/
  if (role === "team-member") {
    for (let i = 0; i < teamIds.length; i++) {
      const team = await Team.findOne({
        _id: mongoose.Types.ObjectId(teamIds[i]),
      });
      console.log("team: ", team);
      const { reviewers } = team;
      if (reviewers.managers.length === 0 && reviewers.leads.length === 0) {
        return res.status(400).json({
          ok: false,
          message: `Team:'${team.name}' does not have team-manager and teams-lead.`,
        });
      } else if (reviewers.managers.length === 0) {
        return res.status(400).json({
          ok: false,
          message: `Team:'${team.name}' does not have team-manager.`,
        });
      } else if (reviewers.leads.length === 0) {
        return res.status(400).json({
          ok: false,
          message: `Team:'${team.name}' does not have teams-lead.`,
        });
      }
    }
  } else if (role === "team-manager") {
    for (let i = 0; i < teamIds.length; i++) {
      const team = await Team.findOne({ _id: teamIds[i] });
      const { reviewers } = team;
      const { leads } = reviewers;
      if (leads.length === 0) {
        return res.status(400).json({
          ok: false,
          message: `Team: ${teams[i]} does not have teams-lead.`,
        });
      }
    }
  }

  const password = generator.generate({
    length: 10,
    numbers: true,
  });

  console.log("password: ", password);
  const hashedPassword = bcrypt.hashSync(password);

  const user = new User({
    firstName,
    lastName,
    role,
    companyId,
    email,
    teams,
    password: hashedPassword,
  });

  // TODO Send mail to user with password. Console.log for now.
  console.log("email: ", email);

  try {
    await user.save();
    console.log(`New user added: ${user}`);
    const createdUser = await User.findOne({ email });
    if (createdUser.role === "team-manager") {
      const team = await Team.findById(createdUser.teams[0]);
      team.reviewers.managers.push(createdUser._id.valueOf());
      await team.save();
      return res.status(201).json({ message: user.email });
    } else if (createdUser.role === "teams-lead") {
      for (let i = 0; i < createdUser.teams.length; i++) {
        console.log("createdUser.teams[i]: ", createdUser.teams[i]);
        const team = await Team.findById(createdUser.teams[i]);
        team.reviewers.leads.push(createdUser._id.valueOf());
        await team.save();
      }
      return res.status(201).json({ message: user.email });
    } else {
      return res.status(201).json({ message: user.email });
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = { getUsers, addNewUser };
