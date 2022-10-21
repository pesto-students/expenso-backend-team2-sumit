const { Team } = require("../../model/team");
const { User } = require("../../model/user");
const { Request } = require("../../model/request");
const { Expense } = require("../../model/expense");

function addNewExpense(req, res) {
  const { userId, role, companyId } = req.credentials;

  // Should add documentURL after integrating S3 bucket for image storage.
  const { name, description, amount, teamId } = req.body;
  const teamReviewers = Team.findById(teamId).reviewers; 
  console.log("teamReviewers: ", teamReviewers);
  let reviewers = null; 

  if (role === "team-member") {
    reviewers = teamReviewers;
    // Finance team should also be added
  } else if (role === "team-manager") {
    reviewers.leads = teamReviewers.leads;
    // Finance team should also be added
  } else if (role === "teams-lead") {
    // Finance team should also be added
  } else if (role === "finance") {
    // No reviewers
  }

  const newExpense = new Expense({
    name,
    documentURL: null,
    requestedBy: userId,
    amount,
    status: "submitted",
    reviewers,
    approvedReviewers: [],
    rejectedReviewer: null,
    comment: null,
  });

  newExpense
    .save()
    .then((expense) => {
      return res.status(200).json({ expense });
    })
    .catch((error) => {
      return res.status(400).json({ error });
    });

  // Get the first reviewer from the reviewers object
  const firstReviewer = null;
  if (reviewers.managers.length > 0) {
    firstReviewer = reviewers.managers[0];
  } else if (reviewers.leads.length > 0) {
    firstReviewer = reviewers.leads[0];
  } else if (reviewers.finance.length > 0) {
    firstReviewer = reviewers.finance[0];
  }
  // Should send email to all reviewers
  // Should add to Request model
  const newRequest = new Request({
    reviewerId: firstReviewer,
    expenseId: newExpense._id.valueOf(),
    statusOfApproval: "submitted",
  });
  newRequest
    .save()
    .then((request) => {
      return res.status(200).json({ request });
    })
    .catch((error) => {
      return res.status(400).json({ error });
    });
}

function getRequests(req, res) {
  const { userId, role, companyId } = req.credentials;
  Request.find({ reviewerId: userId })
    .then((requests) => {
      res.status(200).json({ requests });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
}

function getExpense(req, res) {
  const { userId, role, companyId } = req.credentials;
  Expense.find({ requestedBy: userId })
    .then((expenses) => {
      res.status(200).json({ expenses });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
}

function reviewExpense(req, res) {
  const { userId, role, companyId } = req.credentials;
  const { status, expenses } = req.body;
  if (status === "rejected") {
    // expenses will be an array of object with expenseId and comment
    expenses.forEach((expense) => {
      const { expenseId, comment } = expense;
      Expense.findByIdAndUpdate(expenseId, {
        status: "rejected",
        comment,
        rejectedReviewer: userId,
      })
        .then(() => {
          res.status(200).json({ message: "Expense rejected" });
        })
        .catch((error) => {
          res.status(400).json({ error });
        });
    });
  } else if (status === "approved") {
    // expenses will be an array of expenseId
    expenses.forEach((expenseId) => {
      const currentExpense = Expense.findById(expenseId);
      const { reviewers, approvedReviewers } = currentExpense;
    });
  }
}

module.exports = { getExpense, addNewExpense, reviewExpense, getRequests };
