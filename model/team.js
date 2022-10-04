const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const teamSchema = new Schema({
  name: {
    type: String,
    required: [true, "Team must have a name"],
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: "Company",
    required: [true, "Team must be associated with a companyId"],
  },
  reviewers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  created_by: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Team must be associated with a creator"],
  },
});

const Team = mongoose.model("Team", teamSchema);

module.exports = { Team };
