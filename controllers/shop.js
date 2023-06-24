const Product = require('../models/product.js');
const Cart = require('../models/cart.js');
const Order = require('../models/order.js');

require('dotenv').config()

const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');

const fs = require('fs');
const path = require('path');

const getToken = (req) => {
  if(req.get('Cookie') === null)return null;
  let cookies = req.get('Cookie').split('=');
  for(let i = 0;i < cookies.length;++i){
    if(cookies[i] === 'token'){
      let token = '';
      for(let j = 0;j < cookies[i + 1].length;++j){
        if(cookies[i + 1][j] === ';'){
          break ;
        }
        else{
          token += cookies[i + 1][j];
        }
      }
      return token;
    }
  }
  return null;
}

exports.getProducts = async (req, res, next) => {
  const products = await Product.fetchAll();
  let b = getToken(req);
  res.render('shop/product-list', {
    prods: products,
    pageTitle: 'All Products',
    path: '/products',
    isAuthenticated: (b != 'deleted' && b != null)
  });
};

exports.getProduct = async (req , res , next) => {
  const prodId = req.params.productId;
  const product = await Product.getProductById(prodId);
  let b = getToken(req);
  res.render('shop/product-detail' , {
    product: product , 
    pageTitle: product.title , 
    path:'/products',
    isAuthenticated: (b != 'deleted' && b != null)
  });
}

exports.getIndex = async (req, res, next) => {
  const products = await Product.fetchAll();
  let b = getToken(req);
  res.render('shop/index', {
    prods: products,
    pageTitle: 'Shop',
    path: '/',
    isAuthenticated: (b != 'deleted' && b != null)
  });
};

exports.getCart = async (req, res, next) => {
  let b = getToken(req);
  const tokenPayload = jwt.decode(b);
  const cartProducts = await Cart.getData(tokenPayload.username);
  // console.log(cartProducts[0]);
  const cartPrice = await Cart.getTotalPrice(tokenPayload.username);
  res.render('shop/cart', {
    path: '/cart',
    pageTitle: 'Your Cart',
    products: cartProducts,
    totalPrice: cartPrice,
    isAuthenticated: (b != 'deleted' && b != null)
  });
};

exports.postCart = async (req , res , next) => {
  const prodId = req.body.productId;
  // console.log(prodId);
  let b = getToken(req);
  const tokenPayload = jwt.decode(b);
  const addP = await Cart.addProduct(prodId , tokenPayload.username);
  // Product.getProductById(prodId , product => {
  //   Cart.addProduct(prodId , product.price);
  // });
  res.redirect('/cart');
}

exports.getOrders = async (req, res, next) => {
  //add username functionality
  let b = getToken(req);
  const tokenPayload = jwt.decode(b);
  const order_dets = await Order.getOrders(tokenPayload.username);
  // console.log(order_dets);
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders',
    orders: order_dets,
    isAuthenticated: (b != 'deleted' && b != null)
  });
};

exports.postOrder = async (req , res , next) => {
  let b = getToken(req);
  const tokenPayload = jwt.decode(b);
  const add = await Order.addOrder(tokenPayload.username);
  const removeItems = await Cart.clearCart(tokenPayload.username); 
  res.redirect('/');
}

exports.getCheckout = async (req, res, next) => {
  let b = getToken(req);
  const tokenPayload = jwt.decode(b);
  const cartProducts = await Cart.getData(tokenPayload.username);
  const cartPrice = await Cart.getTotalPrice(tokenPayload.username);

  const stripeCart = cartProducts.map(p => {
    return {
      price_data: {
        currency: 'inr',
        unit_amount: p.price * 100 ,
        product_data: {
          name: p.title , 
          description: p.description
        },
      },
      quantity: p.qty

    };
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: stripeCart,
    mode: 'payment',
    success_url: req.protocol + '://' + req.get('host') + '/checkout/sucess',
    cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'

  });
  res.render('shop/checkout', {
    path: '/cart',
    pageTitle: 'Your Cart',
    products: cartProducts,
    totalPrice: cartPrice,
    isAuthenticated: (b != 'deleted' && b != null),
    sessionId: session.id
  });
};

exports.postCartDeleteProduct = async (req , res , next) => {
  let b = getToken(req);
  const tokenPayload = jwt.decode(b);
  const prodId = req.body.productId;
  const del = await Cart.deleteProduct(prodId , tokenPayload.username);
  res.redirect("/cart");
  // Product.getProductById(prodId , (product) => {
  //   Cart.deleteProduct(prodId , parseInt(product.price));
  //   res.redirect('/cart');
  // });
}

exports.getInvoice = async (req , res , next) => {
  const orderId = req.params.orderId;
  const invoiceName = 'invoice-' + orderId + '.pdf';
  const invoicePath = path.join('data' , 'invoices' , invoiceName);

  const pdfDoc = new PDFDocument();
  pdfDoc.pipe(fs.createWriteStream(invoicePath));
  pdfDoc.pipe(res);

  pdfDoc.text('Invoice for Order with Order Id = ' + orderId);

  pdfDoc.end();
}