const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: [true, "User must have first name"],
  },
  lastName: {
    type: String,
    required: [true, "User must have last name"],
  },
  role: {
    type: String,
    required: [true, "User must have role"],
    enum: ["admin", "team-member", "team-manager", "teams-lead", "finance"],
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: "Company",
    required: [true, "User must be associated with a companyId"],
  },
  teams: [
    {
      type: Schema.Types.ObjectId,
      ref: "Team",
    },
  ],
  email: {
    type: String,
    required: [true, "User must have an email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "User must have a password"],
    minlength: 5,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = { User };
