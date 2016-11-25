"use strict"
const fs = require('fs');
const mysql = require('promise-mysql');
const Promise = require("bluebird");

const pool  = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : '12345678',
  database : 'takemelegends'
});

(() => { // Funció anònima que es crida a ella mateixa
  const objectRewards = JSON.parse(fs.readFileSync('rewards.json', 'utf8'));
  pool.getConnection().then(function(mysqlConnection) {

    const funcInsertRewards = Promise.method(function(index) {
      return new Promise((resolve, reject) => {
        if (index >= 0) {
          const reward = objectRewards["rewards"][index];
          const insertQuery = "INSERT INTO rewards values ('"+reward.name+"', '"+reward.description+"', "+reward.takes+", '"+reward.level+"');";
          const responseDB = mysqlConnection.query(insertQuery);
          resolve( responseDB.then( funcInsertRewards.bind(null, index - 1) ) );
        } else { resolve (1); }
      });
    });

    funcInsertRewards( (objectRewards["rewards"].length - 1) )
    .catch((err) => {
      console.log("ERROR: " + JSON.stringify(err));
    })
    .finally(() => {
      pool.releaseConnection(mysqlConnection); // Tanco la connexió amb la base de dades
      // No hem de tancar manualment el fitxer json (fs) perquè "readFileSync" s'encarrega d'obrir-lo i de tancar-lo ell solet.
      process.exit(); // Tanco aquest procés
    });
  });
})();
