const mongoose = require('mongoose');
const User = require('./user_model');

const refreshTokenSchema = mongoose.Schema({
    userID: {type: String, required: true},
    refreshToken: {type: String, required: true, unique: true},
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);