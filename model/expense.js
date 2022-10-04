const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const expenseSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  documentURL: {
    type: String,
    required: true,
  },
  requestedBy: {
    type: Schema.type.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["submitted", "approved", "rejected", "paid"],
  },
  reviewers: [
    {
      type: Schema.type.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  approvedReviewers: [
    {
      type: Schema.type.ObjectId,
      ref: "User",
    },
  ],
  rejectedReviewer: {
    type: Schema.type.ObjectId,
    ref: "User",
    default: null,
  },
  comment: {
    type: String,
  },
});

const Expense = mongoose.model("Expense", expenseSchema);

module.exports = { Expense };
