"use strict"
const express = require('express')
const _ = require('lodash')
const router = express.Router()
const mysql = require('promise-mysql');

var pool  = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : '12345678',
  database : 'takemelegends'
});

router
  .post('/', function(req, res, next) {
    //console.log("POST events ")
    if(!req.body) {
      res
        .status(403)
        .json({error: true, message: 'Body empty'})
    }

    let _event = req.body
    _event.ID = 1 // L'ID es pot fer com AUTOICREMENT però crec que hauríem de guardar l'ID que ens envien de la API que usem.

    pool.getConnection().then(function(mysqlConnection) {
      mysqlConnection.query("CREATE TABLE IF NOT EXISTS events(ID int NOT NULL, title varchar(255) NOT NULL, description varchar(2000), PRIMARY KEY (ID));")
      .then((result) => {
        //console.log("Table events created: " + JSON.stringify(result));
        return mysqlConnection.query("INSERT INTO events SET ?", {ID: _event.ID, title: _event.title, description: _event.description});
      })
      .then((result) => {
        //console.log("Insert event done: " + JSON.stringify(result));
        res
          .status(201)
          .json({event: _event})
      })
      .catch((err) => {
        console.log("Error: " + JSON.stringify(err));
        res
          .status(500)
          .json({error: true, message: 'DB error: ' +  JSON.stringify(err)})
      });
    });

  })

  .get('/', function(req, res, next) {
    //console.log("GET events");
    pool.getConnection().then(function(mysqlConnection) {
      mysqlConnection.query("SELECT * FROM events;")
      .then((result) => {
      //console.log("Get events done: " + JSON.stringify(result));
      res
        .status(200)
        .json({events: result})
      })
      .catch((err) => {
      //console.log("Error GEEEEEET: " + JSON.stringify(err));
      res
        .status(500)
        .json({error: true, message: 'DB error: ' +  JSON.stringify(err)})
      });
    });
  })

module.exports = router
