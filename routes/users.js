"use strict"
const express = require('express')
const router = express.Router()
const mysql = require('promise-mysql');
const rp = require('request-promise');
const Promise = require("bluebird");
const crypto = require('crypto');


const utilsErrors = require('../utils/handleErrors'),
      utilsSecurity = require('../utils/security'),
      utilsCommon = require('../utils/common');

var pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'takemelegends'
});

function getNextLevelExperience(nextLevel) { return nextLevel * Math.log10(nextLevel); }

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
        utilsSecurity.authorize_appkey(req.body.appkey, mysqlConnection)
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
            user.token = utilsCommon.generateRandomString(); // Tant si ja existia l'usuari com si no, creem un nou token de sessió
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
            utilsErrors.handleError(err, res);
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
    utilsSecurity.authorize_appkey(appkey, mysqlConnection)
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
        utilsErrors.handleError(err, res);
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
      utilsSecurity.authorize_appkey(appkey, mysqlConnection)
        .then(() => {
          const uid = req.params.id.split('-')[0];
          const provider = req.params.id.split('-')[1];
          const singleUserQuery = "SELECT * FROM users WHERE uid = " + uid + " AND provider = '" + provider + "';";
          return mysqlConnection.query(singleUserQuery);
        })
        .then((result) => {
          const response = {user: result[0]};
          response.user.experience_of_next_level = getNextLevelExperience(result[0].level + 1);
          res
            .status(200)
            .json(response)
        })
        .catch((err) => {
          utilsErrors.handleError(err, res);
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
      utilsSecurity.authorize_appkey(req.body.appkey, mysqlConnection)
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
          utilsErrors.handleError(err, res);
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
      utilsSecurity.authorize_appkey(appkey, mysqlConnection)
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
          utilsErrors.handleError(err, res);
        })
        .finally(() => {
          pool.releaseConnection(mysqlConnection);
        })
    });
  }
})

.post('/:id/preferences', function(req, res, next) {
  if (!req.body || (!req.body.categories && !req.body.locations) || !req.params.id) { utilsErrors.handleNoParams(res); }
  else {
    pool.getConnection().then(function(mysqlConnection) {
      const uid = req.params.id.split('-')[0];
      const provider = req.params.id.split('-')[1];
      const categories = req.body.categories || null;
      const locations = req.body.locations || null;
      utilsSecurity.authorize_appkey(req.body.appkey, mysqlConnection)
      .then((result) => {
        return utilsSecurity.authorize_token(req.body.token, uid, provider, mysqlConnection);
      })
      .then(() => {
        const insertQuery = `INSERT INTO userspreferences VALUES (${uid}, '${provider}', '${categories}', '${locations}');`;
        return mysqlConnection.query(insertQuery);
      })
      .then((result) => {
        res
          .status(201)
          .json({ preferences: {uid, provider, categories, locations} })
      })
      .catch((err) => {
        console.log("ERROR: " + JSON.stringify(err));
        utilsErrors.handleError(err, res);
      })
      .finally(() => {
        pool.releaseConnection(mysqlConnection);
      })
    });
  }
})

.get('/:id/preferences', function(req, res, next) {
  if (!req.params || !req.params.id) { utilsErrors.handleNoParams(res); }
  else {
    const appkey = !(!req.query) ? req.query.appkey : null;
    const uid = req.params.id.split('-')[0];
    const provider = req.params.id.split('-')[1];
    pool.getConnection().then(function(mysqlConnection) {
      utilsSecurity.authorize_appkey(appkey, mysqlConnection)
      .then((result) => {
        return utilsSecurity.authorize_token(req.query.token, uid, provider, mysqlConnection);
      })
      .then(() => {
        const getQuery = "SELECT categories, locations FROM userspreferences WHERE users_uid = " + uid + " AND users_provider = '" + provider + "';";
        return mysqlConnection.query(getQuery);
      })
      .then((result) => {
        let categories = null, locations = null;
        if (result.length > 0) {
          categories = result[0].categories;
          locations = result[0].locations;
        }
        res
          .status(200)
          .json({ preferences: { uid, provider, categories, locations} })
      })
      .catch((err) => {
        console.log("ERROR: " + JSON.stringify(err));
        utilsErrors.handleError(err, res);
      })
      .finally(() => {
        pool.releaseConnection(mysqlConnection);
      })
    });
  }
})

.put('/:id/preferences', function(req, res, next) {
  if (!req.body || (!req.body.categories && !req.body.locations) || !req.params.id) { utilsErrors.handleNoParams(res); }
  else {
    const uid = req.params.id.split('-')[0];
    const provider = req.params.id.split('-')[1];
    let categories = req.body.categories || null;
    let locations = req.body.locations || null;
    pool.getConnection().then(function(mysqlConnection) {
      utilsSecurity.authorize_appkey(req.body.appkey, mysqlConnection)
      .then((result) => {
        return utilsSecurity.authorize_token(req.body.token, uid, provider, mysqlConnection);
      })
      .then(() => {
        let updateQuery = "UPDATE userspreferences SET ";
        if (categories) {
          updateQuery += `categories='${categories}'`;
          if (locations) { updateQuery += `, locations='${locations}'`; }
        } else { updateQuery += `locations='${locations}'`; }
        updateQuery += ` WHERE users_uid = ${uid} AND users_provider = '${provider}'`;
        return mysqlConnection.query(updateQuery)
      })
      .then(() => {
        const getQuery = "SELECT categories, locations FROM userspreferences WHERE users_uid = " + uid + " AND users_provider = '" + provider + "';";
        return mysqlConnection.query(getQuery);
      })
      .then((result) => {
        if (result.length > 0) {
          categories = result[0].categories;
          locations = result[0].locations;
        }
        res
          .status(200)
          .json({ preferences: { uid, provider, categories, locations} })
      })
      .catch((err) => {
        console.log("ERROR: " + JSON.stringify(err));
        utilsErrors.handleError(err, res);
      })
      .finally(() => {
        pool.releaseConnection(mysqlConnection);
      })
    });
  }
})

.delete('/:id/preferences', function(req, res, next) {
  if (!req.params || !req.params.id) { utilsErrors.handleNoParams(res); }
  else {
    pool.getConnection().then(function(mysqlConnection) {
      const uid = req.params.id.split('-')[0];
      const provider = req.params.id.split('-')[1];
      utilsSecurity.authorize_token(req.body.token, uid, provider, mysqlConnection)
      .then((result) => {
        const deleteQuery = "DELETE FROM userspreferences WHERE users_uid=" + uid + " AND users_provider = '" + provider + "'";
        return mysqlConnection.query(deleteQuery);
      })
      .then((result) => {
        res
          .status(200)
          .json({})
      })
      .catch((err) => {
        console.log("ERROR: " + JSON.stringify(err));
        utilsErrors.handleError(err, res);
      })
      .finally(() => {
        pool.releaseConnection(mysqlConnection);
      })
    })
  }
})

module.exports = router
