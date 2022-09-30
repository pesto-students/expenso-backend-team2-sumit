const express = require('express')
const mongoose = require('mongoose')
const router = require('./routes/index')
const cookieParcer = require('cookie-parser')
var bodyParser = require('body-parser')
require('dotenv').config()


const app = express()
app.use(cookieParcer())
app.use(express.json())
router(app)


app.use(bodyParser.json());                                           // body parser added here
app.use(bodyParser.urlencoded({ extended: true }));

const TeamsRouter = require('./routes/teams/teams.route')             // team routes added here
app.use('/teams', TeamsRouter)

const PASSWORD = process.env.MONGODB_PASSWORD
mongoose
  .connect(
    `mongodb+srv://admin:${PASSWORD}@cluster0.7skjyt3.mongodb.net/expenso?retryWrites=true&w=majority`
  )
  .then(() => {
    const PORT = process.env.PORT || 5000
    app.listen(PORT, () =>
      console.log(`Database connected!. Listening on port ${PORT}`)
    )
  })
  .catch(error => console.log(error))
