const { User } = require("../../model/user");
const { Company } = require("../../model/company");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function register(req, res, next) {
  const { firstName, lastName, role, email, password } = req.body;

  if (!firstName || !lastName || !role || !email || !password) {
    return res.status(400).send("All fields are required!");
  }

  const { companyName, companyEmail } = req.body;
  let existingCompany = null;
  existingCompany = await Company.findOne({ email: companyEmail });
  console.log("existingCompany", existingCompany);
  if (existingCompany !== null) {
    return res.status(400).json({
      message: `Company: ${companyEmail} is already registered.`,
    });
  }
  const newCompany = new Company({
    name: companyName,
    email: companyEmail,
    createdDate: Date.now(),
  });
  await newCompany.save();

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

  const hashedPassword = bcrypt.hashSync(password);
  const company = await Company.findOne({ companyEmail: email });
  const companyId = company._id.valueOf();
  const user = new User({
    firstName,
    lastName,
    role,
    companyId,
    email,
    password: hashedPassword,
  });

  try {
    await user.save();
    console.log(`New user added: ${user}`);
    return res.status(200).json({ email: user.email, companyEmail });
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
      .json({ message: `Email: ${email} is not registered.` });
  }

  const isPasswordValid = bcrypt.compareSync(password, existingUser.password);

  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid credentials." });
  }

  const SECRET_KEY = process.env.JWT_SECRET_KEY;
  const token = jwt.sign({ id: existingUser._id }, SECRET_KEY, {
    expiresIn: String(process.env.JWT_TOKEN_EXPIRATION_TIME),
  });

  res.cookie("userId", existingUser._id.valueOf(), {
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

  res.cookie("companyId", existingUser.companyId.valueOf(), {
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
  const { userId, token } = req.credentials;

  jwt.verify(token, process.env.JWT_SECRET_KEY, (error, user) => {
    if (error) {
      return res.status(404).json({ message: "Invalid token" });
    }
  });

  res.clearCookie(cookie);

  return res.status(200).json({ message: "Logout successfully" });
}

module.exports = { register, login, logout };
