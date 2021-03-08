const mongoose = require('mongoose');

const productCategorySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        trim: true,
        min: 6,
        required: true,
        unique: true,
    },
});

module.exports = mongoose.model('ProductCategory', productCategorySchema);