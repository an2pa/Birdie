const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const request = require("request");
const mongodb = require("mongodb");
const mongoose = require("mongoose");
const _ = require("lodash");

const session=require("express-session")
const passport=require("passport")
const passportLocalMongoose=require("passport-local-mongoose")

const flash = require('connect-flash');
app.use(flash());



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.use(session({
    secret:"Our little secret",
    resave:false,
    saveUninitialized: false

}))

app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
    res.locals.messages = req.flash();
    next();
  });
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/birdieDB');
        console.log("MongoDB connected");
    } catch (err) {
        console.log("Failed", err);
    }
}
connectDB();

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    phoneNo:Number,
    address: String,
    password:String,
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
    res.render("birdie",{signText:"Create account"});
})
app.get("/login", function (req, res) {
    res.render("login",{signText:"Log in to Birdie"})
})
app.get("/home", function (req, res) {
    if(req.isAuthenticated()){
        console.log("authetnic")
        res.render("home",{url:"/logout", buttonText:"logout"})
    }
    else{
        console.log("not")
        res.render("home",{url:"/login", buttonText:"login"})
    }
  
})
app.get("/logout", function(req,res){
    req.logout(function(err){
        if(err)
        console.log(err)
    });
    res.redirect("/login");
})
/*
app.post("/login", function (req, res) {
    var email = req.body.inputEmail;
    var password = req.body.inputPassword;
    const promise = User.findOne({email:email}).exec();
    promise.then(function (doc) {
        if(!doc){
            res.render("login",{signText:"User does not exist!"})
        }
        else if(doc.password==password){
            res.redirect("/home")
            
        }
        else{
            res.render("login",{signText:"Wrong password!"})
        }
    })

})

*/

app.post("/", function(req,res){
    User.register({username:req.body.inputFirstName, email:req.body.email, phoneNo:req.body.number, address:req.body.address}, req.body.password, function(err,user){
       
        if(err){
           console.log(err);
           res.render("birdie",{signText:err});
           
       }
       else{
           req.login(user, function(err){
             if (err) {
               console.log(err);
               res.redirect("/login");
             } else {
               res.redirect("/home");
             }
           });
       }
    });
});


app.post("/login", function(req,res){
    const user = new User({
      username: req.body.username,
      password: req.body.password
    });
  
    req.login(user, function(err){
      if(err){
        console.log(err);
      } else {
        passport.authenticate('local', { 
          successRedirect: '/home',
          failureRedirect: '/login',
          failureFlash: true
        })(req, res); 
      }
    });
  });
  

app.listen(process.env.PORT || 3000, function () {
    console.log("Server started");
})

