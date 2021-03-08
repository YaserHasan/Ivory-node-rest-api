const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    categoryID: {type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory', required: true},
    isFeatured: {type: Boolean, default: false},
    name: {
        type: String,
        min: 6,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        min: 0,
        required: true,
    },
    imageURL: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        min: 10,
        type: String,
        required: true,
        trim: true,
    },
    specs: [{
        name: {type: String, trim: true},
        value: {type: String, trim: true},
    }],
    clicks: {
        type: Number,
        default: 0,
        min: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);