const Product = require('../models/product');
const {  validationResult  } = require('express-validator');

const getToken = (req) => {
  if(!req.get('Cookie')){
    return null;
  }
  let cookies = req.get('Cookie').split(';');
  for(let i = 0;i < cookies.length;++i){
    cookies[i] = cookies[i].trim();
    if(cookies[i].split('=')[0] === 'token'){
      return cookies[i].split('=')[1];
    }
  }
  return null;
}

exports.getAddProduct = (req, res, next) => {
  let b = getToken(req);
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true,
    isAuthenticated: (b != 'deleted' && b != null),
    errorMessage: ''
  });
};

exports.postAddProduct = async (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;

  if(!image){
    let b = getToken(req);
    return res.status(422).render('admin/edit-product' , {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      formsCSS: true,
      productCSS: true,
      activeAddProduct: true,
      isAuthenticated: (b != 'deleted' && b != null),
      errorMessage: 'Please Upload an Image'
    });
  }
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    let b = getToken(req);
    return res.status(422).render('admin/edit-product' , {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      formsCSS: true,
      productCSS: true,
      activeAddProduct: true,
      isAuthenticated: (b != 'deleted' && b != null),
      errorMessage: errors.array()[0].msg
    });
  }
  const imageUrl = image.path;
  const product = new Product(null , title, imageUrl, description, price);
  const added = await product.save();
  res.redirect('/');
};

exports.getEditProduct = async (req, res, next) => {
  let b = getToken(req);
  const editMode = req.query.edit;
  if(!editMode || editMode === "false"){
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  const product = await Product.getProductById(prodId);  
  if(!product){
    return res.redirect('/');
  }

  res.render('admin/edit-product', {
    pageTitle: 'Edit Product',
    path: '/admin/edit-product',
    editing: editMode,
    product: product,
    isAuthenticated: (b != 'deleted' && b != null),
    errorMessage: ''
  });
};

exports.postEditProduct = async (req , res , next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    let b = getToken(req);
    return res.status(422).render('admin/edit-product' , {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      formsCSS: true,
      productCSS: true,
      activeAddProduct: true,
      isAuthenticated: (b != 'deleted' && b != null),
      errorMessage: errors.array()[0].msg
    });
  }
  const id = req.body.productId;
  const image = req.file;
  if(!image){
    let b = getToken(req);
    return res.status(422).render('admin/edit-product' , {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      formsCSS: true,
      productCSS: true,
      activeAddProduct: true,
      isAuthenticated: (b != 'deleted' && b != null),
      errorMessage: 'Please Select a valid Image'
    });
  }
  const updatedProduct = new Product(id,
    req.body.title,
    image.path,
    req.body.description,
    req.body.price
  );
  const edited = await updatedProduct.save();
  res.redirect('/admin/products')
}

exports.getProducts = async (req, res, next) => {
  const products = await Product.fetchAll();
  let b = getToken(req);
  res.render('admin/products', {
    prods: products,
    pageTitle: 'Admin Products',
    path: '/admin/products',
    isAuthenticated: (b != 'deleted' && b != null)
  });
};

exports.postDeleteProduct = async (req , res , next) => {
  const id = req.body.productId;
  const deleted = await Product.deleteById(id);
  res.redirect('/admin/products');
}
