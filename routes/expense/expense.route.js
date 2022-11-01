const express = require("express");
const {
  getExpense,
  addNewExpense,
  reviewExpense,
  getRequests,
} = require("./expense.controller");
const { verifyToken } = require("../../middleware/auth.middleware");

const ExpenseRouter = express.Router();

ExpenseRouter.get("/", verifyToken, getExpense);
ExpenseRouter.get("/requests", verifyToken, getRequests);
ExpenseRouter.post("/new", verifyToken, addNewExpense);
ExpenseRouter.post("/approve", verifyToken, reviewExpense);

module.exports = ExpenseRouter;
