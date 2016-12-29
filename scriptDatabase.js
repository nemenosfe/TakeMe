"use strict"
const fs = require('fs'),
      mysql = require('promise-mysql'),
      Promise = require("bluebird"),

      utilsDatabaseRelated = require('./utils/databaseRelated'),
      pool  = utilsDatabaseRelated.getPool(true);

(() => { // Funció anònima que es crida a ella mateixa
  pool.getConnection().then(function(mysqlConnection) {
    console.log("Creant les taules de la base de dades...");
    const sqlCreateTables = fs.readFileSync('createTables.sql', 'utf8');
    mysqlConnection.query(sqlCreateTables)
    .then(() => {
      console.log("Fent un insert de l'appkey a la base de dades...");
      const sqlInsertAppkey = fs.readFileSync('insertAppkey.sql', 'utf8');
      return mysqlConnection.query(sqlInsertAppkey);
    })
    .then(() => {
      console.log("Fent un insert de les categories a la base de dades...");
      const sqlInsertCategories = fs.readFileSync('insertCategories.sql', 'utf8');
      return mysqlConnection.query(sqlInsertCategories);
    })
    .then(() => {
      console.log("Fent un insert de les recompenses a la base de dades...");
      const objectRewards = JSON.parse(fs.readFileSync('rewards.json', 'utf8')),
            funcInsertRewards = Promise.method(function(index) {
              return new Promise((resolve, reject) => {
                if (index >= 0) {
                  const reward = objectRewards["rewards"][index],
                        insertQuery = `INSERT INTO rewards values ('${reward.name}', '${reward.description}', ${reward.takes}, ${reward.level})`,
                        responseDB = mysqlConnection.query(insertQuery);
                  resolve( responseDB.then( funcInsertRewards.bind(null, index - 1) ) );
                } else { resolve (1); }
              });
            });
      return funcInsertRewards( (objectRewards["rewards"].length - 1) );
    })
    .then(() => {
      console.log("Fent un insert dels 'logros' a la base de dades...");
      const objectAchievements = JSON.parse(fs.readFileSync('achievements.json', 'utf8')),
            funcInsertAchievements = Promise.method(function(index) {
              return new Promise((resolve, reject) => {
                if (index >= 0) {
                  const achievement = objectAchievements["achievements"][index],
                        insertQuery = `INSERT INTO achievements values ('${achievement.id}', '${achievement.name}', '${achievement.description}', ${achievement.takes}, '${achievement.category}', ${achievement.number_required_attendances});`,
                        responseDB = mysqlConnection.query(insertQuery);
                  resolve( responseDB.then( funcInsertAchievements.bind(null, index - 1) ) );
                } else { resolve (1); }
              });
            });
      return funcInsertAchievements( (objectAchievements["achievements"].length - 1) );
    })
    .then(() => {
      console.log("Fent un insert de dades falses a la base de dades per fer proves... :)");
      const sqlInsertDadesFalsesPerFerProves = fs.readFileSync('insertDadesFalsesPerFerProves.sql', 'utf8');
      return mysqlConnection.query(sqlInsertDadesFalsesPerFerProves);
    })
    .then(() => {
      console.log("S'ha inserit tot correctament :)");
    })
    .catch((err) => {
      console.log("ERROR: " + JSON.stringify(err));
    })
    .finally(() => {
      pool.releaseConnection(mysqlConnection); // Tanco la connexió amb la base de dades
      console.log("S'ha alliberat la connexió de la base de dades");
      // No hem de tancar manualment el fitxers (fs) perquè "readFileSync" s'encarrega d'obrir-los i de tancar-los ell solet.
      process.exit(); // Tanco aquest procés
    });
  });
})();
