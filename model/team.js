const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const teamSchema = new Schema({
  name: {
    type: String,
    required: [true, "Team must have a name"],
  },
  description: {
    type: String,
    required: [true, "Team must have a description"],
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: "Company",
    required: [true, "Team must be associated with a companyId"],
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
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Team must be associated with a creator"],
  },
  spent: {
    type: Number,
    default: 0,
  },
  // spendLimit: {
  //   type: Number,
  //   required: [true, "Team must have a spend limit"],
  // },
  // spendLimitPeriod: {
  //   type: String,
  //   enum: ["daily", "weekly", "monthly", "yearly"],
  //   required: [true, "Team must have a spend limit period"],
  // },
});

const Team = mongoose.model("Team", teamSchema);

module.exports = { Team };
