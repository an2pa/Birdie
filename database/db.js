const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://admin-anes:test123@cluster0.qzhtq9v.mongodb.net/birdieDB");
    console.log("MongoDB connected");
  } catch (err) {
    console.log("Failed", err);
  }
};

module.exports = { connectDB };