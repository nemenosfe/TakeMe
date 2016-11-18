"use strict"
const express = require('express')
const router = express.Router()
const rp = require('request-promise');
const mysql = require('promise-mysql');
const Promise = require("bluebird");
const crypto = require('crypto');

const urlEventfulApi = "http://api.eventful.com/json/events/";
const keyEventfulApi = "KxZvhSVN3f38ct54";

const pool  = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : '12345678',
  database : 'takemelegends'
});

function handleError(err, res) {
  if (err.error && err.error.status_code) {
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
  const errorJSONresponse = {error: {status_code: 403, error_description: 'Missing params'}}
  handleError(errorJSONresponse, res);
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
      url : eventEventful["url"],
      all_day :  eventEventful["all_day"],
      start_time :  eventEventful["start_time"],
      stop_time :  eventEventful["stop_time"],
      venue_display : eventEventful["venue_display"],
      venue_id : eventEventful["venue_id"],
      venue_name : eventEventful["venue_name"],
      address : eventEventful["venue_address"] || eventEventful["address"] || null,
      city : eventEventful["city_name"] || eventEventful["city"] || null,
      country : eventEventful["country_name"] || eventEventful["country"] || null,
      region : eventEventful["region_name"] || eventEventful["region"] || null,
      postal_code : eventEventful["postal_code"],
      latitude : eventEventful["latitude"],
      longitude : eventEventful["longitude"],
      images : eventEventful["image"] || eventEventful["images"] || null,
      free : eventEventful["free"] || null,
      price : eventEventful["price"] || null,
      categories : eventEventful["categories"] || null
    } // Per ara no retornem "Performers" ni "Tags" ni "Links"
  };
}

function getTakesToEarnInEvent() { return Math.floor(Math.random() * 1000 + 1); } // Retorna un número aleatori del rang [1, 1000)

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

function getNewLevel(level, experience) {
  const new_level = experience / Math.log10(level);
  return (new_level > level) ? new_level : level;
}

function buildSearchParams(params_query, page_size, page_number) {
  let params = "sort_order=date&page_size="+page_size+"&page_number="+page_number;
  if (params_query.location) {
    params = params + "&location=" + params_query.location;
    let within = 350;
    if (params_query.within) {
      within = params_query.within;
    }
    params = params + "&units=km&within=" + within;
  }
  if (params_query.keywords) { params = params + "&keywords=" + params_query.keywords; }
  if (params_query.category) { params = params + "&category=" + params_query.category; }
  if (params_query.date) { params = params + "&date=" + params_query.date; }
  return params;
}


router

  .get('/', function(req, res, next) {
    if( !req.query || (!req.query.location && !req.query.keywords && !req.query.category && !req.query.date) ) { handleNoParams(res); }
    else {
      pool.getConnection().then(function(mysqlConnection) {
        let eventsEventful;
        let page_size = "10";
        let page_number = "1";
        authorize_appkey(req.query.appkey, mysqlConnection)
        .then((result) => {
          if (req.query.page_size) { page_size = req.query.page_size; }
          if (req.query.page_number) { page_number = req.query.page_number; }
          let params = buildSearchParams(req.query, page_size, page_number);
          return doRequest(params, "search")
        })
        .then((eventsResEventful) => {
          return new Promise(function(resolve, reject) {
            if (eventsResEventful.error) {
              reject(eventsResEventful.error);
            } else {
              eventsEventful = eventsResEventful;
              let responses = [];
              for (let index = eventsResEventful.events.event.length - 1; index >=0; index--) {
                let start = null;
                let stop = null;
                if (eventsResEventful.events.event[index].start_time != null) { start = "'"+eventsResEventful.events.event[index].start_time+"'"; }
                if (eventsResEventful.events.event[index].stop_time != null) { stop = "'"+eventsResEventful.events.event[index].stop_time+"'"; }
                const takes = getTakesToEarnInEvent();
                const sqlInsertEventInDB = "INSERT IGNORE INTO events values ('"+eventsResEventful.events.event[index].id+"', "+eventsResEventful.events.event[index].all_day+", "+start+", "+stop+", 0, "+takes+");";
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
          handleError(err, res);
        })
        .finally(() => {
          pool.releaseConnection(mysqlConnection);
        })
      });
    }
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
      let database_result = null;

      pool.getConnection().then(function(mysqlConnection) {
        authorize_appkey(req.query.appkey, mysqlConnection)
        .then((result) => {
          const sql = "SELECT at.events_id, at.checkin_done, DATE_FORMAT(ev.start_time, '%Y-%l-%d %H:%m:%s') AS start, DATE_FORMAT(ev.stop_time, '%Y-%l-%d %H:%m:%s') AS stop, ev.all_day, ev.number_attendances, ev.takes FROM attendances at, events ev WHERE ev.id = at.events_id AND at.users_uid = " + req.query.uid + " AND at.users_provider='" + req.query.provider + "' ORDER BY ISNULL(ev.start_time), ev.start_time ASC, ev.all_day ASC, ISNULL(ev.stop_time), ev.stop_time ASC, at.events_id ASC LIMIT " + limit + " OFFSET  " + offset + " ;";
          return mysqlConnection.query(sql)
        })
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
            let elementArray = getFinalJSONOfAnEvent(eventResEventful[index], null);
            elementArray.event.checkin_done = database_result[index].checkin_done;
            elementArray.event.number_attendances = database_result[index].number_attendances;
            elementArray.event.takes = database_result[index].takes;
            eventsResponse[moment]["events"][index] = elementArray;
          }

          res
            .status(200)
            .json(eventsResponse)
        })
        .catch((err) => {
          handleError(err, res);
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
        authorize_appkey(req.body.appkey, mysqlConnection)
        .then((result) => {
          const sqlEventInDB = "SELECT COUNT(id) AS event_exists FROM events WHERE id='"+req.body.event_id+"';";
          return mysqlConnection.query(sqlEventInDB)
        })
        .then((result) => {
          // Si no tenim l'esdeveniment a la nostra BD, el demanem a Eventful
          if (result[0].event_exists == '1') {
            return new Promise(function (resolve, reject){
              resolve(1);
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
            return new Promise(function (resolve, reject){
              resolve(1);
            });
          }
          else {
            let start = null;
            let stop = null;
            if (result.start_time != null) { start = "'"+result.start_time+"'"; }
            if (result.stop_time != null) { stop = "'"+result.stop_time+"'"; }
            const sqlInsertEventInDB = "INSERT IGNORE INTO events values ('"+req.body.event_id+"', "+result.all_day+", "+start+", "+stop+", 0, "+getTakesToEarnInEvent()+");";
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
          handleError(err, res);
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
      let level = -1;
      let experience = -1;
      let new_takes = -1;
      let total_takes = -1;
      pool.getConnection().then(function(mysqlConnection) {
        authorize_appkey(req.body.appkey, mysqlConnection)
        .then((result) => {
          return mysqlConnection.query('START TRANSACTION');
        })
        .then((result) => { // Fa el check-in
          const sql = "UPDATE attendances SET checkin_done=true WHERE events_id='"+req.params.id+"' AND users_uid='"+req.body.uid+"' AND users_provider='"+req.body.provider+"';";
          return mysqlConnection.query(sql);
        })
        .then((result) => { // Select takes de l'esdeveniment
          const sql = "SELECT takes FROM events WHERE id = '"+req.params.id+"';";
          return mysqlConnection.query(sql);
        })
        .then((result) => { // Guanya els takes de l'esdeveniment
          new_takes = result[0].takes;
          const sql = "UPDATE users SET takes=takes+"+new_takes+" WHERE uid='"+req.body.uid+"' AND provider='"+req.body.provider+"';";
          return mysqlConnection.query(sql);
        })
        .then((result) => { // Guanya experiencia
          const sql = "UPDATE users SET experience=experience+"+new_takes+" WHERE uid='"+req.body.uid+"' AND provider='"+req.body.provider+"';";
          return mysqlConnection.query(sql);
        })
        .then((result) => { // Select del nivell que té
          const sql = "SELECT level, experience, takes FROM users WHERE uid='"+req.body.uid+"' AND provider='"+req.body.provider+"';";
          return mysqlConnection.query(sql);
        })
        .then((result) => { // Guanya els takes de l'esdeveniment
          total_takes = result[0].takes;
          experience = result[0].experience;
          level = getNewLevel(result[0].level, result[0].experience);
          const sql = "UPDATE users SET level="+level+" WHERE uid='"+req.body.uid+"' AND provider='"+req.body.provider+"';";
          return mysqlConnection.query(sql);
        })
        .then((result) => {
          return mysqlConnection.query('COMMIT');
        })
        .then((result) => { // Fa el Response bo :)
          const attendanceResponse = {
            'event_id' : req.params.id,
            'uid' : req.body.uid,
            'provider' : req.body.provider,
            'checkin_done' : '1',
            'new_takes' : new_takes,
            'total_takes' : total_takes,
            'experience' : experience,
            'level' : level
          };
          res
            .status(200)
            .json({ attendance: attendanceResponse });
        })
        .catch((err) => {
          mysqlConnection.query('ROLLBACK');
          handleError(err, res);
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
        authorize_appkey(req.body.appkey, mysqlConnection)
        .then(() => {
          const sql = "SELECT checkin_done FROM attendances WHERE events_id = '"+req.params.id+"' AND users_uid = '"+req.body.uid+"' AND users_provider = '"+req.body.provider+"' ;";
          return mysqlConnection.query(sql);
        })
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
              .json({'error' : err})
          } else {
            handleError(err, res);
          }
        })
        .finally(() => {
          pool.releaseConnection(mysqlConnection);
        });
      });
    }
  })

  .get('/:id', function(req, res, next) {
    if(!req.query || !req.params.id) { handleNoParams(res); }
    else {
      pool.getConnection().then(function(mysqlConnection) {
        let eventEventful = null;
        authorize_appkey(req.query.appkey, mysqlConnection)
        .then((result) => {
          const params = "id=" + req.params.id;
          return doRequest(params, "get");
        })
        .then((eventResEventful) => {
          return new Promise(function(resolve, reject) {
            if (eventResEventful.error) {
              reject(eventResEventful.error);
            } else {
              eventEventful = eventResEventful;
              let start = null;
              let stop = null;
              if (eventResEventful.start_time != null) { start = "'"+eventResEventful.start_time+"'"; }
              if (eventResEventful.stop_time != null) { stop = "'"+eventResEventful.stop_time+"'"; }
              const sqlInsertEventInDB = "INSERT IGNORE INTO events values ('"+eventResEventful.id+"', "+eventResEventful.all_day+", "+start+", "+stop+", 0, "+getTakesToEarnInEvent()+");";
              resolve(mysqlConnection.query(sqlInsertEventInDB));
            }
          });
        })
        .then((result) => {
          const sql = "SELECT id, number_attendances, takes FROM events WHERE id = '"+req.params.id+"' ;";
          return mysqlConnection.query(sql);
        })
        .then((resultDB) => {
          return new Promise(function(resolve, reject) {
            resolve(getFinalJSONOfAnEvent(eventEventful, resultDB));
          });
        })
        .then((eventEventful) => {
          res
            .status(200)
            .json(eventEventful)

        })
        .catch((err) => {
          handleError(err, res);
        })
        .finally(() => {
          pool.releaseConnection(mysqlConnection);
        });
      });

    }
  })

module.exports = router
