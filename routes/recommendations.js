"use strict"
const express = require('express')
const router = express.Router()
const mysql = require('promise-mysql');
const rp = require('request-promise');
const Promise = require("bluebird");

const utilsErrors = require('../utils/handleErrors'),
      utilsSecurity = require('../utils/security');

const urlEventfulApi = "http://api.eventful.com/json/events/";
const keyEventfulApi = "KxZvhSVN3f38ct54";

var pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'takemelegends'
});

function doRequest(params, type) {
  const finalURL = urlEventfulApi + type + "/" + "?app_key=" + keyEventfulApi + "&" + params;
  let optionsRequest = {
    url: finalURL,
    method: "GET",
    json: true
  };
  return rp(optionsRequest);
}

function getRangDates() {
  const today = new Date(),
        lastDate = new Date();
  lastDate.setMonth(lastDate.getMonth() + 1);
  return `${today.getFullYear()}${today.getMonth() + 1}${today.getDate()}00`
         + "-"
         + `${lastDate.getFullYear()}${lastDate.getMonth() + 1}${lastDate.getDate()}00`;
}

function getTakesToEarnInEvent() { return Math.floor(Math.random() * 1000 + 1); } // Retorna un número aleatori del rang [1, 1000)

function findEventInDatabaseResponseByID(DBresult, id) { // Cerca binaria, PREcondició: DBresult estan ordenats per ID.
  if (DBresult.length === 0) { return -1; } // No trobat

  const mid = Math.floor(DBresult.length / 2);
  const id_db = DBresult[mid].id;

  if (id_db.toString() === id.toString()) { return mid; } // Trobat
  else if (id.toString() > id_db.toString()) { return findEventInDatabaseResponseByID(DBresult.slice(mid, DBresult.length), id); }
  else { return findEventInDatabaseResponseByID(DBresult.slice(0, mid), id); }
}

function getNumberOfAssitancesAndTakesFromDBResultByID(DBresult, id) { // PREcondició: DBresult estan ordenats per ID
  if (DBresult) {
    const pos = findEventInDatabaseResponseByID(DBresult, id);
    if (pos > -1) { return { number_attendances : DBresult[pos].number_attendances, takes : DBresult[pos].takes }; }
  }
  return { number_attendances : 0, takes : -1 };
}

function getFinalJSONOfAnEvent(eventEventful, resultDB) {
  const event_id = eventEventful["id"];
  const number_attendances_and_takes = getNumberOfAssitancesAndTakesFromDBResultByID(resultDB, event_id);
  return {
    event : {
      id : event_id,
      title : eventEventful["title"],
      description : eventEventful["description"],
      number_attendances : number_attendances_and_takes.number_attendances,
      takes : number_attendances_and_takes.takes,
      url : eventEventful["url"] || null,
      all_day :  eventEventful["all_day"],
      start_time :  eventEventful["start_time"] || null,
      stop_time :  eventEventful["stop_time"] || null,
      venue_display : eventEventful["venue_display"] || null,
      venue_id : eventEventful["venue_id"] || null,
      venue_name : eventEventful["venue_name"] || null,
      address : eventEventful["venue_address"] || eventEventful["address"] || null,
      city : eventEventful["city_name"] || eventEventful["city"] || null,
      country : eventEventful["country_name"] || eventEventful["country"] || null,
      region : eventEventful["region_name"] || eventEventful["region"] || null,
      postal_code : eventEventful["postal_code"] || null,
      latitude : eventEventful["latitude"] || null,
      longitude : eventEventful["longitude"] || null,
      images : eventEventful["image"] || eventEventful["images"] || null,
      free : eventEventful["free"] || null,
      price : eventEventful["price"] || null,
      categories : eventEventful["categories"] || null
    } // Per ara no retornem "Performers" ni "Tags" ni "Links"
  };
}

function prepareFinalResponseOfAllEventsJSON(eventsEventful, resultDB) {
  // Prepara les dades generals:
  let myEventsResponse = {
    total_items : eventsEventful.total_items,
    page_number : eventsEventful.page_number,
    page_size : eventsEventful.page_size,
    events : []
  };

  // Prepara les dades d'esdeveniments:
  for (let position = eventsEventful.page_size - 1; position >=0; position--) {
    myEventsResponse.events[position] = getFinalJSONOfAnEvent(eventsEventful.events.event[position], resultDB);
  }
  return myEventsResponse;
}


router
.get('/:id', function(req, res, next) {
  if(!req.query || !req.params || !req.params.id) { utilsErrors.handleNoParams(res); }
  else {
    pool.getConnection().then(function(mysqlConnection) {
      const uid = req.params.id.split('-')[0],
            provider = req.params.id.split('-')[1],
            rangDates = getRangDates(),
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
        return doRequest(params, "search");
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
              const takes = getTakesToEarnInEvent();
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
          const eventsResponse = prepareFinalResponseOfAllEventsJSON(eventsEventful, resultDB);
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
