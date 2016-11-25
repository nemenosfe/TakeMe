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
  const objectAchievements = JSON.parse(fs.readFileSync('achievements.json', 'utf8'));
  pool.getConnection().then(function(mysqlConnection) {

    const funcInsertAchievements = Promise.method(function(index) {
      return new Promise((resolve, reject) => {
        if (index >= 0) {
          const achievement = objectAchievements["achievements"][index];
          const insertQuery = "INSERT INTO achievements values ('"+achievement.id+"', '"+achievement.name+"', '"+achievement.description+"', "+achievement.takes+", '"+achievement.category+"', "+achievement.number_required_attendances+");";
          const responseDB = mysqlConnection.query(insertQuery);
          resolve( responseDB.then( funcInsertAchievements.bind(null, index - 1) ) );
        } else { resolve (1); }
      });
    });

    funcInsertAchievements( (objectAchievements["achievements"].length - 1) )
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
