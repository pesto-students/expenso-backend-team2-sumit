const { User } = require("../../model/user");

function addNewExpense(req, res) {
  const { userId, role, companyId } = req.credentials;

  // Should add documentURL after integrating S3 bucket for image storage.
  const { name, amount } = req.body;

  const userTeamId = User.findById(userId).teamId;

  const reviewers = [];

  if (role === "team-member") {
    const teamLead = User.findOne({ teamId: userTeamId, role: "team-lead" });
    const finance = User.findOne({ companyId, role: "finance" });
  } else if (role === "team-manager") {
    const teamLead = User.findOne({ teamId: userTeamId, role: "team-lead" });
    const finance = User.findOne({ companyId, role: "finance" });
  } else if (role === "team-lead") {
    const finance = User.findOne({ companyId, role: "finance" });
  }
  // think about finance team as well.

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
      res.status(200).json({ ok: true, expense });
    })
    .catch((error) => {
      res.status(400).json({ ok: false, error });
    });
}

function getRequests(req, res) {
  const { userId, role, companyId } = req.credentials;
}

function getExpense(req, res) {
  const { userId, role, companyId } = req.credentials;
  Expense.find({ requestedBy: userId })
    .then((expenses) => {
      res.status(200).json({ ok: true, expenses });
    })
    .catch((error) => {
      res.status(400).json({ ok: false, error });
    });
}

function approveExpense(req, res) {
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
          res.status(200).json({ ok: true, message: "Expense rejected" });
        })
        .catch((error) => {
          res.status(400).json({ ok: false, error });
        });
    });
  } else if (status === "approved") {
    // expenses will be an array of expenseId
    expenses.forEach((expenseId) => {
      const currentExpense = Expense.findById(expenseId);
      const { reviewers, approvedReviewers } = currentExpense;
      if (reviewers.length === approvedReviewers.length + 1) {
        Expense.findByIdAndUpdate(expenseId, {
          status: "approved",
          approvedReviewers: [...approvedReviewers, userId],
        })
          .then(() => {
            res.status(200).json({ ok: true, message: "Expense approved" });
          })
          .catch((error) => {
            res.status(400).json({ ok: false, error });
          });
      } else {
        Expense.findByIdAndUpdate(expenseId, {
          approvedReviewers: [...approvedReviewers, userId],
        })
          .then(() => {
            res.status(200).json({ ok: true, message: "Expense approved" });
          })
          .catch((error) => {
            res.status(400).json({ ok: false, error });
          });
      }
    });
  }
}

module.exports = { getExpense, addNewExpense, approveExpense, getRequests };
