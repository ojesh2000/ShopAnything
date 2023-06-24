const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');

const { mid } = require('../middleware/auth.js');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId' , shopController.getProduct);

router.get('/cart', mid , shopController.getCart);

router.post('/cart' , mid , shopController.postCart);

router.get('/orders', mid , shopController.getOrders);

router.get('/checkout', mid , shopController.getCheckout);

router.get('/checkout/sucess', mid , shopController.postOrder);

router.get('/checkout/cancel', mid , shopController.getCheckout);

router.post('/cart-delete-item' , mid , shopController.postCartDeleteProduct);

router.get('/invoice/:orderId' , mid , shopController.getInvoice);

module.exports = router;
