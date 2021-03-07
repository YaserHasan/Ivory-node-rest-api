const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    products: [
        {
            productID: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
            quantity: {type: Number, min: 0, required: true},
            itemTotalPrice: {type: Number, min: 0, required: true}, 
        }
    ],
    totalPrice: {type: Number, min: 0, required: true},
});

module.exports = mongoose.model('Order', orderSchema);