const express = require("express");
const { register, login, getUsers, addNewUser } = require("./user.controller");
const { verifyToken } = require("../../middleware/auth.middleware");

const UserRouter = express.Router();

UserRouter.post("/register", register);
UserRouter.post("/login", login);
UserRouter.get("/", verifyToken, getUsers);
UserRouter.get("/newUser", verifyToken, addNewUser);

module.exports = UserRouter;
