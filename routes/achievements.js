"use strict"
const express = require('express')
const router = express.Router()
const mysql = require('promise-mysql');
const Promise = require("bluebird");

const utilsErrors = require('../utils/handleErrors'),
      utilsSecurity = require('../utils/security');

const pool  = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : '12345678',
  database : 'takemelegends'
});

router

  .get('/', function(req, res, next) {
    let page_size = "20";
    let page_number = "1";
    if (req.query && req.query.page_size) { page_size = req.query.page_size; }
    if (req.query && req.query.page_number) { page_number = req.query.page_number; }
    const limit = page_size;
    const offset = page_size*(page_number-1);
    pool.getConnection().then(function(mysqlConnection) {
      utilsSecurity.authorize_appkey(req.query.appkey, mysqlConnection)
      .then((result) => {
        return mysqlConnection.query("SELECT * FROM achievements ORDER BY name ASC LIMIT " + limit + " OFFSET " + offset + " ;");
      })
      .then((result) => {
        res
          .status(200)
          .json({achievements: result})
      })
      .catch((err) => {
        utilsErrors.handleError(err, res, "GET");
      })
      .finally(() => {
        pool.releaseConnection(mysqlConnection);
      });
    });
  })

  .get('/user', function(req, res, next) {
    if(!req.query || !req.query.uid || !req.query.provider) { utilsErrors.handleNoParams(res); }
    else {
      let page_size = "20";
      let page_number = "1";
      if (req.query && req.query.page_size) { page_size = req.query.page_size; }
      if (req.query && req.query.page_number) { page_number = req.query.page_number; }
      const limit = page_size;
      const offset = page_size*(page_number-1);
      let achievementsResponse = {
        "total_items" : 0,
        "achievements" : []
      };

      pool.getConnection().then(function(mysqlConnection) {
      utilsSecurity.authorize_appkey(req.query.appkey, mysqlConnection)
        .then((result) => {
          const sql = "SELECT ach.id, ach.name, ach.description, ach.takes FROM achievements ach, acquisitions acq, categories cat WHERE ach.id = acq.achievements_id AND ach.category_id = cat.id AND acq.users_uid = '"+req.query.uid+"' AND acq.users_provider = '"+req.query.provider+"' ORDER BY name ASC LIMIT " + limit + " OFFSET " + offset + " ;";
          return mysqlConnection.query(sql);
        })
        .then((DBresult) => {
          achievementsResponse.total_items = DBresult.length;
          for (let index = 0; index < DBresult.length; index++) {
            let elementArray = {
              'id' : DBresult[index].id,
              'name' : DBresult[index].name,
              'description' : DBresult[index].description,
              'takes' : DBresult[index].takes
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
          utilsErrors.handleError(err, res, "GET/user");
        })
        .finally(() => {
          pool.releaseConnection(mysqlConnection);
        });
      });
    }
  })

module.exports = router
