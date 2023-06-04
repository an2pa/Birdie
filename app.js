
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const request = require("request");
const mongodb = require("mongodb");
const mongoose = require("mongoose");
const _ = require("lodash");

const multer = require('multer');
const path = require('path');
const upload = multer({ dest: 'uploads/' });

const session=require("express-session")
const passport=require("passport")
const passportLocalMongoose=require("passport-local-mongoose")
const LocalStrategy = require('passport-local').Strategy;

const flash = require('connect-flash');
const { uniq } = require("lodash");
app.use(flash());



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
        await mongoose.connect('mongodb+srv://admin-anes:test123@cluster0.qzhtq9v.mongodb.net/todolistDB');
        console.log("MongoDB connected");
    } catch (err) {
        console.log("Failed", err);
    }
}
connectDB();

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    phoneNo: Number,
    address: String,
    password: String,
    cart: [
        {
            url:String,
            title: String,
            price: Number,
            description: String
        }
    ],
    role:String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());





const menuSchema = new mongoose.Schema({
    url: String,
    type: String,
    title: String,
    price: Number,
    description: String
});

const orderSchema = new mongoose.Schema({

    phoneno: String,
    address: String,
    username: String,
    cart: [
        {
            url:String,
            title: String,
            price: Number,
            description: String
        }
    ],
    message: String

});


const Menu = mongoose.model("Menu", menuSchema);
const Order = mongoose.model("Order", orderSchema);


app.get("/", function (req, res) {
    res.render("birdie", { signText: "Create account" });
})

app.get("/adminRegister", function (req, res) {
  res.render("adminregister", { signText: "Create admin account" });
})

app.get("/login", function (req, res) {
    res.render("login", { signText: "Log in to Birdie" })
})

app.get("/adminLogin", function (req, res) {
  res.render("adminlogin", { signText: "Log in to admin" })
})

app.get("/home", function (req, res) {
    const promise = Menu.find().exec();
    promise.then(function (doc) {
       // console.log(doc)
        const sandwichDocs = doc.filter(item => item.type === 'sandwich');
       // console.log(sandwichDocs);
        const chickenDocs = doc.filter(item => item.type === 'chicken');
       // console.log(chickenDocs);
        const pastaDocs = doc.filter(item => item.type === 'pasta');
       // console.log(pastaDocs);
        const pizzaDocs = doc.filter(item => item.type === 'pizza');
      //  console.log(pizzaDocs);
        const beefDocs = doc.filter(item => item.type === 'beef');
     //   console.log(beefDocs);
        const burgerDocs = doc.filter(item => item.type === 'burger');
     //   console.log(burgerDocs);
        if (req.isAuthenticated()) {
            console.log("authetnic")
            res.render("home", { url: "/logout", buttonText: "logout", sandwich: sandwichDocs, chicken: chickenDocs, pasta: pastaDocs, pizza: pizzaDocs, burger: burgerDocs, beef: beefDocs })
        }
        else {
            console.log("not")
            res.render("home", { url: "/login", buttonText: "login", sandwich: sandwichDocs, chicken: chickenDocs, pasta: pastaDocs, pizza: pizzaDocs, burger: burgerDocs, beef: beefDocs })
        }
    })

})
app.get("/logout", function (req, res) {
    req.logout(function (err) {
        if (err)
            console.log(err)
    });
    res.redirect("/login");
})

app.get("/adminLogout", function (req, res) {
  req.logout(function (err) {
      if (err)
          console.log(err)
  });
  res.redirect("/adminLogin");
})
app.get("/adminView", function (req, res) {
  if(req.isAuthenticated()&&req.user.role==="admin"){
    const promise = Menu.find().exec();
    const promise1 = Order.find({ message: "Pending" }).exec();
//v
      const adminName = req.user.username; 
      const orderCount = '1';

  res.render('adminview', { adminName: adminName, orderCount: orderCount });
//^
    Promise.all([promise, promise1])
        .then(function ([menu, orders]) {
            res.render("adminview", { menu: menu, orders: orders });
        })
        .catch(function (error) {
            console.log(error);
        });
  }
  else{
    res.redirect("/adminLogin");
  }
});


app.get("/adminOrders", function(req,res){
  const promise1 = Order.find({ message: "Pending" }).exec();
  promise1.then(function(doc){
    res.render("adminorders", {orders: doc})
  })
})


app.get("/adminMenu",function(req,res){
  const promise = Menu.find().exec();
    promise.then(function (doc) {
       // console.log(doc)
        const sandwichDocs = doc.filter(item => item.type === 'sandwich');
       // console.log(sandwichDocs);
        const chickenDocs = doc.filter(item => item.type === 'chicken');
       // console.log(chickenDocs);
        const pastaDocs = doc.filter(item => item.type === 'pasta');
       // console.log(pastaDocs);
        const pizzaDocs = doc.filter(item => item.type === 'pizza');
      //  console.log(pizzaDocs);
        const beefDocs = doc.filter(item => item.type === 'beef');
     //   console.log(beefDocs);
        const burgerDocs = doc.filter(item => item.type === 'burger');
     //   console.log(burgerDocs);
        if (req.isAuthenticated()&&req.user.role==="admin") {
            console.log("authetnic")
            res.render("adminmenu", {sandwich: sandwichDocs, chicken: chickenDocs, pasta: pastaDocs, pizza: pizzaDocs, burger: burgerDocs, beef: beefDocs })
        }
        else {
            console.log("not")
           res.redirect("/adminLogin")
        }
      })
})



app.get("/adminCompose", function (req, res) {
  if(req.isAuthenticated()&&req.user.role==="admin"){
    res.render("admin")
  }
  else{
    res.redirect("/adminLogin")
  }

})

app.get("/cart", function (req, res) {
    if (req.isAuthenticated()) {
      
        const cartItems = req.user.cart.filter(item => item !== null);
        console.log(cartItems); 
        res.render("cart", { cart: cartItems });
    } else {
      res.redirect("/login");
    }
  });
  
  


app.get("/orders", function(req,res){
    if (req.isAuthenticated()) {
        const username=req.user.username;
        Order.find({ username: username })
        .then(orders => {
          if (orders) {
            console.log(orders);
            res.render("orders", {orders: orders })
          } else {
            console.log('User not found');
          }
        })
        .catch(err => {
          console.error(err);
          // Handle the error
        });
    }
    else {
        res.redirect("/login")
    }
})


app.post("/addtocart", function (req, res) {
    const quant=req.body.quantity;
    if (req.isAuthenticated()) {
        console.log(req.body.itemName)
      const promise = Menu.findById( req.body.itemName ).exec();
      promise.then(function (menuDoc) {
        if (menuDoc) {
            for(var i=0; i<quant; i++){
          const cartItem = {
            url:menuDoc.url,
            title: menuDoc.title,
            price: menuDoc.price,
            description: menuDoc.description,
          };
          req.user.cart.push(cartItem);
          
        }
        req.user.save();
          // Save the updated user document
          res.redirect("/home");
        } else {
          // Handle case when menu item is not found
          res.redirect("/menu");
        }
      })
      .catch(function (error) {
        // Handle error during menu item retrieval
        console.log(error);
        res.redirect("/menu");
      });
    } else {
      res.redirect("/login");
    }
  });
  
/*app.post("/addtocart", function (req, res) {
    if (req.isAuthenticated()) {
      const promise = Menu.find().exec();
      promise.then(function (doc) {
        const cartDoc = doc.find(item => item.title === req.body.itemName);
        const cart=new Cart({
            title:cartDoc.title,
            price:cartDoc.price,
            description:cartDoc.description
        })
        cart.save();
        res.redirect("/cart")
      });
    } else {
      res.redirect("/login");
    }
  });*/
  


app.post("/deletefromcart", function (req, res) {
    var itemToDelete = req.body.itemName
    console.log(req.body.itemName);
    const cartItem = req.user.cart.find(item => item._id.toString() === itemToDelete);

    console.log(cartItem);
    req.user.cart = req.user.cart.filter(item => item !== cartItem);
    req.user.save();
    res.redirect("/cart");
})
app.post("/deletefrommenu", function (req, res) {
  var itemToDelete = req.body.itemName
  console.log(req.body.itemName);
  const deleteF=Menu.findOneAndDelete({_id: itemToDelete}).exec();
  deleteF.then(function(doc){
   // console.log("Successfully deleted "+doc.title)
})
  
/*
  const cartItem = Menu.findOneAndDelete(item => item._id.toString() === itemToDelete);

  console.log(cartItem);
  req.user.cart = req.user.cart.filter(item => item !== cartItem);
  req.user.save();*/
  res.redirect("/adminMenu");
})




app.post("/adminCompose", upload.single('photo'), function (req, res) {
  const filename = req.file.filename;
  
    const menu = new Menu({
      
        url:"/uploads/"+filename,
        type: req.body.menuType,
        title: req.body.menuTitle,
        price: req.body.menuPrice,
        description: req.body.menuDescription
    })
    menu.save();

    //console.log(menu);
    res.redirect("/adminView");
}
)

app.post("/confirmOrder", function (req, res) {
    if (req.isAuthenticated()) {
        const _username = req.user.username;
        const _address = req.user.address;
        const _phoneno = req.user.phoneNo;
        const _cart = req.user.cart;
        // Use the username and address as needed
        console.log("Username:", _username);
        console.log("Address:", _address);
        console.log("Address:", _phoneno);

        const order = new Order({
            phoneno: _phoneno,
            address: _address,
            username: _username,
            cart: _cart,
            message: "Pending"
        })
        
        order.save();
        console.log(order);
        req.user.cart.splice(0, req.user.cart.length);
        req.user.save();

        res.redirect("/cart")
    }
})

app.post("/rejectOrder", function (req, res) {
    console.log(req.body.itemToReject)

    const orderId = req.body.itemToReject; 

   Order.findById(orderId)
  .then(order => {
    if (order) {
      console.log(order);
      order.message="Rejected";
      order.save();
      console.log(order.message);
      res.redirect("/adminView")
    } else {
      console.log('Order not found');
    }
  })
  .catch(err => {
    console.error(err);
    // Handle the error
  });
})

app.post("/acceptOrder", function (req, res) {
    console.log(req.body.itemToReject)

    const orderId = req.body.itemToAccept; 

   Order.findById(orderId)
  .then(order => {
    if (order) {
      console.log(order);
      order.message="Accepted";
      order.save();
      console.log(order.message);
      res.redirect("/adminView")
    } else {
      console.log('Order not found');
    }
  })
  .catch(err => {
    console.error(err);
    // Handle the error
  });

})


app.post("/delete", function (req, res) {
    var itemToDelete = req.body.checkbox
    // console.log(req.body.checkbox);
    const deleteF = Menu.findOneAndDelete({ _id: itemToDelete }).exec();
    deleteF.then(function (doc) {
        console.log("Successfully deleted ")
    })
    res.redirect("/adminView");
})



app.post("/", function(req,res){
  User.register({username:req.body.inputFirstName, email:req.body.email, phoneNo:req.body.number, address:req.body.address, role:"user"}, req.body.password, function(err,user){
     
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
            console.log(req.isAuthenticated())
            console.log(req.user.role)
             res.redirect("/home");
           }
         });
     }
  });
});

// Registration route
app.post('/adminRegister', (req, res) => {

});



app.post("/adminRegister", function(req,res){
  User.register({username:req.body.inputFirstName, email:req.body.email, phoneNo:req.body.number, address:req.body.address, role:"admin"}, req.body.password, function(err,user){
  //
    const username = req.body.username;

    res.render('adminview', { adminName: username });

    if(err){
      console.log(err);
      res.render("adminregister", {signText: err});
    }
    else{
      req.login(user, function(err){
        if (err) {
          console.log(err);
          res.redirect("/adminLogin");
        } else {
          res.render('adminview', {adminName: username});
        }
      });
    }
  //


      if(err){
         console.log(err);
         res.render("birdie",{signText:err});
         
     }
     else{
         req.login(user, function(err){
           if (err) {
             console.log(err);
             res.redirect("/adminRegister");
           } else {
            console.log(req.isAuthenticated())
            console.log(req.user.role)
             res.redirect("/adminView");
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


app.post("/adminLogin", function(req,res){
  const admin = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(admin, function(err){
    if(err){
      console.log(err);
    } else {
      passport.authenticate('local', { 
        successRedirect: '/adminView',
        failureRedirect: '/adminLogin',
        failureFlash: true
      })(req, res); 
    }
  });
});



app.listen(process.env.PORT || 3000, function () {
    console.log("Server started");
})

