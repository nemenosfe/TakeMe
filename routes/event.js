"use strict"
const express = require('express')
const _ = require('lodash')
const router = express.Router()
const mysql = require('mysql');

var pool  = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : '12345678',
  database : 'takemelegends'
});

router
  .post('/', function(req, res, next) {
    console.log("POST: ", req.body)
    if(!req.body) {
      console.log("No hi ha body :(")
      res
        .status(403)
        .json({error: true, message: 'Body empty'})
    }

    let _event = req.body
    _event._id = 1 // L'ID es pot fer com AUTOICREMENT però crec que hauríem de guardar l'ID que ens envien de la API que usem.

    pool.getConnection(function(err, mysqlConnection) {
      mysqlConnection.query("CREATE TABLE IF NOT EXISTS events(ID int NOT NULL, title varchar(255) NOT NULL, description varchar(2000), PRIMARY KEY (ID));", function(err, result) {
        if (!err) {
          console.log("Table events created: " + JSON.stringify(result));
          mysqlConnection.query("INSERT INTO events SET ?", {id: _event._id, title: _event.title, description: _event.description}, function(err, result) {
            if (!err) {
              console.log("Insert event done: " + JSON.stringify(result));
              res
                .status(201)
                .json({event: _event})
            } else {
              console.log("Error: " + JSON.stringify(err));
              res
                .status(500)
                .json({error: true, message: 'DB error: ' +  JSON.stringify(err)})
            }
            mysqlConnection.release();
          });
        } else {
          console.log("Error: " + JSON.stringify(err));
          res
            .status(500)
            .json({error: true, message: 'DB error: ' +  JSON.stringify(err)})
        }
      });
    });

  })

module.exports = router
