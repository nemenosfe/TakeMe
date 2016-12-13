"use strict"
const express = require('express')
const router = express.Router()
const mysql = require('promise-mysql');
const rp = require('request-promise');
const Promise = require("bluebird");
const crypto = require('crypto');
const randomstring = require("randomstring");

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
        (requested_hashed_appkey == real_hashed_appkey) ? resolve(1) : reject(errorJSONresponse);
      })
      .catch((err) => {
        reject(err);
      })
  });
}

function generateRandomString(numCharacters) {
  numCharacters = numCharacters || 200;
  return randomstring.generate(numCharacters);
}

router
  .post('/', function(req, res, next) {
    if (!req.body) {
      res
        .status(403)
        .json({
          error: true,
          message: 'Empty body'
        })
    } else {
      let user = {uid: req.body.uid, provider: req.body.provider};
      user.name = req.body.name || null;
      user.surname = req.body.surname || null;
      user.email = req.body.email || null;

      pool.getConnection().then(function(mysqlConnection) {
        authorize_appkey(req.body.appkey, mysqlConnection)
          .then((result) => {
            const sql = "SELECT * FROM users u, tokens t WHERE u.uid = '"+user.uid+"' AND u.provider='"+user.provider+"';";
            return mysqlConnection.query(sql);
          })
          .then((result) => {
            user.new_user = !result[0];
            return mysqlConnection.query('START TRANSACTION');
          })
          .then((result) => {
            const sqlInsertUserInDB = "INSERT IGNORE INTO users values (" + user.uid + ", '" + user.provider + "', '" + user.name + "', '" + user.surname + "', '" + user.email + "', 0, 0, 1);";
            return mysqlConnection.query(sqlInsertUserInDB);
          })
          .then((result) => {
            user.token = generateRandomString(); // Tant si ja existia l'usuari com si no, creem un nou token de sessió
            const encryptedToken = crypto.createHash('md5').update(user.token).digest("hex");

            const sql =
              (user.new_user)
              ? "INSERT INTO tokens values ('"+encryptedToken+"', "+user.uid+", '"+user.provider+"');"
              : "UPDATE tokens SET token = '" + encryptedToken + "' WHERE users_uid = '" + user.uid + "' AND users_provider = '" + user.provider + "';";

            return mysqlConnection.query(sql);
          })
          .then((result) => {
            return mysqlConnection.query('COMMIT');
          })
          .then((result) => {
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
            handleError(err, res);
          })
          .finally(() => {
            pool.releaseConnection(mysqlConnection);
          })
      });
    }
  })

.get('/', function(req, res, next) {
  const appkey = !(!req.query) ? req.query.appkey : null;
  pool.getConnection().then(function(mysqlConnection) {
    authorize_appkey(appkey, mysqlConnection)
      .then(() => {
        return mysqlConnection.query("SELECT * FROM users")
      })
      .then((result) => {
        res
          .status(200)
          .json({
            users: result
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

.get('/:id', function(req, res, next) {
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
          const uid = req.params.id.split('-')[0];
          const provider = req.params.id.split('-')[1];
          const singleUserQuery = "SELECT * FROM users WHERE uid = " + uid + " AND provider = '" + provider + "';";
          return mysqlConnection.query(singleUserQuery);
        })
        .then((result) => {
          res
            .status(200)
            .json({
              user: result[0]
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

.put('/:id', function(req, res, next) {
  if (!req.params.id || !req.body) {
    res
      .status(403)
      .json({
        error: true,
        message: 'Empty params'
      })
  } else {
    const user = req.body;
    user.uid = parseInt(req.params.id.split('-')[0]);
    user.provider = req.params.id.split('-')[1];
    pool.getConnection().then(function(mysqlConnection) {
      authorize_appkey(req.body.appkey, mysqlConnection)
        .then(() => {
          const uid = req.params.id.split('-')[0];
          const provider = req.params.id.split('-')[1];
          const updateQuery = "UPDATE users SET name='" + user.name + "', surname='" + user.surname + "', email='" + user.email + "' WHERE uid=" + uid + " AND provider = '" + provider + "'";
          return mysqlConnection.query(updateQuery)
        })
        .then((result) => {
          res
            .status(200)
            .json({
              user: user
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

.delete('/:id', function(req, res, next) {
  const appkey = !(!req.body) ? req.body.appkey : null;
  const uid = req.params.id.split('-')[0];
  const provider = req.params.id.split('-')[1];
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
          const uid = req.params.id.split('-')[0];
          const provider = req.params.id.split('-')[1];
          const insertQuery = "INSERT INTO userspreferences values (" + uid + ", '" + provider + "', '" + preference.football + "', '" + preference.basketball + "', '" + preference.sports + "', '" + preference.music + "', '" + preference.art +
           "', '" + preference.cinema + "', '" + preference.theater + "', '" + preference.location + "', " + preference.start_hour + ", " + preference.end_hour + ", " + preference.week + ", " + preference.weekend + ");";
          return mysqlConnection.query(insertQuery)
        })
        .then((result) => {
          res
            .status(201)
            .json({
              preference: result
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
        const uid = req.params.id.split('-')[0];
        const provider = req.params.id.split('-')[1];
        return mysqlConnection.query("SELECT * FROM userspreferences WHERE uid = " + uid + " AND provider = '" + provider + "'")
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
            const uid = req.params.id.split('-')[0];
            const provider = req.params.id.split('-')[1];
          const updateQuery = "UPDATE userspreferences SET theater='" + preference.theater + "', cinema='" + preference.cinema + "', art='" + preference.art + "', music='" + preference.music + "', football='" + preference.football + "', basketball = '" + preference.basketball + "', sports='"+ preference.sports +"', location='" + preference.location+
          "', start_hour='" + preference.start_hour + "', end_hour='" + preference.end_hour + "', week='" + preference.week + "', weekend='" + preference.weekend +"' WHERE uid=" + uid + " AND provider = '" + provider + "'";
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

.delete('/:id/preferences', function(req, res, next) {
    pool.getConnection().then(function(mysqlConnection) {
        const uid = req.params.id.split('-')[0];
        const provider = req.params.id.split('-')[1];
      const deleteQuery = "DELETE FROM userspreferences WHERE uid=" + uid + " AND provider = '" + provider + "'";
      return mysqlConnection.query(deleteQuery)
    })
    .then((result) => {
      res
        .status(200)
        .json({
          message: "Preference deleted"
        })
    })
    .catch((err) => {
      handleError(err, res);
    })
    .finally(() => {
      pool.releaseConnection(mysqlConnection);
    })
})

module.exports = router
