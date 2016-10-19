"use strict"
const express = require('express')
const router = express.Router()
const mysql = require('promise-mysql');
const rp = require('request-promise');

var pool  = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : '12345678',
  database : 'takemelegends'
});

router
    .post('/', function(req, res, next) {
      //console.log("POST a new user")
      if(!req.body) {
        res
          .status(403)
          .json({error: true, message: 'Empty body'})
      } else {
        let user = req.body

        pool.getConnection().then(function(mysqlConnection) {
          mysqlConnection.query("CREATE TABLE IF NOT EXISTS users(id int NOT NULL, provider varchar(255) NOT NULL, name varchar(30) NOT NULL, surname varchar(30), PRIMARY KEY (ID));")
          .then((result) => {
            //console.log("Table users created: " + JSON.stringify(result));
            return mysqlConnection.query("INSERT INTO users SET ?", {id: user.uid, provider: user.provider, name: user.name, surname: user.surname});
          })
          .then((result) => {
            //console.log("User inserted: " + JSON.stringify(result));
            res
              .status(201)
              .json({user: user})
          })
          .catch((err) => {
            console.log("Error: " + JSON.stringify(err));
            res
              .status(500)
              .json({error: true, message: 'DB error: ' +  JSON.stringify(err)})
          });
        });
      }
    })

    .get('/', function(req, res, next) {
      //console.log("GET all users");
      pool.getConnection().then(function(mysqlConnection) {
        mysqlConnection.query("SELECT * FROM users;")
        .then((result) => {
          //console.log("Get users done: " + JSON.stringify(result));
          res
            .status(200)
            .json({users: result})
        })
        .catch((err) => {
          //console.log("Error while getting all users: " + JSON.stringify(err));
          res
            .status(500)
            .json({error: true, message: 'DB error: ' +  JSON.stringify(err)})
        });
      });
    })

    .get('/:id', function(req, res, next) {
      //console.log('Get user with id: ', req.params.id)
      if(!req.params.id) {
        res
          .status(403)
          .json({error: true, message: 'Empty parameters'})
      } else {
        pool.getConnection().then(function(mysqlConnection) {
          mysqlConnection.query("SELECT * FROM users WHERE id = ?;", req.params.id)
          .then((result) => {
            //console.log("Get user done: " + JSON.stringify(result));
            res
              .status(200)
              .json({user: result[0]})
          })
          .catch((err) => {
            //console.log("Error while getting single user: " + JSON.stringify(err));
            res
              .status(500)
              .json({error: true, message: 'DB error: ' +  JSON.stringify(err)})
          });
        });
      }
    })

    .put('/:id', function(req, res, next) {
      //console.log("PUT:id", req.params.id)
      if(!req.params.id || !req.body) {
        res
          .status(403)
          .json({error: true, message: 'Empty params'})
      } else {
        //console.log("REQ.BODY: " + JSON.stringify(req.body));
        const user = req.body;
        pool.getConnection().then(function(mysqlConnection) {
          mysqlConnection.query("UPDATE users SET name='"+user.name+"', surname='"+user.surname+"' WHERE id = ?;", req.params.id)
          .then((result) => {
            //console.log("PUT events done: " + JSON.stringify(result));
            res
              .status(200)
              .json({user: user})
          })
          .catch((err) => {
            //console.log("Error PUT: " + JSON.stringify(err));
            res
              .status(500)
              .json({error: true, message: 'DB error: ' +  JSON.stringify(err)})
          });
        });
      }
    })

    .delete('/:id', function(req, res, next) {
      console.log("DELETE:id", req.params.id)
      if(!req.params.id) {
        res
          .status(403)
          .json({error: true, message: 'Empty params'})
      } else {
        pool.getConnection().then(function(mysqlConnection) {
          mysqlConnection.query("DELETE FROM users WHERE id = ?;", req.params.id)
          .then((result) => {
            res
              .status(200)
              .json({})
          })
          .catch((err) => {
            res
              .status(500)
              .json({error: true, message: 'DB error: ' +  JSON.stringify(err)})
          });
        });
      }
    })

module.exports = router
