"use strict"
const express = require('express'),
      router = express.Router(),
      Promise = require("bluebird"),

      utilsErrors = require('../utils/handleErrors'),
      utilsSecurity = require('../utils/security'),
      utilsCommon = require('../utils/common'),
      utilsDatabaseRelated = require('../utils/databaseRelated'),
      utilsUserRelated = require('../utils/userRelated'),

      pool  = utilsDatabaseRelated.getPool();



router
  .post('/', function(req, res, next) {
    if (!req.body || !req.body.uid || !req.body.provider) { utilsErrors.handleNoParams(res); }
    else {
      let user = {
        uid: req.body.uid.toString(),
        provider: req.body.provider,
        name: req.body.name || null,
        takes: 0,
        experience: 0,
        level: 1
      }

      pool.getConnection().then(function(mysqlConnection) {
        utilsSecurity.authorize_appkey(req.body.appkey, mysqlConnection)
          .then((result) => {
            const sql = `SELECT u.*,
                          EXISTS (
                            SELECT DISTINCT 1
                            FROM userspreferences
                            WHERE users_uid = '${user.uid}' AND users_provider = '${user.provider}'
                          ) AS has_preferences,
                          (
                            SELECT COUNT(DISTINCT 1)
                            FROM attendances
                            WHERE users_uid = '${user.uid}' AND users_provider = '${user.provider}'
                              AND checkin_done = 1
                          ) AS number_checkins
                        FROM users u
                        WHERE u.uid = '${user.uid}' AND u.provider = '${user.provider}';`;
            return mysqlConnection.query(sql);
          })
          .then((result) => {
            if (result.length == 0) { user.new_user = true; user.has_preferences = false; user.number_checkins = 0; }
            else {
              user.level = result[0].level;
              user.takes = result[0].takes;
              user.experience = result[0].experience;
              user.new_user = false;
              user.has_preferences = !(!result[0].has_preferences);
              user.number_checkins = result[0].number_checkins;
            }
            user.experience_of_next_level = utilsUserRelated.getNextLevelExperience(user.level + 1);
            return mysqlConnection.query('START TRANSACTION');
          })
          .then((result) => {
            const sqlInsertUserInDB = `INSERT IGNORE INTO users values ('${user.uid}', '${user.provider}', '${user.name}', 0, 0, 1);`;
            return mysqlConnection.query(sqlInsertUserInDB);
          })
          .then((result) => {
            user.token = utilsCommon.generateRandomString(); // Tant si ja existia l'usuari com si no, creem un nou token de sessió
            const encryptedToken = utilsCommon.getEncryptedInMd5(user.token),
                  sql =
                    (user.new_user)
                    ? `INSERT INTO tokens values ('${encryptedToken}', '${user.uid}', '${user.provider}');`
                    : `UPDATE tokens SET token = '${encryptedToken}' WHERE users_uid = '${user.uid}' AND users_provider = '${user.provider}';`;
            return mysqlConnection.query(sql);
          })
          .then((result) => { return mysqlConnection.query('COMMIT'); })
          .then((result) => { res.status(201).json({ user: user }) })
          .catch((err) => {
            mysqlConnection.query('ROLLBACK');
            utilsErrors.handleError(err, res);
          })
          .finally(() => { pool.releaseConnection(mysqlConnection); })
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
      .then((result) => { res.status(200).json({ users: result }) })
      .catch((err) => { utilsErrors.handleError(err, res); })
      .finally(() => { pool.releaseConnection(mysqlConnection); })
  });
})

.get('/:id', function(req, res, next) {
  const appkey = !(!req.query) ? req.query.appkey : null;
  if (!req.params.id) { utilsErrors.handleNoParams(res); }
  else {
    pool.getConnection().then(function(mysqlConnection) {
      utilsSecurity.authorize_appkey(appkey, mysqlConnection)
        .then(() => {
          const uid = req.params.id.split('-')[0],
                provider = req.params.id.split('-')[1],
                singleUserQuery =
                            `SELECT u.*,
                              EXISTS (
                                SELECT DISTINCT 1
                                FROM userspreferences
                                WHERE users_uid = '${uid}' AND users_provider = '${provider}'
                              ) AS has_preferences,
                              (
                                SELECT COUNT(DISTINCT 1)
                                FROM attendances
                                WHERE users_uid = '${uid}' AND users_provider = '${provider}'
                                  AND checkin_done = 1
                              ) AS number_checkins
                            FROM users u
                            WHERE u.uid = '${uid}' AND u.provider = '${provider}';`;
          return mysqlConnection.query(singleUserQuery);
        })
        .then((result) => {
          let response = {user: result[0]};
          response.user.experience_of_next_level = utilsUserRelated.getNextLevelExperience(result[0].level + 1);
          response.user.has_preferences = (response.user.has_preferences == 1) ? true : false;
          res.status(200).json(response)
        })
        .catch((err) => { utilsErrors.handleError(err, res); })
        .finally(() => { pool.releaseConnection(mysqlConnection); })
    });
  }
})

.put('/:id', function(req, res, next) {
  if (!req.params.id || !req.body || !req.body.name) { utilsErrors.handleNoParams(res); }
  else {
    const user = {
      uid: req.params.id.split('-')[0],
      provider: req.params.id.split('-')[1],
      name: req.body.name
    }
    pool.getConnection().then(function(mysqlConnection) {
      utilsSecurity.authorize_appkey(req.body.appkey, mysqlConnection)
        .then(() => {
          return utilsSecurity.authorize_token(req.body.token, user.uid, user.provider, mysqlConnection);
        })
        .then(() => {
          const uid = req.params.id.split('-')[0],
                provider = req.params.id.split('-')[1],
                updateQuery = `UPDATE users SET name='${user.name}' WHERE uid='${user.uid}' AND provider='${user.provider}';`;
          return mysqlConnection.query(updateQuery)
        })
        .then((result) => { res.status(200).json({ user }); })
        .catch((err) => { utilsErrors.handleError(err, res); })
        .finally(() => { pool.releaseConnection(mysqlConnection); })
    });
  }
})

.delete('/:id', function(req, res, next) {
  if (!req.params.id || !req.body) { utilsErrors.handleNoParams(res); }
  else {
    pool.getConnection().then(function(mysqlConnection) {
      const uid = req.params.id.split('-')[0],
            provider = req.params.id.split('-')[1];
      utilsSecurity.authorize_appkey(req.body.appkey, mysqlConnection)
      .then((result) => {
        return utilsSecurity.authorize_token(req.body.token, uid, provider, mysqlConnection);
      })
      .then(() => {
        const deleteQuery = "DELETE FROM users WHERE uid = '" + uid + "' AND provider = '" + provider + "'";
        return mysqlConnection.query(deleteQuery)
      })
      .then((result) => { res.status(200).json({}) })
      .catch((err) => { utilsErrors.handleError(err, res); })
      .finally(() => {   pool.releaseConnection(mysqlConnection);   })
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
        const insertQuery = `INSERT INTO userspreferences VALUES ('${uid}', '${provider}', '${categories}', '${locations}');`;
        return mysqlConnection.query(insertQuery);
      })
      .then((result) => { res.status(201).json({ preferences: {uid, provider, categories, locations} }) })
      .catch((err) => { utilsErrors.handleError(err, res); })
      .finally(() => { pool.releaseConnection(mysqlConnection); })
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
        const getQuery = "SELECT categories, locations FROM userspreferences WHERE users_uid = '" + uid + "' AND users_provider = '" + provider + "';";
        return mysqlConnection.query(getQuery);
      })
      .then((result) => {
        let categories = null, locations = null;
        if (result.length > 0) {
          categories = result[0].categories;
          locations = result[0].locations;
        }
        res.status(200).json({ preferences: { uid, provider, categories, locations} })
      })
      .catch((err) => { utilsErrors.handleError(err, res); })
      .finally(() => { pool.releaseConnection(mysqlConnection); })
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
        updateQuery += ` WHERE users_uid = '${uid}' AND users_provider = '${provider}'`;
        return mysqlConnection.query(updateQuery)
      })
      .then(() => {
        const getQuery = "SELECT categories, locations FROM userspreferences WHERE users_uid = '" + uid + "' AND users_provider = '" + provider + "';";
        return mysqlConnection.query(getQuery);
      })
      .then((result) => {
        if (result.length > 0) {
          categories = result[0].categories;
          locations = result[0].locations;
        }
        res.status(200).json({ preferences: { uid, provider, categories, locations} })
      })
      .catch((err) => { utilsErrors.handleError(err, res); })
      .finally(() => { pool.releaseConnection(mysqlConnection); })
    });
  }
})

.delete('/:id/preferences', function(req, res, next) {
  if (!req.params || !req.params.id) { utilsErrors.handleNoParams(res); }
  else {
    pool.getConnection().then(function(mysqlConnection) {
      const uid = req.params.id.split('-')[0];
      const provider = req.params.id.split('-')[1];
      utilsSecurity.authorize_appkey(req.body.appkey, mysqlConnection)
      .then((result) => {
        return utilsSecurity.authorize_token(req.body.token, uid, provider, mysqlConnection);
      })
      .then((result) => {
        const deleteQuery = "DELETE FROM userspreferences WHERE users_uid='" + uid + "' AND users_provider = '" + provider + "'";
        return mysqlConnection.query(deleteQuery);
      })
      .then((result) => { res.status(200).json({}) })
      .catch((err) => { utilsErrors.handleError(err, res); })
      .finally(() => { pool.releaseConnection(mysqlConnection); })
    })
  }
})

module.exports = router
