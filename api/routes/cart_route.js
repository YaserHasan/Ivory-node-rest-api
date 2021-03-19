const express = require('express');
const router = express.Router();

const CartController = require('../controllers/cart_controller'); 
const checkAuth = require('../middlewares/check_auth');


router.get('/', checkAuth, CartController.getUserCart);

router.post('/:productID', checkAuth, CartController.addProductToCart);

router.put('/incrementQuantity/:productID', checkAuth, CartController.incrementProductQuantity);

router.put('/decrementQuantity/:productID', checkAuth, CartController.decrementProductQuantity);

router.get('/:productID', checkAuth, CartController.isProductInUserCart);

router.delete('/:productID', checkAuth, CartController.deleteProductFromCart);

module.exports = router;