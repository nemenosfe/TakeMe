const mysql = require('promise-mysql');

module.exports = {
  getPool: function(multipleStatements = false) {
    return mysql.createPool({
      host     : 'localhost',
      user     : 'root',
      password : '12345678',
      database : 'takemelegends',
      multipleStatements: multipleStatements
    });
  }
};
