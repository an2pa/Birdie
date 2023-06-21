const { connectDB } = require("../database/db");
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const app = express();
const Menu = require('../database/models/menu')
const Order = require('../database/models/orders')
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
connectDB();
app.route("/:model")
    .get(function (req, res) {
        if(req.params.model=="menu"){
                const promise = Menu.find().exec();
                 promise.then(function (err, doc) {
                    if (!err) {
                         res.send(doc);
                        }
                    else {
                        res.send(err);
                    }
                })
            }
           else if(req.params.model=="orders"){
                const promise = Order.find().exec();
                 promise.then(function (err, doc) {
                    if (!err) {
                         res.send(doc);
                        }
                    else {
                        res.send(err);
                    }
                })
            }
    
    })
    .post(function (req, res) {
        if(req.params.model=="menu"){
        const menu = new Menu({
      
            url:req.body.url,
            type: req.body.type,
            title: req.body.title,
            price: req.body.price,
            description: req.body.description
        })
        menu.save();
        }
        else if(req.params.model=="orders"){
            const order = new Order({
                phoneno: req.body.phoneno,
                address: req.body.address,
                username: req.body.username,
                cart: req.body.cart,
                message: req.body.message
              })
            order.save();
            }
       
    })
app.route("/:model/:modelId")
    .get(function (req, res) {
        if(req.params.model=="menu"){
        console.log(req.params.modelId)
        const foundArticle = Menu.findById({ _id: req.params.modelId }).exec();
        foundArticle.then(function (doc) {
            if (doc) {
                res.send(doc);
            }
            else {
                res.send("No such document!")
            }
        })
    }
    else if(req.params.model=="orders"){
        console.log(req.params.modelId)
        const foundArticle = Order.find({ username: req.params.modelId }).exec();
        foundArticle.then(function (doc) {
            if (doc) {
                res.send(doc);
            }
            else {
                res.send("No such document!")
            }
        })
    }

    })
    .delete(function (req, res) {
        if(req.params.model=="menu"){
        console.log(req.params.modelId)
        const deleteF = Menu.findOneAndDelete({ _id: req.params.modelId }).exec();
        deleteF.then(function (doc) {
            console.log("Successfully deleted " + doc.title)
        })
    }
        else if(req.params.model=="orders"){
        console.log(req.params.modelId)
        const deleteF = Order.findOneAndDelete({ _id: req.params.modelId }).exec();
        deleteF.then(function (doc) {
            console.log("Successfully deleted " + doc.title)
        })
    }
    })
    .patch(function(req,res){
        if(req.params.model=="orders"){
        const update=Order.findOneAndUpdate({_id: req.params.modelId},{$set:req.body});
        update.then(function(doc){
            if(!doc){
                res.send("Failed to update!")
            }
            else{
                res.send("successfully updated!")
            }
        })
    }
    })

app.listen(5000, () => {
    console.log("Server started on 5000")
})












