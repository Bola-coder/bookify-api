const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const Books = require("./models/book.model");
const app = require("./app");
const connectToDB = require("./config/db");

const port = process.env.PORT;
connectToDB();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
