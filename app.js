const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

const errorController = require('./controllers/error');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const fileStorage = multer.diskStorage({
  destination: (req , file , cb) => {
    cb(null , 'images');
  },
  filename: (req , file , cb) => {
    cb(null , new Date().toISOString() + '-' + file.originalname);
  }
});

const fileFilter = (req , file , cb) => {
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
    cb(null , true);
  }
  else{
    cb(null , false);
  }
}

const adminRoutes = require('./routes/admin.js');
const shopRoutes = require('./routes/shop.js');
const authRoutes = require('./routes/auth.js');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage: fileStorage , fileFilter: fileFilter}).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images' , express.static(path.join(__dirname, 'images')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);



app.listen(3000);
