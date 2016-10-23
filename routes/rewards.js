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
    console.log("Arriba fins aquí");
    let page_size = "20";
    let page_number = "1";
    console.log("Abans de l'IF");
    if (req.body && req.body.page_size) { page_size = req.body.page_size; }
    if (req.body && req.body.page_number) { page_number = req.body.page_number; }
    console.log("Després de l'IF");
    const limit = page_size;
    const offset = page_size*(page_number-1);
    console.log("Fins i tot abans de BD");
    pool.getConnection().then(function(mysqlConnection) {
      mysqlConnection.query("SELECT * FROM rewards LIMIT " + limit + " OFFSET " + offset)
      .then((result) => {
        res
          .status(200)
          .json({rewards: result})
      })
      .catch((err) => {
        console.log("ERROR: " + JSON.stringify(err));
        handleError(err, res, "GET");
      });
    });
  });

module.exports = router
