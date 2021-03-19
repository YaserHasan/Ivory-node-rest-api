const validationUtils = require('../utils/validation_utils');

const Cart = require('../models/cart_model');
const formatUtils = require('../utils/format_utils');

exports.addProductToCart = async (req, res) => {
    try {
        const productID = req.params.productID;
        const userID = req.userData._id;
        // validation
        if (validationUtils.validateString(productID, 'productID', /^[0-9a-fA-F]{24}$/))
            return res.status(400).json({message: validationUtils.validateString(productID, 'productID', /^[0-9a-fA-F]{24}$/)});

        // check if product available in cart
        const product = await Cart.findOne({userID: userID, productID: productID});
        if (product) 
            return res.status(409).json({message: 'Product already in cart'});
        const cartItem = new Cart({
            userID: userID,
            productID: productID
        });
        await cartItem.save();
        res.status(201).json({message: 'Successfully added product to cart'});
    } catch(e) {
        console.log(e);
        res.status(500).json({message: "internal server error"});
    }
}

exports.incrementProductQuantity = async (req, res) => {
    try {
        const productID = req.params.productID;
        const userID = req.userData._id;
        // validation
        if (validationUtils.validateString(productID, 'productID', /^[0-9a-fA-F]{24}$/))
            return res.status(400).json({message: validationUtils.validateString(productID, 'productID', /^[0-9a-fA-F]{24}$/)});

        // check if product available in cart
        const product = await Cart.findOne({userID: userID, productID: productID});
        if (!product) 
            return res.status(404).json({message: 'no product with this ID could be found on cart'});
        
        await product.updateOne({$inc : {quantity : 1}}).exec();
        res.status(200).json({message: 'Product quantity updated successfully'});

    } catch(e) {
        console.log(e);
        res.status(500).json({message: "internal server error"});
    }
}

exports.decrementProductQuantity = async (req, res) => {
    try {
        const productID = req.params.productID;
        const userID = req.userData._id;
        // validation
        if (validationUtils.validateString(productID, 'productID', /^[0-9a-fA-F]{24}$/))
            return res.status(400).json({message: validationUtils.validateString(productID, 'productID', /^[0-9a-fA-F]{24}$/)});

        // check if product available in cart
        const product = await Cart.findOne({userID: userID, productID: productID});
        if (!product) 
            return res.status(404).json({message: 'No product with this ID could be found on cart'});
        // make sure current quantity greater than 1
        if (product.quantity == 1)
            return res.status(405).json({message: 'product quantity can\'t be less than 1'});

        await product.updateOne({$inc : {quantity : -1}}).exec();
        res.status(200).json({message: 'Product quantity updated successfully'});

    } catch(e) {
        console.log(e);
        res.status(500).json({message: "internal server error"});
    }
}

exports.deleteProductFromCart = async (req, res) => {
    try {
        const productID = req.params.productID;
        const userID = req.userData._id;
        // validation
        if (validationUtils.validateString(productID, 'productID', /^[0-9a-fA-F]{24}$/))
            return res.status(400).json({message: validationUtils.validateString(productID, 'productID', /^[0-9a-fA-F]{24}$/)});

        // check if product available in cart
        const product = await Cart.findOne({userID: userID, productID: productID});
        if (!product) 
            return res.status(404).json({message: 'No product with this ID could be found on cart'});
        
        await product.delete();
        res.status(200).json({message: 'Product deleted successfully'});

    } catch(e) {
        console.log(e);
        res.status(500).json({message: "internal server error"});
    }
}

exports.getUserCart = async (req, res) => {
    try {
        const userID = req.userData._id;
        let userCart = await Cart.find({userID: userID})
        .populate({
            path: 'productID',
            populate: [
                {
                    path: 'productID', 
                    model: 'Product',
                },
                {
                    path: 'categoryID', 
                    model: 'ProductCategory',
                }
            ]
        })
        .exec();
        let cartTotalPrice = 0;
        userCart = userCart.map((cartProduct) => {
            const productTotalPrice = cartProduct.productID.price * cartProduct.quantity;
            cartTotalPrice += productTotalPrice;
            return {
                ...formatUtils.formatProduct(cartProduct.productID),
                quantity: cartProduct.quantity,
                productTotalPrice: productTotalPrice,
            };
        });
        res.status(200).json({data: userCart});
    } catch(e) {
        console.log(e);
        res.status(500).json({message: "internal server error"});
    }
}

exports.isProductInUserCart = async (req, res) => {
    try {
        const productID = req.params.productID;
        // validation
        if (validationUtils.validateString(productID, 'productID', /^[0-9a-fA-F]{24}$/))
            return res.status(400).json({message: validationUtils.validateString(productID, 'productID', /^[0-9a-fA-F]{24}$/)});

        const userID = req.userData._id;
        const productItem = await Cart.findOne({userID: userID, productID: productID});
        if (productItem)
            return res.status(200).json({message: 'Product available in user cart', isInCart: true});
        res.status(200).json({message: 'Product not available in user cart', isInCart: false});
        
    } catch(e) {
        console.log(e);
        res.status(500).json({message: "internal server error"});
    }
}