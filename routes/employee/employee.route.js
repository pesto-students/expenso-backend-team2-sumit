const express = require("express");
const { getUsers, addNewUser } = require("./employee.controller");
const { verifyToken } = require("../../middleware/auth.middleware");

const EmployeeRouter = express.Router();

EmployeeRouter.get("/", verifyToken, getUsers);
EmployeeRouter.post("/newUser", verifyToken, addNewUser);

module.exports = EmployeeRouter;