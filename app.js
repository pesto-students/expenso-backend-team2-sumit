const express = require("express");
const mongoose = require("mongoose");
const router = require("./routes/index");
const cookieParcer = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
// Edit this cors, should only allow white listed urls later.
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParcer());
app.use(express.json());
router(app);

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
const PASSWORD = process.env.MONGODB_PASSWORD;
mongoose
  .connect(DB)
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`Database connected!. Listening on port ${PORT}`)
    );
  })
  .catch((error) => console.log(error));
