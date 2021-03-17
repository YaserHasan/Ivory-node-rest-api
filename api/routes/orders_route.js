const express = require('express');
const router = express.Router();

const OrderController = require('../controllers/order_controller');
const checkAuth = require('../middlewares/check_auth');

router.post('/', checkAuth, OrderController.createOrder);

router.get('/', checkAuth, OrderController.getUserOrders);

module.exports = router;