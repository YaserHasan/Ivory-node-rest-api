const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        min: 1, 
        default: 1,
    },
});

module.exports = mongoose.model('Cart', cartSchema);