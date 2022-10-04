const { User } = require("../../model/user");
const { Company } = require("../../model/company");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function getUsers(req, res) {
  const { userId, role, companyId } = req.credentials;
  console.log("companyId: ", companyId);
  console.log("role: ", role);
  console.log("teamIds: ", teamIds);

  let users = null;
  if (role === "admin") {
    users = await User.find({ companyId });
  } else if (role === "team-manager") {
    users = await User.find({ teamId: { $in: teamIds[0] } });
  } else if (role === "teams-lead") {
    const usersArr = [];
    for (let i = 0; i < teamIds.length; i++) {
      const users = await User.find({ teamId: teamIds[i] });
      usersArr.push(users);
    }
    users = usersArr.flat();
  }
  return res.status(200).json(users);
}

async function register(req, res, next) {
  const { firstName, lastName, role, email, password } = req.body;

  if (!firstName || !lastName || !role || !email || !password) {
    return res.status(400).send("All fields are required!");
  }

  if (role === "admin") {
    const { companyName, companyEmail } = req.body;
    let existingCompany = null;
    existingCompany = await Company.findOne({ companyEmail });
    if (existingCompany !== null) {
      return res.status(400).json({
        ok: false,
        message: `Company: ${companyEmail} is already registered.`,
      });
    }
    const newCompany = new Company({
      name: companyName,
      email: companyEmail,
      createdDate: Date.now(),
    });
    await newCompany.save();
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
      .json({ ok: false, message: `Email: ${email} is already registered.` });
  }

  const hashedPassword = bcrypt.hashSync(password);
  const company = await Company.findOne({ companyEmail: email });
  const user = new User({
    firstName,
    lastName,
    role,
    companyId: company._id,
    email,
    password: hashedPassword,
  });

  try {
    await user.save();
    console.log(`New user added: ${user}`);
    return res.status(201).json({ ok: true, message: user.email });
  } catch (error) {
    console.log(error);
  }
}

async function addNewUser() {
  const { userId, role: requestedUser, companyId } = req.credentials;
  if (requestedUser !== "admin") {
    return res
      .status(400)
      .json({ ok: false, message: "You are not authorized to add new user." });
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
      .json({ ok: false, message: `Email: ${email} is already registered.` });
  }

  /* Check if team exists */
  const teamIds = [];
  for (let i = 0; i < teams.length; i++) {
    const team = await Team.findOne({ name: teams[i] });
    if (!team) {
      return res
        .status(400)
        .json({ ok: false, message: `Team: ${teams[i]} does not exist.` });
    }
    teamIds.push(team._id);
  }

  /* If user is team-member, check if team has team-manager and teams-lead in reviewers array of objects*/
  if (role === "team-member") {
    for (let i = 0; i < teamIds.length; i++) {
      const team = await Team.findOne({ _id: teamIds[i] });
      const { reviewers } = team;
      const teamManager = reviewers.find(
        (reviewer) => reviewer.role === "team-manager"
      );
      const teamsLead = reviewers.find(
        (reviewer) => reviewer.role === "teams-lead"
      );
      if (!teamManager && !teamsLead) {
        return res.status(400).json({
          ok: false,
          message: `Team: ${teams[i]} does not have team-manager and teams-lead.`,
        });
      } else if (!teamManager) {
        return res.status(400).json({
          ok: false,
          message: `Team: ${teams[i]} does not have team-manager.`,
        });
      } else if (!teamsLead) {
        return res.status(400).json({
          ok: false,
          message: `Team: ${teams[i]} does not have teams-lead.`,
        });
      }
    }
  } else if (role === "team-manager") {
    for (let i = 0; i < teamIds.length; i++) {
      const team = await Team.findOne({ _id: teamIds[i] });
      const { reviewers } = team;
      const teamsLead = reviewers.find(
        (reviewer) => reviewer.role === "teams-lead"
      );
      if (!teamsLead) {
        return res.status(400).json({
          ok: false,
          message: `Team: ${teams[i]} does not have teams-lead.`,
        });
      }
    }
  }

  const user = new User({
    firstName,
    lastName,
    role,
    companyId,
    email,
    teams,
  });

  try {
    await user.save();
    console.log(`New user added: ${user}`);
    return res.status(201).json({ ok: true, message: user.email });
  } catch (error) {
    console.log(error);
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("All fields are required!");
  }

  let existingUser = null;

  try {
    existingUser = await User.findOne({ email });
  } catch (error) {
    console.log(error);
  }

  if (existingUser === null) {
    return res
      .status(400)
      .json({ ok: false, message: `Email: ${email} is not registered.` });
  }

  const isPasswordValid = bcrypt.compareSync(password, existingUser.password);

  if (!isPasswordValid) {
    return res.status(400).json({ ok: false, message: "Invalid credentials." });
  }

  const SECRET_KEY = process.env.JWT_SECRET_KEY;
  const token = jwt.sign({ id: existingUser._id }, SECRET_KEY, {
    expiresIn: String(process.env.JWT_TOKEN_EXPIRATION_TIME),
  });

  res.cookie("userId", existingUser._id, {
    path: "/",
    expires: new Date(Date.now() + 3600000),
    httpOnly: true,
    sameSite: "lax",
  });

  res.cookie("role", existingUser.role, {
    path: "/",
    expires: new Date(Date.now() + 3600000),
    httpOnly: true,
    sameSite: "lax",
  });

  res.cookie("companyId", existingUser.companyId, {
    path: "/",
    expires: new Date(Date.now() + 3600000),
    httpOnly: true,
    sameSite: "lax",
  });

  res.cookie("token", token, {
    path: "/",
    expires: new Date(Date.now() + 3600000),
    httpOnly: true,
    sameSite: "lax",
  });
  // Should change this later.
  return res.status(200).json({
    email: existingUser.email,
    firstName: existingUser.firstName,
    lastName: existingUser.lastName,
    role: existingUser.role,
    companyId: existingUser.companyId,
  });
}

function logout(req, res) {
  const { cookie } = req.headers;
  console.log("cookie: ", cookie);
  if (!cookie) {
    return res.status(400).json({ ok: false, message: "Cookie not found" });
  }
  const token = cookie?.split("=")[1];

  if (!token) {
    res.status(404).json({ message: "No token found" });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (error, user) => {
    if (error) {
      res.status(404).json({ message: "Invalid token" });
    }
    req.id = user.id;
  });

  res.clearCookie(cookie);

  return res.status(200).json({ ok: true, message: "Logout successfully" });
}

module.exports = { register, login, logout, getUsers, addNewUser };
