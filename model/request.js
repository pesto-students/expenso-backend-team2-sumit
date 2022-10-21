const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const requestSchema = new Schema({
  reviewerId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  expenseId: {
    type: Schema.Types.ObjectId,
    ref: "Expense",
    required: true,
  },
  statusOfApproval: {
    type: String,
    required: true,
    enum: ["submitted", "approved", "rejected", "paid"],
  },
});

const Request = mongoose.model("Request", requestSchema);

module.exports = { Request };

// userId, expenseId, statusOfApproval;
