const mongoose = require("mongoose");

const DB_URL =
  "mongodb+srv://" +
  process.env.DB_USERNAME +
  ":" +
  process.env.DB_PASSWORD +
  "@cluster0.zyrkerp.mongodb.net/" +
  process.env.DB_NAME +
  "?retryWrites=true&w=majority";

module.exports = () => {
  try {
    mongoose.connect(DB_URL);
    console.log("DB connected successfully");
  } catch (error) {
    console.error(error);
  }
};
