const {  Client  } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'shop',
  user: 'godachi',
});
client.connect();

module.exports = class Users{
  static async addUser(username , password , email){
    const sqlQuery = `INSERT INTO users(username , password , email) VALUES('${username}' , '${password}' , '${email}');`;
    const added = await client.query(sqlQuery);
  }

  static async getUser(username){
    const sqlQuery = `SELECT * FROM users WHERE username='${username}';`;
    let check = await client.query(sqlQuery);
    check = check.rows;
    if(check.length > 0){
      return true;
    }
    return false;
  }

  static async emailExists(email){
    const sqlQuery = `SELECT * FROM users WHERE email='${email}';`;
    let check = await client.query(sqlQuery);
    check = check.rows;
    if(check.length > 0){
      return true;
    }
    return false;
  }

  static async getPassword(username){
    const sqlQuery = `SELECT password FROM users WHERE username='${username}';`;
    const res = await client.query(sqlQuery);
    if(!res.rows[0]){
      return null;
    }
    return res.rows[0].password;
  }

  static async getEmail(username){
    const sqlQuery = `SELECT email FROM users WHERE username='${username}';`;
    const res = await client.query(sqlQuery);
    if(!res.rows[0]){
      return null;
    }
    return res.rows[0].email;
  }

}