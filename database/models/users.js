const mongoose = require('mongoose');
const session=require("express-session")
const passport=require("passport")
const passportLocalMongoose=require("passport-local-mongoose")

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  phoneNo: Number,
  address: String,
  password: String,
  cart: [
    {
      url: String,
      title: String,
      price: Number,
      description: String
    }
  ],
  role: String
});
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
