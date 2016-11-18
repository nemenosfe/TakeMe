"use strict"
const express = require('express')
const router = express.Router()
const mysql = require('promise-mysql');
const rp = require('request-promise');
const Promise = require("bluebird");
const crypto = require('crypto');

var pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'takemelegends'
});

function handleError(err, res) {
  if (err.error && err.error.status_code) {
    res
      .status(err.error.status_code)
      .json({
        error: true,
        message: err.error.error_description
      })
  } else {
    res
      .status(500)
      .json({
        error: true,
        message: 'Error: ' + JSON.stringify(err)
      })
  }
}

function handleNoParams(res) {
  const errorJSONresponse = {
    error: {
      status_code: 403,
      error_description: 'Missing params'
    }
  }
  handleError(errorJSONresponse, res);
}

function authorize_appkey(appkey, mysqlConnection) {
  return new Promise(function(resolve, reject) {
    const errorJSONresponse = {
      error: {
        status_code: 401,
        error_description: "Unauthorized"
      }
    };
    if (!appkey) {
      reject(errorJSONresponse);
    }
    const sqlGetAppKey = "SELECT appkey FROM appkeys;";
    mysqlConnection.query(sqlGetAppKey)
      .then((resultDB) => {
        const real_hashed_appkey = resultDB[0].appkey;
        const requested_hashed_appkey = crypto.createHash('md5').update(appkey).digest("hex");
        if (requested_hashed_appkey == real_hashed_appkey) {
          resolve(1);
        } else {
          reject(errorJSONresponse);
        }
      })
      .catch((err) => {
        reject(err);
      })
  });
}

router
  .post('/', function(req, res, next) {
    //console.log("POST a new user")
    if (!req.body) {
      res
        .status(403)
        .json({
          error: true,
          message: 'Empty body'
        })
    } else {
      let user = req.body

      pool.getConnection().then(function(mysqlConnection) {
        authorize_appkey(req.body.appkey, mysqlConnection)
          .then(() => {
            //console.log("Table users created: " + JSON.stringify(result));
            const sqlInsertUserInDB = "INSERT INTO users values (" + user.uid + ", '" + user.provider + "', '" + user.name + "', '" + user.surname + "', '" + user.email + "', 0, 0, 1);";
            //console.log(sqlInsertUserInDB);
            return mysqlConnection.query(sqlInsertUserInDB);
          })
          .then((result) => {
            //console.log("User inserted: " + JSON.stringify(result));
            user.takes = 0;
            user.experience = 0;
            user.level = 1;
            res
              .status(201)
              .json({
                user: user
              })
          })
          .catch((err) => {
            //console.log("Error: " + JSON.stringify(err));
            res
              .status(500)
              .json({
                error: true,
                message: 'DB error: ' + JSON.stringify(err)
              })
          })
          .finally(() => {
            pool.releaseConnection(mysqlConnection);
          })
      });
    }
  })

.get('/', function(req, res, next) {
  //console.log("GET all users");
  const appkey = !(!req.query) ? req.query.appkey : null;
  pool.getConnection().then(function(mysqlConnection) {
    authorize_appkey(appkey, mysqlConnection)
      .then(() => {
        return mysqlConnection.query("SELECT * FROM users")
      })
      .then((result) => {
        //console.log("Get users done: " + JSON.stringify(result));
        res
          .status(200)
          .json({
            users: result
          })
      })
      .catch((err) => {
        //console.log("Error while getting all users: " + JSON.stringify(err));
        res
          .status(500)
          .json({
            error: true,
            message: 'DB error: ' + JSON.stringify(err)
          })
      })
      .finally(() => {
        pool.releaseConnection(mysqlConnection);
      })
  });
})

.get('/:id', function(req, res, next) {
  //console.log('Get user with id: ', req.params.id)
  const appkey = !(!req.query) ? req.query.appkey : null;
  if (!req.params.id) {
    res
      .status(403)
      .json({
        error: true,
        message: 'Empty parameters'
      })
  } else {
    pool.getConnection().then(function(mysqlConnection) {
      authorize_appkey(appkey, mysqlConnection)
        .then(() => {
          var uid = req.params.id.split('-')[0];
          var provider = req.params.id.split('-')[1];
          const singleUserQuery = "SELECT * FROM users WHERE uid = " + uid + " AND provider = '" + provider + "'";
          return mysqlConnection.query(singleUserQuery)
        })
        .then((result) => {
          //console.log("Get user done: " + JSON.stringify(result));
          res
            .status(200)
            .json({
              user: result[0]
            })
        })
        .catch((err) => {
          //console.log("Error while getting single user: " + JSON.stringify(err));
          res
            .status(500)
            .json({
              error: true,
              message: 'DB error: ' + JSON.stringify(err)
            })
        })
        .finally(() => {
          pool.releaseConnection(mysqlConnection);
        })
    });
  }
})

.put('/:id', function(req, res, next) {
  //console.log("PUT:id", req.params.id)
  if (!req.params.id || !req.body) {
    res
      .status(403)
      .json({
        error: true,
        message: 'Empty params'
      })
  } else {
    //console.log("REQ.BODY: " + JSON.stringify(req.body));
    const user = req.body;
    user.uid = parseInt(req.params.id.split('-')[0]);
    user.provider = req.params.id.split('-')[1];
    pool.getConnection().then(function(mysqlConnection) {
      authorize_appkey(req.body.appkey, mysqlConnection)
        .then(() => {
          var uid = req.params.id.split('-')[0];
          //console.log(uid);
          var provider = req.params.id.split('-')[1];
          //console.log(provider);
          const updateQuery = "UPDATE users SET name='" + user.name + "', surname='" + user.surname + "', email='" + user.email + "' WHERE uid=" + uid + " AND provider = '" + provider + "'";
          //console.log("Query: " + updateQuery);
          return mysqlConnection.query(updateQuery)
        })
        .then((result) => {
          //console.log("PUT events done: " + JSON.stringify(result));
          res
            .status(200)
            .json({
              user: user
            })
        })
        .catch((err) => {
          //console.log("Error PUT: " + JSON.stringify(err));
          res
            .status(500)
            .json({
              error: true,
              message: 'DB error: ' + JSON.stringify(err)
            })
        })
        .finally(() => {
          pool.releaseConnection(mysqlConnection);
        })
    });
  }
})

.delete('/:id', function(req, res, next) {
  //console.log("DELETE:id", req.params.id)
  const appkey = !(!req.body) ? req.body.appkey : null;
  var uid = req.params.id.split('-')[0];
  var provider = req.params.id.split('-')[1];
  if (!req.params.id) {
    res
      .status(403)
      .json({
        error: true,
        message: 'Empty params'
      })
  } else {
    pool.getConnection().then(function(mysqlConnection) {
      authorize_appkey(appkey, mysqlConnection)
        .then(() => {
          const deleteQuery = "DELETE FROM users WHERE uid = " + uid + " AND provider = '" + provider + "'";
          //console.log(deleteQuery);
          return mysqlConnection.query(deleteQuery)
        })
        .then((result) => {
          res
            .status(200)
            .json({})
        })
        .catch((err) => {
          handleError(err, res);
        })
        .finally(() => {
          pool.releaseConnection(mysqlConnection);
        })
    });
  }
})

.post('/:id/preferences', function(req, res, next) {
  if (!req.body) {
    res
      .status(403)
      .json({
        error: true,
        message: 'Empty body'
      })
  } else {
    let preference = req.body
    pool.getConnection().then(function(mysqlConnection) {
      authorize_appkey(req.body.appkey, mysqlConnection)
        .then(() => {
          const insertQuery = "INSERT INTO userPreferences values (" + preference.uid + ", '" + preference.provider + "', '" + preference.categories + "', '" + preference.locations + "', " + preference.start_hour + ", " + preference.end_hour + ", " + preference.week + ", " + preference.weekend + ");";
          //console.log(insertQuery);
          return mysqlConnection.query(insertQuery)
        })
        .then((result) => {
          res
            .status(201)
            .json({
              preference: preference
            })
        })
        .catch((err) => {
          handleError(err, res);
        })
        .finally(() => {
          pool.releaseConnection(mysqlConnection);
        })
    });
  }
})

.get('/:id/preferences', function(req, res, next) {
  const appkey = !(!req.query) ? req.query.appkey : null;
  pool.getConnection().then(function(mysqlConnection) {
    authorize_appkey(appkey, mysqlConnection)
      .then(() => {
        var uid = req.params.id.split('-')[0];
        var provider = req.params.id.split('-')[1];
        return mysqlConnection.query("SELECT * FROM userPreferences WHERE uid = " + uid + " AND provider = '" + provider + "'")
      })
      .then((result) => {
        res
          .status(200)
          .json({
            preferences: result
          })
      })
      .catch((err) => {
        handleError(err, res);
      })
      .finally(() => {
        pool.releaseConnection(mysqlConnection);
      })
  });
})

.put('/:id/preferences', function(req, res, next) {
  if (!req.body) {
    res
      .status(403)
      .json({
        error: true,
        message: 'Empty body'
      })
  } else {
    let preference = req.body
    pool.getConnection().then(function(mysqlConnection) {
      authorize_appkey(req.body.appkey, mysqlConnection)
        .then(() => {
          const updateQuery = "UPDATE userPreferences SET categories='" + preference.categories + "', locations='" + preference.locations + "', start_hour='" + preference.start_hour + "', end_hour='" + preference.end_hour + "', week='" + preference.week + "', weekend='" + preference.weekend + "' WHERE uid=" + uid + " AND provider = '" + provider + "'";
          //console.log(updateQuery);
          return mysqlConnection.query(updateQuery)
        })
        .then((result) => {
          res
            .status(200)
            .json({
              message: "Preference updated"
            })
        })
        .catch((err) => {
          handleError(err, res);
        })
        .finally(() => {
          pool.releaseConnection(mysqlConnection);
        })
    });
  }
})

module.exports = router
