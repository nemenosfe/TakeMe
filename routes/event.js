"use strict"
const express = require('express')
const router = express.Router()
const rp = require('request-promise');
const mysql = require('promise-mysql');
const Promise = require("bluebird");

const urlEventfulApi = "http://api.eventful.com/json/events/";
const keyEventfulApi = "KxZvhSVN3f38ct54";

const pool  = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : '12345678',
  database : 'takemelegends'
});

function handleError(err, res, requestVerb) {
  if (err.error && err.error.status_code && err.error.status_code == 403) {
    res
      .status(err.error.status_code)
      .json({error: true, message: err.error.error_description})
  } else {
    res
      .status(500)
      .json({error: true, message: 'Error: ' +  JSON.stringify(err)})
  }
}

function handleNoParams(res) {
  res
    .status(403)
    .json({error: true, message: 'Missing params'})
}

function doRequest(params, type) {
  const finalURL = urlEventfulApi + type + "/" + "?app_key=" + keyEventfulApi + "&" + params;
  let optionsRequest = {
    url: finalURL,
    method: "GET",
    json: true
  };
  return rp(optionsRequest);
}

function addZero(str) {
  return str < 10 ? ('0' + str) : str;
}

function getFormattedDateTimeNow() {
  const currentdate = new Date();
  return  addZero(currentdate.getFullYear()) + "-" +
          addZero(currentdate.getMonth()+1)  + "-"+
          addZero(currentdate.getDate()) + " "  +
          addZero(currentdate.getHours()) + ":"   +
          addZero(currentdate.getMinutes()) + ":" +
          addZero(currentdate.getSeconds());
}

function getMoment(datetime_start, all_day, datetime_stop) { // Dono per suposat que stop_time és més tard que start_time si cap dels 2 val null
  const now = getFormattedDateTimeNow();
  if (datetime_start == null || all_day == 2) { return "future"; } // Si encara no sabem la data en que comença és que l'esdeveniment és futur.
  if (datetime_start < now) {
    if (datetime_stop > now) { return "present"; }
    else { return "past"; }
  }
  return "future"; // Si no es compleix cap dels anteriors vol dir que start_time és futur
}

function findEventInEventfulResponseByID(eventsEventful, id) { // No puc fer cerca binaria perquè estan ordenats "per data" (més o menys) i estic buscant per id
  for (let j = eventsEventful.events.event.length - 1; j >=0; j--) {
    if (eventsEventful.events.event[j].id == id) return j;
  }
}

function addNumberAttendancesToAllEventsJSON(eventsEventful, resultDB) {
  for (let pos = resultDB.length - 1; pos >=0; pos--) {
    const position = findEventInEventfulResponseByID(eventsEventful, resultDB[pos].id);
    eventsEventful.events.event[position]["number_attendances"] = resultDB[pos].number_attendances;
  }
}


router

  .get('/', function(req, res, next) {
    if( !req.body || (!req.body.location && !req.body.keywords && !req.body.category && !req.body.date) ) { handleNoParams(res); }
    else {
      pool.getConnection().then(function(mysqlConnection) {
        let eventsResponse = null;
        let page_size = "10";
        let page_number = "1";
        if (req.body.page_size) { page_size = req.body.page_size; }
        if (req.body.page_number) { page_number = req.body.page_number; }
        let params = "sort_order=date&page_size="+page_size+"&page_number="+page_number;
        if (req.body.location) {
          params = params + "&location=" + req.body.location;
          let within = 350;
          if (req.body.within) {
            within = req.body.within;
          }
          params = params + "&units=km&within=" + within;
        }
        if (req.body.keywords) { params = params + "&keywords=" + req.body.keywords; }
        if (req.body.category) { params = params + "&category=" + req.body.category; }
        if (req.body.date) { params = params + "&date=" + req.body.date; }
        doRequest(params, "search")
        .then((eventsResEventful) => {
          return new Promise(function(resolve, reject) {
            let ids = [];
            if (eventsResEventful.error) {
              reject(eventsResEventful.error);
            } else {
              eventsResponse = eventsResEventful;
              for (let index = eventsResEventful.events.event.length - 1; index >=0; index--) {
                eventsResEventful.events.event[index]["number_attendances"] = 0;
                ids.push("'" + eventsResEventful.events.event[index].id + "'");
              }
              const sql = "SELECT id, number_attendances FROM events WHERE id IN ("+ids+") ;"; // No ho puc ordernar per data per fer més fàcil la cerca després perquè moltíssimes vegades venen dades que faríen que no funcionés.
              const resultDB = mysqlConnection.query(sql);
              resolve(resultDB);
            }
          });
        })
        .then((resultDB) => {
          return new Promise(function(resolve, reject) {
            resolve(addNumberAttendancesToAllEventsJSON(eventsResponse, resultDB));
          });
        })
        .then((result) => {
          res
            .status(200)
            .json(eventsResponse)
        })
        .catch((err) => {
          handleError(err, res, "GET");
        })
        .finally(() => {
          pool.releaseConnection(mysqlConnection);
        })
      });
    }
  })

  .get('/user', function(req, res, next) {
    if(!req.body || !req.body.uid || !req.body.provider) { handleNoParams(res); }
    else {
      let page_size = "20";
      let page_number = "1";
      if (req.body && req.body.page_size) { page_size = req.body.page_size; }
      if (req.body && req.body.page_number) { page_number = req.body.page_number; }
      const limit = page_size;
      const offset = page_size*(page_number-1);
      let eventsResponse = {
        "total_items" : 0,
        "past" : {
          "events" : []
        },
        "present" : {
          "events" : []
        },
        "future" : {
          "events" : []
        }
      };
      const requiredData = [
          'title', 'description', 'url', 'all_day', 'start_time', 'stop_time',
          'venue_display', 'venue_id', 'venue_name', 'address',
          'city', 'country', 'region', 'postal_code', 'latitude', 'longitude',
          'images', 'performers', 'categories', 'tags', 'links', 'free', 'price'
      ];
      let database_result = null;

      pool.getConnection().then(function(mysqlConnection) {
      const sql = "SELECT at.events_id, at.checkin_done, DATE_FORMAT(ev.start_time, '%Y-%l-%d %H:%m:%s') AS start, DATE_FORMAT(ev.stop_time, '%Y-%l-%d %H:%m:%s') AS stop, ev.all_day, ev.number_attendances FROM attendances at, events ev WHERE ev.id = at.events_id AND at.users_uid = " + req.body.uid + " AND at.users_provider='" + req.body.provider + "' ORDER BY ISNULL(ev.start_time), ev.start_time ASC, ev.all_day ASC, ISNULL(ev.stop_time), ev.stop_time ASC, at.events_id ASC LIMIT " + limit + " OFFSET  " + offset + " ;";
      mysqlConnection.query(sql)
        .then((DBresult) => {
          database_result = DBresult;
          eventsResponse.total_items = DBresult.length;
          let responses = [];
          for (let index = 0; index < DBresult.length; index++) {
            const params = "id=" + DBresult[index].events_id;
            responses.push(doRequest(params, "get"));
          }
          return Promise.all(responses);
        })
        .then((eventResEventful) => {
          let moment = "past";
          for (let index = 0; index < eventResEventful.length; index++) {
            if (moment != "future") { moment = getMoment(database_result[index].start, database_result[index].all_day, database_result[index].stop); }
            let elementArray = {
              'id' : database_result[index].events_id,
              'checkin_done' : database_result[index].checkin_done,
              'number_attendances' : database_result[index].number_attendances
            };
            requiredData.forEach(function(data) {
              let value = eventResEventful[index][data];
              elementArray[data] = value;
            });
            eventsResponse[moment]["events"][index] = {
              'event' : elementArray
            };
          }

          res
            .status(200)
            .json(eventsResponse)
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

  .post('/user', function(req, res, next) {
    if(!req.body || !req.body.uid || !req.body.provider || !req.body.event_id) { handleNoParams(res); }
    else {
      const attendanceRequest = req.body;

      pool.getConnection().then(function(mysqlConnection) {
        const sqlEventInDB = "SELECT COUNT(id) AS event_exists FROM events WHERE id='"+req.body.event_id+"';";
        mysqlConnection.query(sqlEventInDB)
        .then((result) => {
          // Si no tenim l'esdeveniment a la nostra BD, el demanem a Eventful
          if (result[0].event_exists == '1') {
            return new Promise(function (fulfill, reject){
              fulfill(1);
            });
          }
          else {
            const params = "id=" + req.body.event_id;
            return doRequest(params, "get");
          }
        })
        .then((result) => {
          // Si no tenim l'esdeveniment a la nostra BD, el guardem
          if ( result == 1) {
            return new Promise(function (fulfill, reject){
              fulfill(1);
            });
          }
          else {
            let start = null;
            let stop = null;
            if (result.start_time != null) { start = "'"+result.start_time+"'"; }
            if (result.stop_time != null) { stop = "'"+result.stop_time+"'"; }
            const sqlInsertEventInDB = "INSERT INTO events values ('"+req.body.event_id+"', "+result.all_day+", "+start+", "+stop+", 0);";
            return mysqlConnection.query(sqlInsertEventInDB);
          }
        })
        .then((result) => { // Inserta l'assitencia
        const sqlInsertAttendanceInDB = "INSERT IGNORE INTO attendances values ('"+req.body.event_id+"', '"+req.body.uid+"', '"+req.body.provider+"', false);";
        return mysqlConnection.query(sqlInsertAttendanceInDB);
        })
        .then((result) => { // Fa el Response bo :)
          const attendanceResponse = {
            'event_id' : req.body.event_id,
            'uid' : req.body.uid,
            'provider' : req.body.provider,
            'checkin_done' : '0'
          };
          res
            .status(201)
            .json({ attendance: attendanceResponse });
        })
        .catch((err) => {
          handleError(err, res, "POST/user");
        })
        .finally(() => {
          pool.releaseConnection(mysqlConnection);
        });
      });
    }
  })

  .put('/:id/user', function(req, res, next) {
    if(!req.body || !req.body.uid || !req.body.provider || !req.params.id || !req.body.checkin_done) { handleNoParams(res); }
    else {
      const attendanceRequest = req.body;
      pool.getConnection().then(function(mysqlConnection) {
        const sql = "UPDATE attendances SET checkin_done=true WHERE events_id='"+req.params.id+"' AND users_uid='"+req.body.uid+"' AND users_provider='"+req.body.provider+"';";
        mysqlConnection.query(sql)
        .then((result) => { // Fa el Response bo :)
          const attendanceResponse = {
            'event_id' : req.params.id,
            'uid' : req.body.uid,
            'provider' : req.body.provider,
            'checkin_done' : '1'
          };
          res
            .status(200)
            .json({ attendance: attendanceResponse });
        })
        .catch((err) => {
          handleError(err, res, "PUT/:id/user");
        })
        .finally(() => {
          pool.releaseConnection(mysqlConnection);
        });
      });
    }
  })

  .delete('/:id/user', function(req, res, next) {
    if(!req.body || !req.body.uid || !req.body.provider || !req.params.id) {  handleNoParams(res); }
    else {
      pool.getConnection().then(function(mysqlConnection) {
        const sql = "SELECT checkin_done FROM attendances WHERE events_id = '"+req.params.id+"' AND users_uid = '"+req.body.uid+"' AND users_provider = '"+req.body.provider+"' ;";
        mysqlConnection.query(sql)
        .then((result) => {
          return new Promise(function(resolve, reject) {
            if (result.length == 0) {
              resolve("No cal eliminar res perquè no existeix");
            }
            else if (result[0].checkin_done) {
              reject("No es pot desmarcar l'assitència si ja s'ha fet el check-in");
            } else {
              const sql = "DELETE FROM attendances WHERE events_id = '"+req.params.id+"' AND users_uid = '"+req.body.uid+"' AND users_provider = '"+req.body.provider+"' ;";
              resolve(mysqlConnection.query(sql));
            }
          });
        })
        .then((result) => { // Fa el Response bo :)
          res
            .status(200)
            .json({})
        })
        .catch((err) => {
          if (err == "No es pot desmarcar l'assitència si ja s'ha fet el check-in") {
            res
              .status(403)
              .json({'error' : "No es pot desmarcar l'assitència si ja s'ha fet el check-in"})
          } else {
            handleError(err, res, "DELETE/:id/user/");
          }
        })
        .finally(() => {
          pool.releaseConnection(mysqlConnection);
        });
      });
    }
  })

  .get('/:id', function(req, res, next) {
    if(!req.params.id) { handleNoParams(res); }
    else {

      pool.getConnection().then(function(mysqlConnection) {
        let eventEventful = null;
        const params = "id=" + req.params.id;
        doRequest(params, "get")
        .then((eventResEventful) => {
          return new Promise(function(resolve, reject) {
            if (eventResEventful.error) {
              reject(eventResEventful.error);
            } else {
              eventEventful = eventResEventful;
              const sql = "SELECT number_attendances FROM events WHERE id = '"+req.params.id+"' ;";
              resolve(mysqlConnection.query(sql));
            }
          });
        })
        .then((result) => {
          if (result.length == 0) { eventEventful["number_attendances"] = 0; }
          else { eventEventful["number_attendances"] = result[0].number_attendances; }
          res
            .status(200)
            .json({event: eventEventful})
        })
        .catch((err) => {
          handleError(err, res, "GET/:id");
        })
        .finally(() => {
          pool.releaseConnection(mysqlConnection);
        });
      });

    }
  })

module.exports = router
