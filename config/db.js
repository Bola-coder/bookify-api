const mongoose = require("mongoose");

const mongoPassword = process.env.mongoPassword;
const mongoURI = process.env.mongoURI.replace("<db_password>", mongoPassword);

const connectToDB = () => {
  mongoose
    .connect(mongoURI)
    .then((con) => {
      console.log("DB Connected successfully");
    })
    .catch((err) => {
      console.log("Error connecting to DB", err);
    });
};
module.exports = connectToDB;
