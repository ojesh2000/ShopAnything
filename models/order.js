const {  Client  } = require('pg');
const Cart = require('./cart.js');
const Order_Details = require('./order_details.js');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'shop',
  user: 'godachi',
});
client.connect();



// const getOrders = async (username) => {
//   let orders = await client.query(`SELECT id FROM ord WHERE username='${username}';`);
//   orders = orders.rows;
//   const details = [];
//   for(let id of orders){
//     id = parseInt(id.id);
//     let prods = await Order_Details.getDetailsByOrderID(id);
//     console.log(prods);
//     const put = {
//       id: id,
//       products: prods
//     };
//     details.push(put);
//   }
//   return details;
// }

// const print = async() => {
//   const dets = await getOrders('Ojesh');
//   console.log(dets);
// }

// print();

module.exports = class Order{
  
  static async addOrder(userName){
    const sqlQuery = `INSERT INTO ord(username)VALUES('${userName}');`;
    const added = await client.query(sqlQuery);
    const products = await Cart.getData(userName);
    let order_id = await client.query('SELECT MAX(id) FROM ord;');
    order_id = parseInt(order_id.rows[0].max);
    for(let p of products){
      const done = await Order_Details.addDetails(order_id , p.title , p.imageurl , p.description , p.price , p.qty);
    }

  }

  static async getOrders(username){
    let orders = await client.query(`SELECT id FROM ord WHERE username='${username}';`);
    orders = orders.rows;
    const details = [];
    for(let id of orders){
      id = parseInt(id.id);
      let prods = await Order_Details.getDetailsByOrderID(id);
      let totalPrice = 0;
      for(let p of prods){
        totalPrice += parseInt(p.qty) * parseInt(p.price);
      }
      const put = {
        id: id,
        products: prods,
        totalPrice: totalPrice
      };
      details.push(put);
    }
    return details;

  }

}