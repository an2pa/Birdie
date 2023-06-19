const User = require('./database/models/users');
const Menu = require('./database/models/menu');
const Order = require('./database/models/orders');
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const request = require("request");
const _ = require("lodash");
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: 'uploads/' });
const { connectDB } = require("./database/db");
const session=require("express-session")
const passport=require("passport")
const axios = require("axios");


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




connectDB();


passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());










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
  axios.get("http://localhost:5000/menu")
        .then(function (response) {
            const menu = response.data;
            const sandwichDocs = menu.filter(item => item.type === 'sandwich');
            const chickenDocs = menu.filter(item => item.type === 'chicken');
            const pastaDocs = menu.filter(item => item.type === 'pasta');
            const beefDocs = menu.filter(item => item.type === 'beef');
            const burgerDocs = menu.filter(item => item.type === 'burger');
            const pizzaDocs = menu.filter(item => item.type === 'pizza');
            if (req.isAuthenticated()) {
              const cartItems = req.user.cart.filter(item => item !== null);
            console.log(cartItems); 
                console.log("authetnic")
                res.render("home", { url: "/logout", buttonText: "Logout", sandwich: sandwichDocs, chicken: chickenDocs, pasta: pastaDocs, pizza: pizzaDocs, burger: burgerDocs, beef: beefDocs, cart: cartItems })
            }
            else {
                console.log("not")
                res.render("home", { url: "/login", buttonText: "Login", sandwich: sandwichDocs, chicken: chickenDocs, pasta: pastaDocs, pizza: pizzaDocs, burger: burgerDocs, beef: beefDocs, cart: [] })
            }
        })
        .catch(function (error) {
            console.error("Error:", error.message);
        });  
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
  if (req.isAuthenticated() && req.user.role === "admin") {
    
    const adminName = req.user.username;
    const orderCountPromise = Order.countDocuments({ message: "Pending"}).exec().then(
      function(doc){
        res.render("adminview", {
          adminName: adminName,
          orderCount: doc,
        });
      }
    ); 
  } else {
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
  axios.get("http://localhost:5000/menu")
  .then(function (response) {
      const menu = response.data;
      const sandwichDocs = menu.filter(item => item.type === 'sandwich');
      const chickenDocs = menu.filter(item => item.type === 'chicken');
      const pastaDocs = menu.filter(item => item.type === 'pasta');
      const beefDocs = menu.filter(item => item.type === 'beef');
      const burgerDocs = menu.filter(item => item.type === 'burger');
      const pizzaDocs = menu.filter(item => item.type === 'pizza');
      if (req.isAuthenticated()&&req.user.role=="admin") {
        const cartItems = req.user.cart.filter(item => item !== null);
      console.log(cartItems); 
          console.log("authetnic")
          res.render("adminmenu", { url: "/logout", buttonText: "Logout", sandwich: sandwichDocs, chicken: chickenDocs, pasta: pastaDocs, pizza: pizzaDocs, burger: burgerDocs, beef: beefDocs, cart: cartItems })
      }
      else {
          console.log("not")
          res.redirect("/adminLogin")
      }
  })
  .catch(function (error) {
      console.error("Error:", error.message);
  });
})



app.get("/adminCompose", function (req, res) {
  if(req.isAuthenticated()&&req.user.role==="admin"){
    res.render("admin",{adminName: req.user.username})
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


app.post("/addtocart", async function (req, res) {
  const quant = req.body.quantity;

  if (req.isAuthenticated()) {
    try {
      const menuDoc = await Menu.findById(req.body.itemName).exec();
      
      if (menuDoc) {
        for (var i = 0; i < quant; i++) {
          const cartItem = {
            url: menuDoc.url,
            title: menuDoc.title,
            price: menuDoc.price,
            description: menuDoc.description,
          };
          req.user.cart.push(cartItem);
        }
        
        await req.user.save(); // Wait for the user document to be saved
        
        res.redirect("/home");
      } else {
        // Handle case when menu item is not found
        res.redirect("/menu");
      }
    } catch (error) {
      // Handle error during menu item retrieval or saving user document
      console.log(error);
      res.redirect("/menu");
    }
  } else {
    res.redirect("/login");
  }
});

  

  

  app.post("/deletefromcart", function (req, res) {
    var itemToDelete = req.body.itemName
    console.log(req.body.itemName);
    const cartItem = req.user.cart.find(item => item._id.toString() === itemToDelete);

    console.log(cartItem);
    req.user.cart = req.user.cart.filter(item => item !== cartItem);
    req.user.save();
    res.redirect("/home");
})
  
app.post("/deletefrommenu", function (req, res) {
  var itemToDelete = req.body.itemName
  console.log(req.body.itemName);
  const deleteF=Menu.findOneAndDelete({_id: itemToDelete}).exec();
  deleteF.then(function(doc){
  
})
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

        res.redirect("/home")
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
      res.redirect("/adminOrders")
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
      res.redirect("/adminOrders")
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
         res.render("birdie",{signText:"Something went wrong!"});
         
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




app.post("/adminRegister", function(req,res){
  User.register({username:req.body.inputFirstName, email:req.body.email, phoneNo:req.body.number, address:req.body.address, role:"admin"}, req.body.password, function(err,user){
     
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

