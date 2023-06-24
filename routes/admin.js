const path = require('path');

const express = require('express');

const { mid } = require('../middleware/auth.js');

const adminController = require('../controllers/admin');

const { body } = require('express-validator');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', mid , adminController.getAddProduct);

router.get('/edit-product/:productId' , mid , adminController.getEditProduct);

router.post('/edit-product' , mid , [
  body('title')
  .isString()
  .withMessage('Enter a valid Title')
  .trim() ,
  body('price')
  .isFloat()
  .withMessage('Enter a valid price')
] , adminController.postEditProduct);

// /admin/products => GET
router.get('/products', mid , adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', mid , [
  body('title')
  .isString()
  .withMessage('Enter a valid Title')
  .trim() ,
  body('price')
  .isFloat()
  .withMessage('Enter a valid price')
] , adminController.postAddProduct);

router.post('/delete-product' , mid , adminController.postDeleteProduct);

module.exports = router;
