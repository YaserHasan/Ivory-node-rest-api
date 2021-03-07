const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        trim: true,
        min: 6,
        required: true,
    },
    price: {
        type: Number,
        min: 0,
        required: true,
    },
    imageURL: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    specs: [{
        name: String,
        values: Schema.Types.Mixed,
    }],
});

module.exports = mongoose.model('Product', productSchema);