const mongoose = require("mongoose");

const validationUtils = require('../utils/validation_utils');
const formatUtils = require('../utils/format_utils');
const Order = require('../models/order_model');
const Cart = require('../models/cart_model');


exports.createOrder = async (req, res) => {
    try {
        // get user cart
        const userID = req.userData._id;
        const userCart = await Cart.find({userID: userID}).populate('productID').exec();
        // check if user cart is empty
        if (userCart.length == 0)
            return res.status(404).json({mesage: 'no Products could be found on user cart'});
        // create order
        let orderTotalPrice = 0;
        const orderProducts = userCart.map((cartProduct) => {
            const productTotalPrice = cartProduct.productID.price * cartProduct.quantity;
            orderTotalPrice += productTotalPrice;
            return {
                productID: cartProduct.productID._id,
                quantity: cartProduct.quantity,
                productTotalPrice: productTotalPrice,
            };
        });
        const order = new Order({
            _id: mongoose.Types.ObjectId(),
            userID: userID,
            products: orderProducts,
            totalPrice: orderTotalPrice,
        });
        await order.save();
        // clear user cart
        await Cart.deleteMany({userID: userID});
        res.status(201).json({mesage: 'Order created successfully'});
    } catch(e) {
        console.log(e);
        res.status(500).json({message: "internal server error"});
    }
}

exports.getUserOrders = async (req, res) => {
    try {
        const userID = req.userData._id;
        let userOrders = await Order.find({userID: userID})
        .populate({
            path: 'products.productID',
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
        userOrders = userOrders.map((order) => {
            return {
                id: order._id,
                date: order.date,
                totalPrice: order.totalPrice,
                products: order.products.map((product) => {
                    return {
                        ...formatUtils.formatProduct(product.productID),
                        quantity: product.quantity,
                        productTotalPrice: product.productTotalPrice,
                    };
                })
            };
        });
        res.status(200).json({data: userOrders});
    } catch(e) {
        console.log(e);
        res.status(500).json({message: "internal server error"});
    }
}