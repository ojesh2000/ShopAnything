const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user.js');

const { validationResult } = require('express-validator');

const getToken = (req) => {
  if(req.get('Cookie') === null){
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

exports.getLogin = (req, res, next) => {
  let b = getToken(req);
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: (b != 'deleted' && b != null),
    errorMessage: '',
    oldInput: {
      username: '',
      email: '',
      password: ''
    },
    validationErrors: []
  });
};

exports.getSignup = (req, res, next) => {
  let b = getToken(req);
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: (b != 'deleted' && b != null),
    errorMessage: '',
    oldInput: {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationErrors: []
  });
};

exports.postLogin = async (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(422).render('auth/login' , {
      path: '/login',
      pageTitle: 'Login',
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      oldInput: {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
      },
      validationErrors: errors.array()
    });
  }
  const token = jwt.sign({
    username: req.body.username,
    email: req.body.email,
  } , 'secret' , {  expiresIn: '2h' });
  res.setHeader('Set-Cookie' , `token=${token}; Max-Age=25200 HttpOnly`);
  res.redirect('/');
};

exports.postSignup = async (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(422).render('auth/signup' , {
      path: '/signup',
      pageTitle: 'Login',
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      oldInput: {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword
      },
      validationErrors: errors.array()
    });
  }
  const encryptedPassword = await bcrypt.hash(req.body.password , 12)
  const token = jwt.sign({
    username: req.body.username,
    email: req.body.email,
  } , 'secret' , {expiresIn: '2h'});
  res.setHeader('Set-Cookie' , `token=${token}; Max-Age=25200 HttpOnly`);
  const added = await User.addUser(req.body.username , encryptedPassword , req.body.email);
  res.redirect('/');
};

exports.postLogout = (req, res, next) => {
  res.setHeader('Set-Cookie' , 'token=deleted; Max-Age=0 HttpOnly');
  res.redirect('/');
};
