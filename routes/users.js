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
            //console.log("Table users created: " + JSON.stringify(result));
            const sqlInsertUserInDB = "INSERT INTO users values ("+user.uid+", '"+user.provider+"', '"+user.name+"', '"+user.surname+"', '"+user.email+"', 0, 0, 1);";
            console.log(sqlInsertUserInDB);
            mysqlConnection.query(sqlInsertUserInDB)
          .then((result) => {
            console.log("User inserted: " + JSON.stringify(result));
            user.takes = 0;
            user.experience = 0;
            user.level = 1;
            res
              .status(201)
              .json({user: user})
          })
          .catch((err) => {
            console.log("Error: " + JSON.stringify(err));
            res
              .status(500)
              .json({error: true, message: 'DB error: ' +  JSON.stringify(err)})
          })
          .finally(() => {
            pool.releaseConnection(mysqlConnection);
          })
        });
      }
    })

    .get('/', function(req, res, next) {
      //console.log("GET all users");
      pool.getConnection().then(function(mysqlConnection) {
        mysqlConnection.query("SELECT * FROM users")
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
        })
        .finally(() => {
          pool.releaseConnection(mysqlConnection);
        })
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
            var uid = req.params.id.split('-')[0];
            var provider = req.params.id.split('-')[1];
            const singleUserQuery = "SELECT * FROM users WHERE uid = "+uid+" AND provider = '"+provider+"'";
            mysqlConnection.query(singleUserQuery)
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
          })
          .finally(() => {
            pool.releaseConnection(mysqlConnection);
          })
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
        user.uid = parseInt(req.params.id.split('-')[0]);
        user.provider = req.params.id.split('-')[1];
        pool.getConnection().then(function(mysqlConnection) {
            var uid = req.params.id.split('-')[0];
            //console.log(uid);
            var provider = req.params.id.split('-')[1];
            //console.log(provider);
            const updateQuery = "UPDATE users SET name='"+user.name+"', surname='"+user.surname+"', email='"+user.email+"' WHERE uid="+uid+" AND provider = '"+provider+"'";
            //console.log("Query: " + updateQuery);
            mysqlConnection.query(updateQuery)
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
          })
          .finally(() => {
            pool.releaseConnection(mysqlConnection);
          })
        });
      }
    })

    .delete('/:id', function(req, res, next) {
      //console.log("DELETE:id", req.params.id)
      var uid = req.params.id.split('-')[0];
      var provider = req.params.id.split('-')[1];
      if(!req.params.id) {
        res
          .status(403)
          .json({error: true, message: 'Empty params'})
      } else {
        pool.getConnection().then(function(mysqlConnection) {
            const deleteQuery = "DELETE FROM users WHERE uid = "+uid+" AND provider = '"+provider+"'";
            //console.log(deleteQuery);
            mysqlConnection.query(deleteQuery)
          .then((result) => {
            res
              .status(200)
              .json({})
          })
          .catch((err) => {
            res
              .status(500)
              .json({error: true, message: 'DB error: ' +  JSON.stringify(err)})
          })
          .finally(() => {
            pool.releaseConnection(mysqlConnection);
          })
        });
      }
    })

module.exports = router
