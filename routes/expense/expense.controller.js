const { Team } = require("../../model/team");
const { User } = require("../../model/user");
const { Request } = require("../../model/request");
const { Expense } = require("../../model/expense");

async function addNewExpense(req, res) {
  const { userId, role, companyId } = req.credentials;

  // Should add documentURL after integrating S3 bucket for image storage.
  const { name, description, amount, teamId } = req.body;
  const team = await Team.findById(teamId);
  const teamReviewers = team.reviewers;
  console.log("teamReviewers: ", teamReviewers);
  let reviewers = [];
  const { managers, leads } = teamReviewers;

  if (role === "team-member") {
    managers.forEach((reviewer) => {
      reviewers.push(reviewer._id);
    });
    leads.forEach((reviewer) => {
      reviewers.push(reviewer._id);
    });

    // Finance team should also be added
  } else if (role === "team-manager") {
    leads.forEach((reviewer) => {
      reviewers.push(reviewer._id);
    });
    // Finance team should also be added
  } else if (role === "teams-lead") {
    // Finance team should also be added
  } else if (role === "finance") {
    // No reviewers
  }

  console.log("reviewersList: ", reviewers);

  const newExpense = new Expense({
    name,
    description,
    documentURL: null,
    requestedBy: userId,
    amount,
    status: "submitted",
    reviewers,
    approvedReviewers: [],
    rejectedReviewer: null,
    comment: null,
  });

  newExpense.save().catch((error) => {
    return res.status(400).json({ error });
  });

  // Get the first reviewer from the reviewers object
  let firstReviewer = null;
  if (reviewers.length > 0) {
    firstReviewer = reviewers[0];
  } else if (reviewers.length > 0) {
    firstReviewer = reviewers[0];
  } else if (reviewers.length > 0) {
    firstReviewer = reviewers[0];
  }

  // TODO: Should send email to first reviewer. Information about the expense should be sent in the email.
  // Info: name, description, amount, teamName, requestedBy, requestedOn
  const newRequest = new Request({
    reviewerId: firstReviewer,
    expenseId: newExpense._id.valueOf(),
    statusOfApproval: "submitted",
  });

  console.log("New Request: ", newRequest);

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

async function reviewExpense(req, res) {
  const { userId, role, companyId } = req.credentials;
  const { status, expense } = req.body;
  if (status === "rejected") {
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
    // TODO: Send email to the employee who requested the expense
    // Info, Inform that the expense has been rejected
  } else if (status === "approved") {
    const expenseId = expense;
    const currentExpense = await Expense.findById(expenseId);
    const { reviewers, approvedReviewers } = currentExpense;
    // Check if userId is already in the approvedReviewers array
    const isReviewer = reviewers.includes(userId);
    const isApproved = approvedReviewers.includes(userId);
    if (isReviewer && !isApproved) {
      const updatedApprovedReviewers = [...approvedReviewers, userId];
      Expense.findByIdAndUpdate(expenseId, {
        approvedReviewers: updatedApprovedReviewers,
      })
        .then(() => {
          console.log("Expense updated");
        })
        .catch((error) => {
          console.log("Error updating expense: ", error);
        });
      Request.findOneAndUpdate(
        { reviewerId: userId, expenseId },
        { statusOfApproval: "approved" }
      )
        .then(() => {
          console.log("Request updated");
        })
        .catch((error) => {
          console.log("Error updating request: ", error);
        });
    } else {
      return res
        .status(400)
        .json({ message: "User has already reviewed the expense" });
    }

    console.log("reviewers: ", reviewers);

    console.log("approvedReviewers.length: ", approvedReviewers.length + 1);
    const nextReviewer = reviewers[approvedReviewers.length + 1];
    console.log("nextReviewer: ", nextReviewer);
    if (nextReviewer !== undefined) {
      const newRequest = new Request({
        reviewerId: nextReviewer,
        expenseId,
        statusOfApproval: "submitted",
      });
      newRequest.save();
      Employee.findById(nextReviewer).then((employee) => {
        const { email } = employee;
        console.log("email: ", email);
        // TODO: Send email to nextReviewer
        // Info: name, description, amount, teamName, requestedBy, requestedOn
      });
    } else {
      console.log("Approve the expense");
      Expense.findByIdAndUpdate(expenseId, {
        status: "approved",
      })
        .then(() => {
          console.log("Expense updated");
        })
        .catch((error) => {
          console.log("Error updating expense: ", error);
        });
      // TODO: Send email to the employee who requested the expense
      // Info, Inform that the expense has been approved
    }

    res.status(200).json({ message: "Expense approved" });
  }
}

module.exports = { getExpense, addNewExpense, reviewExpense, getRequests };
