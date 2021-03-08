const express = require('express');
const router = express.Router();

const ProductsController = require('../controllers/products_controller'); 


router.post('/', ProductsController.addProduct);

router.post('/categories', ProductsController.addCategory);

router.get('/categories', ProductsController.getAllCategories);

router.get('/categories/:categoryID', ProductsController.getCategoryProducts);

router.get('/mostPopular', ProductsController.getMostPopularProducts);

router.get('/featured', ProductsController.getFeaturedProducts);

router.get('/:productID', ProductsController.getProductDetails);

module.exports = router;