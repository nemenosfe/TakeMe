const fs = require('fs');
const mysql = require('promise-mysql');

const pool  = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : '12345678',
  database : 'takemelegends'
});

var object = JSON.parse(fs.readFileSync('achievements.json', 'utf8'));
pool.getConnection().then(function(mysqlConnection) {
        object["achievements"].forEach(function(item) {
            var insertQuery = "INSERT INTO achievements values ('"+item.id+"', '"+item.name+"', '"+item.description+"', "+item.takes+", '"+item.category+"');";
            mysqlConnection.query(insertQuery);
        })
    });
