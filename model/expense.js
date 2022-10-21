const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const expenseSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  documentURL: {
    type: String,
    // required: true, -- change it after integrating S3 bucket
  },
  requestedBy: {
    type: Schema.Types.ObjectId,
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
  reviewers: {
    managers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Team must have at least one manager"],
        default: [],
      },
    ],
    leads: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Team must have at least one lead"],
        default: [],
      },
    ],
    finance: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Team must have at least one finance"],
      default: [],
    },
  },
  approvedReviewers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  rejectedReviewer: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  comment: {
    type: String,
  },
});

const Expense = mongoose.model("Expense", expenseSchema);

module.exports = { Expense };
