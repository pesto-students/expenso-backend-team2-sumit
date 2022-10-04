const express = require("express");
const {
  getExpense,
  addNewExpense,
  approveExpense,
  getRequests,
} = require("./expense.controller");
const { verifyToken } = require("../../middleware/auth.middleware");

const ExpenseRouter = express.Router();

ExpenseRouter.get("/", verifyToken, getExpense);
ExpenseRouter.get("/request", verifyToken, getRequests);
ExpenseRouter.post("/new", verifyToken, addNewExpense);
ExpenseRouter.post("/approve", verifyToken, approveExpense);

module.exports = ExpenseRouter;
