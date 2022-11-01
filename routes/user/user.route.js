const express = require("express");
const {
  register,
  login,
  getUsers,
  addNewUser,
  logout,
} = require("./user.controller");
const { verifyToken } = require("../../middleware/auth.middleware");

const UserRouter = express.Router();

UserRouter.post("/register", register);
UserRouter.post("/login", login);
UserRouter.post("/logout", verifyToken, logout);

module.exports = UserRouter;
