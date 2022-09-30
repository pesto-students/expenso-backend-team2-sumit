const { default: mongoose } = require("mongoose")
const { Teams } = require("../../model/teams")


async function getTeamsRequest(req, res) {
  try{
    // console.log("this is team get request")
    const teams = await Teams.find()
    res.json(teams)
  }catch(err){
    res.send('Error' + err)
  }
}

async function getByIdTeamRequest(req, res){
  try{
    const team = await Teams.findById(req.param.id)
    if(team){
      res.json(team)
    }
   
  }catch(err){
    res.send('Error' + err)
  }
}


async function postTeamsRequest(req, res){
  const team = new Teams({
    _id: new mongoose.Types.ObjectId,
    name: req.body.name,
    description: req.body.description,
    createdBy: req.body.createdBy,
    updatedBy: req.body.updatedBy,
  })

  try{
    const result = await Teams.save()
    res.json(result._id)
  }catch(err){
    res.send('Error' + err)
  }
}

async function deleteTeamsRequest(req, res){
  try{
    const team = await Teams.findById(req.param.id)
    const result = await team.remove()
    res.json(result)
  }catch(err){
    res.send('Error' + err)
  }
}


module.exports = { getTeamsRequest, postTeamsRequest, deleteTeamsRequest, getByIdTeamRequest }
