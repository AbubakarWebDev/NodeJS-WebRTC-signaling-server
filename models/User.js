const mongoose = require('mongoose');
const isEmpty = require('lodash/isEmpty');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
    },
    firstName: String,
    lastName: String,
    email: {
        type: String,
        unique: true,
    },
    age: { 
        type: Number, 
        min: 3,
        max: 120
    },
});

const User = mongoose.model('User', userSchema);

module.exports = User;