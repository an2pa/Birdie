const mongoose = require('mongoose');
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

module.exports = mongoose.model('Order', orderSchema);