const express = require('express');
const router = express.Router();

const CartController = require('../controllers/cart_controller'); 
const checkAuth = require('../middlewares/check_auth');


router.get('/', checkAuth, CartController.getUserCart);

router.post('/', checkAuth, CartController.addProductToCart);

router.put('/incrementQuantity', checkAuth, CartController.incrementProductQuantity);

router.put('/decrementQuantity', checkAuth, CartController.decrementProductQuantity);

router.delete('/', checkAuth, CartController.deleteProductFromCart);

module.exports = router;