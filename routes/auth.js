const express = require('express');

const authController = require('../controllers/auth');

const { mid } = require('../middleware/auth.js');

const { check , body } = require('express-validator');

const router = express.Router();

const User = require('../models/user.js');

const bcrypt = require('bcrypt');

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login' , [
  check('email')
  .isEmail()
  .withMessage('Please Enter a valid Email address')
  .custom(async (value , {req}) => {
    const recordedEmail = await User.getEmail(req.body.username);
    if(recordedEmail === null){
      throw new Error(`User doesn't exists`);
    }
    if(recordedEmail !== req.body.email){
      throw new Error('Wrong Email Address');
    }
    const hashedPassword = await User.getPassword(req.body.username);
    const isEqual = await bcrypt.compare(req.body.password , hashedPassword);
    if(!isEqual){
      throw new Error('Wrong Password');
    }
    return true;
  })
] , authController.postLogin);

router.post('/signup', [
  body('password' , 'Please enter a password with only numbers and text and it must have atleast 5 characters')
  .isLength({min: 5})
  .isAlphanumeric() , 
  check('email')
  .isEmail()
  .withMessage('Please Enter a valid Email address')
  .custom(async (value , {req}) => {
    const exists = await User.emailExists(value);
    if(exists){
      throw new Error(`This email already exists`);
    }
    return true;
  }) , 
  body('password')
  .custom((value , {req}) => {
    if(value !== req.body.confirmPassword){
      throw new Error('Passwords Does not match');
    }
    return true;
  }),
  check('username')
  .custom(async (value , {req}) => {
    const alreadyExists = await User.getUser(value);
    if(alreadyExists){
      throw new Error(`This User Name is taken.Select a different one`);
    }
    return true;
  })
] , authController.postSignup);

router.post('/logout' , authController.postLogout);

module.exports = router;