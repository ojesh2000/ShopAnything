const {  Client  } = require('pg');
const Cart = require('./cart.js');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'shop',
  user: 'godachi',
});
client.connect();


module.exports = class Order_Details{
  
  static async addDetails(order_id , title , imageurl , description , price , qty){
    const sqlQuery = `INSERT INTO order_details(order_id , title , imageurl , description , price , qty)VALUES('${order_id}' , '${title}' , '${imageurl}' , '${description}' , '${price}' , '${qty}');`;
    const added = await client.query(sqlQuery); 
  }

  static async getDetailsByOrderID(order_id){
    const sqlQuery = `SELECT title , qty , price FROM order_details WHERE order_id = '${order_id}';`
    const res = await client.query(sqlQuery);
    return res.rows;
  }
}