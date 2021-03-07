const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        trim: true,
        match: /([a-zA-Z]{2,} )([a-zA-Z]{2,})/,
        required: true,
    },
    email: { 
        type: String,   
        trim: true,
        required: true, 
        unique: true, 
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    password: {
        type: String,    
        trim: true,
        min: 6,
        required: true,
    }
});

module.exports = mongoose.model('User', userSchema);