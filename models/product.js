// const fs = require('fs');
const path = require('path');
const Cart = require('./cart.js');
const {  Client  } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'shop',
  user: 'godachi',
});
client.connect();

// const p = path.join(
//   path.dirname(process.mainModule.filename),
//   'data',
//   'products.json'
// );

const getProducts = async () => {
  let products = await client.query('SELECT * FROM products;');
  // products = products.rows;
  for(let p of products.rows){
    p.imageUrl = p.imageurl;
  }
  return products.rows;
};

module.exports = class Product {
  constructor(id , title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  async save() {
    const products = await getProducts();
    const p = products.find(prod => this.id === prod.id);
    if(p){
      // getProductsFromFile(products => {
      //   const existingProductIndex = products.findIndex(prod => prod.id === this.id);
      //   const updatedProduct = products;
      //   updatedProduct[existingProductIndex] = this;
      //   fs.writeFile(p, JSON.stringify(updatedProduct), err => {
      //     console.log(err);
      //   });
      // });
      // const products = await getProducts();
      const sqlQuery = `UPDATE products SET title = '${this.title}' , imageurl = '${this.imageUrl}' , description = '${this.description}' , price = ${this.price} WHERE id = ${this.id};`;
      const updatedProducts = await client.query(sqlQuery);
    }
    else{
      const sqlQuery = `INSERT INTO products(title , imageurl , description , price) VALUES('${this.title}' , '${this.imageUrl}' , '${this.description}' , ${this.price});`;
      const updatedProducts = await client.query(sqlQuery);
      // this.id = Math.random().toString();
      // getProductsFromFile(products => {
      //   products.push(this);
      //   fs.writeFile(p, JSON.stringify(products), err => {
      //     if(err){
      //       console.log(err);
      //     }
      //   });
      // });
    }
  }

  static async deleteById(productId) {
    const sqlQuery = `DELETE FROM products WHERE id = ${productId}`;
    const updatedProducts = await client.query(sqlQuery);
    const updatedCart = await Cart.deleteProduct(productId);
    // getProductsFromFile(products => {
    //   const product = products.find(prod => prod.id === productId);
    //   const toDeleteIndex = products.findIndex(p => p.id === productId);  
    //   const updatedProducts = products.filter((val , index) => index != toDeleteIndex);
    //   fs.writeFile(p , JSON.stringify(updatedProducts) , err => {
    //     if(!err){
    //       Cart.deleteProduct(productId , product.price);
    //     }
    //   });
    // });

  }

  static async fetchAll() {
    let products = await getProducts();
    return products;
  }

  static async getProductById(id){
    let products = await getProducts();
    let product = products.find(prod => prod.id === id);
    return product;
    // getProductsFromFile((products) => {
    //   const product = products.find(p => p.id === id);//Note - eventhough this is an O(n) operation. This code is synchronously executed
    //   cb(product);
    // });
  }


};
