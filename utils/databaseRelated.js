const mysql = require('promise-mysql');

module.exports = {
  getPool: function() {
    return mysql.createPool({
      host     : 'localhost',
      user     : 'root',
      password : '12345678',
      database : 'takemelegends'
    });
  }
};
