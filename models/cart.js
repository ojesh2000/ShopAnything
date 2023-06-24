// const fs = require('fs');
// const path = require('path');

// const p = path.join(
//   path.dirname(process.mainModule.filename),
//   'data',
//   'cart.json'
// );

const {  Client  } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'shop',
  user: 'godachi',
});
client.connect();


const getCart = async (username) => {
  let cart = await client.query(`SELECT * FROM cart WHERE username='${username}';`);
  return cart.rows;
};

const getD = async (username) => {
  const sqlQuery = `SELECT products.id , products.title , products.imageurl , products.description , products.price , cart.qty , cart.username FROM cart INNER JOIN products ON cart.pid = products.id WHERE username='${username}';`;
  let d = await client.query(sqlQuery);
  // console.log(d.rows);
  return d.rows;
}

const isPresent = async (pid , username) => {
  const sqlQuery = `SELECT * FROM cart WHERE pid = ${pid} AND username='${username}';`;
  const res = await client.query(sqlQuery);
  return (res.rows.length > 0 ? true : false);
}

module.exports = class Cart{

  static async getData(username){
    const sqlQuery = `SELECT products.id , products.title , products.imageurl , products.description , products.price , cart.qty , cart.username FROM cart INNER JOIN products ON cart.pid = products.id WHERE username='${username}';`;
    let d = await client.query(sqlQuery);
    // console.log(d.rows);
    return d.rows;
  }

  static async getTotalPrice(username){
    let d = await getD(username);
    let p = 0;
    for(let prod of d){
      p += parseInt(prod.qty) * parseInt(prod.price);
    }
    return p;
  }

  static async addProduct(pid , username) {
    // const cart = await getCart();

    const pr = await isPresent(pid , username);

    if(!pr){
      const addNew = await client.query(`INSERT INTO cart(pid , qty , username) VALUES(${pid} , ${1} , '${username}');`);
    }
    else{
      const updateQty = await client.query(`UPDATE cart SET qty = qty + 1 WHERE pid = ${pid} AND username='${username}';`);
    }
    
    // fs.readFile(p , (err , fileContent) => {
    //   let cart = {products: [] , totalPrice: 0};
    //   if(!err){
    //     cart = JSON.parse(fileContent);
    //   }

    //   const existingProductIndex = cart.products.findIndex(p => p.id === id);
    //   if(existingProductIndex != -1){
    //     console.log(existingProductIndex);
    //     cart.products[existingProductIndex].qty += 1;
    //   }
    //   else{
    //     cart.products = [...cart.products , {id: id , qty: 1}];
    //   }
    //   cart.totalPrice += parseInt(productPrice);

    //   fs.writeFile(p , JSON.stringify(cart) , (err) => {
    //     console.log(err);
    //   });
    // });
  }

  static async deleteProduct(pid , username){
    // const cart = await getCart();

    const pr = await isPresent(pid , username);
    
    if(!pr){
      return ;
    }
    else{
      const del = await client.query(`DELETE FROM cart WHERE pid = ${pid} AND username='${username}';`);
    }
    // fs.readFile(p , (err , fileContent) => {
    //   if(err){
    //     return ;
    //   }
      
    //   const cart = JSON.parse(fileContent);
    //   const updatedCart = {...cart};

    //   const product = updatedCart.products.find(prod => prod.id === id);
    //   if(!product){
    //     return ;
    //   }
    //   const productQty = product.qty;

    //   updatedCart.products = updatedCart.products.filter((p) => p.id != id);
    //   updatedCart.totalPrice = updatedCart.totalPrice - productQty * productPrice;
      
    //   fs.writeFile(p , JSON.stringify(updatedCart) , (err) => {
    //     if(err){
    //       console.log(err);
    //     }
    //   });
    // });
  }

  static async getCart(username){
    const cart = await getCart(username);
    return cart;
    // fs.readFile(p , (err , fileContent) => {
    //   if(!err){
    //     let cart = JSON.parse(fileContent);
    //     cb(cart);
    //   }else{
    //     cb(null);
    //   }
    // });
  } 

  static async clearCart(username){
    const done = await client.query(`DELETE FROM cart WHERE username='${username}';`);
  }

};