"use strict"
const express = require('express')
const router = express.Router()
const mysql = require('promise-mysql');
const Promise = require("bluebird");
const crypto = require('crypto');

const pool  = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : '12345678',
  database : 'takemelegends'
});

function handleError(err, res, requestVerb) {
  res
    .status(500)
    .json({error: true, message: 'Error: ' +  JSON.stringify(err)})
}

function handleNoParams(res) {
  res
    .status(403)
    .json({error: true, message: 'Missing params'})
}

function authorize_appkey(appkey, mysqlConnection) {
  return new Promise(function(resolve, reject) {
    const errorJSONresponse = {error: {status_code: 401, error_description: "Unauthorized"}};
    if (!appkey) { reject(errorJSONresponse); }
    const sqlGetAppKey = "SELECT appkey FROM appkeys;";
    mysqlConnection.query(sqlGetAppKey)
    .then((resultDB) => {
      const real_hashed_appkey = resultDB[0].appkey;
      const requested_hashed_appkey = crypto.createHash('md5').update(appkey).digest("hex");
      (requested_hashed_appkey == real_hashed_appkey) ? resolve(1) : reject(errorJSONresponse);
    })
    .catch((err) => {
      reject(err);
    })
  });
}

function authorize_token(token, uid, provider, mysqlConnection) {
  return new Promise(function(resolve, reject) {
    const errorJSONresponse = {error: {status_code: 401, error_description: "Unauthorized"}};
    if (!token) { reject(errorJSONresponse); }
    const sqlGetToken = "SELECT token FROM tokens WHERE users_uid = "+uid+" AND users_provider = '"+provider+"';";
    mysqlConnection.query(sqlGetToken)
    .then((resultDB) => {
      if (!resultDB[0]) { reject(errorJSONresponse); }
      else {
        const real_hashed_token = resultDB[0]["token"];
        const requested_hashed_token = crypto.createHash('md5').update(token).digest("hex");
        (requested_hashed_token == real_hashed_token) ? resolve(1) : reject(errorJSONresponse);
      }
    })
    .catch((err) => {
      reject(err);
    })
  });
}


router

  .get('/', function(req, res, next) {
    let page_size = "20";
    let page_number = "1";
    if (req.query && req.query.page_size) { page_size = req.query.page_size; }
    if (req.query && req.query.page_number) { page_number = req.query.page_number; }
    const limit = page_size;
    const offset = page_size*(page_number-1);
    pool.getConnection().then(function(mysqlConnection) {
      authorize_appkey(req.query.appkey, mysqlConnection)
      .then((result) => {
        return mysqlConnection.query("SELECT * FROM achievements ORDER BY name ASC LIMIT " + limit + " OFFSET " + offset + " ;");
      })
      .then((result) => {
        res
          .status(200)
          .json({achievements: result})
      })
      .catch((err) => {
        handleError(err, res, "GET");
      })
      .finally(() => {
        pool.releaseConnection(mysqlConnection);
      });
    });
  })

  .get('/user', function(req, res, next) {
    if(!req.query || !req.query.uid || !req.query.provider) { handleNoParams(res); }
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
      authorize_appkey(req.query.appkey, mysqlConnection)
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
          handleError(err, res, "GET/user");
        })
        .finally(() => {
          pool.releaseConnection(mysqlConnection);
        });
      });
    }
  })

module.exports = router
