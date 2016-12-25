"use strict"
const fs = require('fs'),
      mysql = require('promise-mysql'),
      Promise = require("bluebird"),

      utilsDatabaseRelated = require('./utils/databaseRelated'),
      pool  = utilsDatabaseRelated.getPool(true);

(() => { // Funció anònima que es crida a ella mateixa
  pool.getConnection().then(function(mysqlConnection) {
    const sqlCreateTables = fs.readFileSync('createTables.sql', 'utf8');
    mysqlConnection.query(sqlCreateTables)
    .then(() => {
      const sqlInsertAppkey = fs.readFileSync('insertAppkey.sql', 'utf8');
      return mysqlConnection.query(sqlInsertAppkey);
    })
    .then(() => {
      const sqlInsertCategories = fs.readFileSync('insertCategories.sql', 'utf8');
      return mysqlConnection.query(sqlInsertCategories);
    })
    .then(() => {
      const objectRewards = JSON.parse(fs.readFileSync('rewards.json', 'utf8')),
            funcInsertRewards = Promise.method(function(index) {
              return new Promise((resolve, reject) => {
                if (index >= 0) {
                  const reward = objectRewards["rewards"][index];
                  const insertQuery = "INSERT INTO rewards values ('"+reward.name+"', '"+reward.description+"', "+reward.takes+", '"+reward.level+"');";
                  const responseDB = mysqlConnection.query(insertQuery);
                  resolve( responseDB.then( funcInsertRewards.bind(null, index - 1) ) );
                } else { resolve (1); }
              });
            });
      return funcInsertRewards( (objectRewards["rewards"].length - 1) );
    })
    .then(() => {
      const objectAchievements = JSON.parse(fs.readFileSync('achievements.json', 'utf8')),
            funcInsertAchievements = Promise.method(function(index) {
              return new Promise((resolve, reject) => {
                if (index >= 0) {
                  const achievement = objectAchievements["achievements"][index];
                  const insertQuery = "INSERT INTO achievements values ('"+achievement.id+"', '"+achievement.name+"', '"+achievement.description+"', "+achievement.takes+", '"+achievement.category+"', "+achievement.number_required_attendances+");";
                  const responseDB = mysqlConnection.query(insertQuery);
                  resolve( responseDB.then( funcInsertAchievements.bind(null, index - 1) ) );
                } else { resolve (1); }
              });
            });
      return funcInsertAchievements( (objectAchievements["achievements"].length - 1) );
    })
    .then(() => {
      const sqlInsertDadesFalsesPerFerProves = fs.readFileSync('insertDadesFalsesPerFerProves.sql', 'utf8');
      return mysqlConnection.query(sqlInsertDadesFalsesPerFerProves);
    })
    .catch((err) => {
      console.log("ERROR: " + JSON.stringify(err));
    })
    .finally(() => {
      pool.releaseConnection(mysqlConnection); // Tanco la connexió amb la base de dades
      // No hem de tancar manualment el fitxers (fs) perquè "readFileSync" s'encarrega d'obrir-los i de tancar-los ell solet.
      process.exit(); // Tanco aquest procés
    });
  });
})();
