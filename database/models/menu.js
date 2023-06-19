const mongoose = require('mongoose');
const menuSchema = new mongoose.Schema({
    url: String,
    type: String,
    title: String,
    price: Number,
    description: String
});

module.exports = mongoose.model('Menu', menuSchema);