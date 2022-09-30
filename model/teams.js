const mongoose = require('mongoose')

const Schema = mongoose.Schema

const teamSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: true,
  },
  description:{
    type: String,
  },
  createdBy: {
    type: Date,
  },
  updatedBy: {
    type: Date,
  }
})

const Teams = mongoose.model('Teams', teamSchema)

module.exports = { Teams }