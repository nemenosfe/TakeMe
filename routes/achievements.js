"use strict"
const express = require('express')
const router = express.Router()
const mysql = require('promise-mysql');

const pool  = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : '12345678',
  database : 'takemelegends'
});

function handleError(err, res, requestVerb) {
  console.log("Error "+requestVerb+" : " + JSON.stringify(err));
  res
    .status(500)
    .json({error: true, message: 'Error: ' +  JSON.stringify(err)})
}

function handleNoParams(res) {
  res
    .status(403)
    .json({error: true, message: 'Missing params'})
}


router

  .get('/', function(req, res, next) {
    let page_size = "20";
    let page_number = "1";
    if (req.body && req.body.page_size) { page_size = req.body.page_size; }
    if (req.body && req.body.page_number) { page_number = req.body.page_number; }
    const limit = page_size;
    const offset = page_size*(page_number-1);
    pool.getConnection().then(function(mysqlConnection) {
      mysqlConnection.query("SELECT * FROM achievements ORDER BY name ASC LIMIT " + limit + " OFFSET " + offset + " ;")
      .then((result) => {
        res
          .status(200)
          .json({achievements: result})
      })
      .catch((err) => {
        console.log("ERROR: " + JSON.stringify(err));
        handleError(err, res, "GET");
      });
    });
  })

  .get('/user', function(req, res, next) {
    if(!req.body || !req.body.uid || !req.body.provider) { handleNoParams(res); }
    else {
      let page_size = "20";
      let page_number = "1";
      if (req.body && req.body.page_size) { page_size = req.body.page_size; }
      if (req.body && req.body.page_number) { page_number = req.body.page_number; }
      const limit = page_size;
      const offset = page_size*(page_number-1);
      let achievementsResponse = {
        "total_items" : 0,
        "achievements" : []
      };

      pool.getConnection().then(function(mysqlConnection) {
      const sql = "SELECT ach.name, ach.description FROM achievements ach, acquisitions acq WHERE ach.name = acq.achievements_name AND acq.users_uid = '"+req.body.uid+"' AND acq.users_provider = '"+req.body.provider+"' ORDER BY name ASC LIMIT " + limit + " OFFSET " + offset + " ;";
      mysqlConnection.query(sql)
        .then((DBresult) => {
          achievementsResponse.total_items = DBresult.length;
          for (let index = 0; index < DBresult.length; index++) {
            let elementArray = {
              'name' : DBresult[index].name,
              'description' : DBresult[index].description
            };
            achievementsResponse["achievements"][index] = {
              'achievement' : elementArray
            };
          }

          res
            .status(200)
            .json(achievementsResponse)
        })
        .catch((err) => {
          console.log("ERROR: " + JSON.stringify(err));
          handleError(err, res, "GET/user");
        });
      });
    }
  })

module.exports = router
