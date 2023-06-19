const { connectDB } = require("../database/db");
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const app = express();
const Menu=require('../database/models/menu')
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
connectDB();
app.route("/menu")
    .get(function (req, res) {
        const promise = Menu.find().exec();
        promise.then(function (err, doc) {
            if (!err) {
                res.send(doc);
            }
            else {
                res.send(err);
            }
        })
    })

app.listen(5000,()=>{
    console.log("Server started on 5000")
})












