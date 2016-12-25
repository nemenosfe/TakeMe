"use strict"
const express = require('express')
const router = express.Router()
const mysql = require('promise-mysql');
const Promise = require("bluebird");

const utilsErrors = require('../utils/handleErrors'),
      utilsSecurity = require('../utils/security'),
      utilsEventRelated = require('../utils/eventRelated');

var pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'takemelegends'
});

router
.get('/:id', function(req, res, next) {
  if(!req.query || !req.params || !req.params.id) { utilsErrors.handleNoParams(res); }
  else {
    pool.getConnection().then(function(mysqlConnection) {
      const uid = req.params.id.split('-')[0],
            provider = req.params.id.split('-')[1],
            rangDates = utilsEventRelated.getRangDates(),
            page_size = req.query.page_size || "20",
            page_number = req.query.page_number || "1";
      let categories = null,
          locations = null,
          eventsEventful = null;
      utilsSecurity.authorize_appkey(req.query.appkey, mysqlConnection)
      .then((result) => {
        return utilsSecurity.authorize_token(req.query.token, uid, provider, mysqlConnection);
      })
      .then(() => {
        const sqlQuery = "SELECT categories, locations FROM userspreferences"
                       + ` WHERE users_uid = ${uid} AND users_provider = '${provider}';`;
        return mysqlConnection.query(sqlQuery);
      })
      .then((result) => {
        if (result.length > 0) {
          categories = result[0].categories;
          locations = result[0].locations;
        }
        let params = `sort_order=date&page_size=${page_size}&page_number=${page_number}&include=categories`
                   + `&date=${rangDates}`;
        if (categories) { params += `&categories=${categories}`; }
        if (locations) { params += `&locations=${locations}`; }
        return utilsEventRelated.doRequest(params, "search");
      })
      .then((eventsResEventful) => {
        return new Promise(function(resolve, reject) {
          if (eventsResEventful.error) {
            reject(eventsResEventful.error);
          } else {
            eventsEventful = eventsResEventful;
            let responses = [];
            for (let index = eventsResEventful.events.event.length - 1; index >=0; index--) {
              let start = null, stop = null;
              if (eventsResEventful.events.event[index].start_time != null) { start = "'"+eventsResEventful.events.event[index].start_time+"'"; }
              if (eventsResEventful.events.event[index].stop_time != null) { stop = "'"+eventsResEventful.events.event[index].stop_time+"'"; }
              const takes = utilsEventRelated.getTakesToEarnInEvent();
              const sqlInsertEventInDB = "INSERT IGNORE INTO events values ('"
                    + eventsResEventful.events.event[index].id + "', "
                    + eventsResEventful.events.event[index].all_day + ", "
                    + start + ", " + stop + ", 0, " + takes + ");";
              responses.push( mysqlConnection.query(sqlInsertEventInDB) );
            }
            resolve(Promise.all(responses));
          }
        });
      })
      .then((result) => {
        return new Promise(function(resolve, reject) {
          let ids = [];
          for (let index = eventsEventful.events.event.length - 1; index >=0; index--) {
            ids.push("'" + eventsEventful.events.event[index].id + "'");
          }
          const sql = "SELECT id, number_attendances, takes FROM events WHERE id IN ("+ids+") ORDER BY id;"; // No ho puc ordernar per data per fer més fàcil la cerca després perquè moltíssimes vegades venen dades que faríen que no funcionés.
          resolve(mysqlConnection.query(sql));
        });
      })
      .then((resultDB) => {
        return new Promise(function(resolve, reject) {
          const eventsResponse = utilsEventRelated.prepareFinalResponseOfAllEventsJSON(eventsEventful, resultDB);
          resolve(eventsResponse);
        });
      })
      .then((eventsResponse) => {
        res
          .status(200)
          .json(eventsResponse)
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

module.exports = router
