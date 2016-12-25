"use strict"
const express = require('express'),
      router = express.Router(),
      mysql = require('promise-mysql'),
      Promise = require("bluebird"),

      utilsErrors = require('../utils/handleErrors'),
      utilsSecurity = require('../utils/security'),
      utilsEventRelated = require('../utils/eventRelated');

const pool  = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : '12345678',
  database : 'takemelegends'
});

router

  .get('/', function(req, res, next) {
    if( !req.query || (!req.query.location && !req.query.keywords && !req.query.category && !req.query.date) ) { utilsErrors.handleNoParams(res); }
    else {
      pool.getConnection().then(function(mysqlConnection) {
        let eventsEventful = null,
            page_size = req.query.page_size || "10",
            page_number = req.query.page_number || "1";
        utilsSecurity.authorize_appkey(req.query.appkey, mysqlConnection)
        .then((result) => {
          let params = utilsEventRelated.buildSearchParams(req.query, page_size, page_number);
          return utilsEventRelated.doRequest(params, "search")
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
                const takes = utilsEventRelated.getTakesToEarnInEvent(),
                      sqlInsertEventInDB = "INSERT IGNORE INTO events values ('"+eventsResEventful.events.event[index].id+"', "+eventsResEventful.events.event[index].all_day+", "+start+", "+stop+", 0, "+takes+");";
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
        .catch((err) => { utilsErrors.handleError(err, res); })
        .finally(() => { pool.releaseConnection(mysqlConnection); })
      });
    }
  })

  .get('/user', function(req, res, next) {
    if(!req.query || !req.query.uid || !req.query.provider) { utilsErrors.handleNoParams(res); }
    else {
      let page_size = req.query.page_size || "20",
          page_number = req.query.page_number || "1",
          eventsResponse = {
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
          },
          database_result = null;
      const limit = page_size,
            offset = page_size*(page_number-1);

      pool.getConnection().then(function(mysqlConnection) {
        utilsSecurity.authorize_appkey(req.query.appkey, mysqlConnection)
        .then((result) => {
          return utilsSecurity.authorize_token(req.query.token, req.query.uid, req.query.provider, mysqlConnection);
        })
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
            responses.push(utilsEventRelated.doRequest(params, "get"));
          }
          return Promise.all(responses);
        })
        .then((eventResEventful) => {
          let moment = "past";
          for (let index = 0; index < eventResEventful.length; index++) {
            if (moment != "future") { moment = utilsEventRelated.getMoment(database_result[index].start, database_result[index].all_day, database_result[index].stop); }
            let elementArray = utilsEventRelated.getFinalJSONOfAnEvent(eventResEventful[index], null);
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
          utilsErrors.handleError(err, res);
        })
        .finally(() => {
          pool.releaseConnection(mysqlConnection);
        });
      });
    }
  })

  .post('/user', function(req, res, next) {
    if(!req.body || !req.body.uid || !req.body.provider || !req.body.event_id) { utilsErrors.handleNoParams(res); }
    else {
      pool.getConnection().then(function(mysqlConnection) {
        utilsSecurity.authorize_appkey(req.body.appkey, mysqlConnection)
        .then((result) => {
          return utilsSecurity.authorize_token(req.body.token, req.body.uid, req.body.provider, mysqlConnection);
        })
        .then((result) => {
          return utilsEventRelated.createAndSaveAttendanceWithNeededData(mysqlConnection, req.body.event_id, req.body.uid, req.body.provider, false);
        })
        .then((attendanceResponse) => { // Fa el Response bo :)
          res
            .status(201)
            .json({ attendance: attendanceResponse });
        })
        .catch((err) => {
          utilsErrors.handleError(err, res);
        })
        .finally(() => {
          pool.releaseConnection(mysqlConnection);
        });
      });
    }
  })

  .put('/:id/user', function(req, res, next) { // S'HA DE MILLORAR
    if(!req.body || !req.body.uid || !req.body.provider || !req.params.id || !req.body.checkin_done) { utilsErrors.handleNoParams(res); }
    else {
      const attendanceRequest = req.body;
      let level = -1;
      let total_experience = 0;
      let new_takes_event = 0;
      let new_takes_achievement = 0;
      let total_takes = -1;

      let number_attendances_category;
      let category_id;
      let earned_achievement = null;
      pool.getConnection().then(function(mysqlConnection) {
        utilsSecurity.authorize_appkey(req.body.appkey, mysqlConnection)
        .then((result) => {
          return utilsSecurity.authorize_token(req.body.token, req.body.uid, req.body.provider, mysqlConnection);
        })
        .then((result) => { // Fa la request a Eventful de l'esdeveniment per saber la categoria
          const paramsForEventful = "id=" + req.params.id;
          return utilsEventRelated.doRequest(paramsForEventful, "get");
        })
        .then((result) => { // Guarda la categoria de l'esdeveniment + Comença la transacció a la BD
          category_id = utilsEventRelated.getFinalCategoryIdFromEventfulResponse(result);
          return mysqlConnection.query('START TRANSACTION');
        })
        .then((result) => { // Inserta l'assitència si no existeix (i l'esdeveniment)
          return utilsEventRelated.createAndSaveAttendanceWithNeededData(mysqlConnection, req.params.id, req.body.uid, req.body.provider, true);
        })
        .then((result) => { // Fa el check-in (no el puc treure ENCARA perquè la anterior funció s'ha de refactoritzar)
          const sql = "UPDATE attendances SET checkin_done=true WHERE events_id='"+req.params.id+"' AND users_uid='"+req.body.uid+"' AND users_provider='"+req.body.provider+"';";
          return mysqlConnection.query(sql);
        })
        .then((result) => { // Select takes de l'esdeveniment
          const sql = "SELECT takes FROM events WHERE id = '"+req.params.id+"';";
          return mysqlConnection.query(sql);
        })
        .then((result) => { // Select del nivell que té
          new_takes_event = result[0].takes;
          const sql = "SELECT level, experience, takes FROM users WHERE uid='"+req.body.uid+"' AND provider='"+req.body.provider+"';";
          return mysqlConnection.query(sql);
        })
        .then((result) => { // Select quantes vegades havia assistit a un esdeveniment d'aquesta categoria
          total_takes = result[0].takes;
          total_experience = result[0].experience;
          level = utilsEventRelated.getNewLevel(result[0].level, result[0].experience);
          const sql = "SELECT number_attendances FROM userscategories WHERE users_uid='"+req.body.uid+"' AND users_provider='"+req.body.provider+"' AND category_id='"+category_id+"';";
          return mysqlConnection.query(sql);
        })
        .then((result) => {
          number_attendances_category = utilsEventRelated.getNumberOfPreviousAttendancesOfCategoryByDBResult(result);
          const sql = "SELECT * FROM achievements "
                    + "WHERE category_id='" + category_id + "' "
                    + "AND number_required_attendances = ("
                    +   "SELECT MIN(number_required_attendances) FROM achievements "
                    +   "WHERE category_id='" + category_id + "' "
                    +   "AND number_required_attendances > " + number_attendances_category
                    + ");";
          return mysqlConnection.query(sql);
        })
        .then((result) => { // Es guarda el nou logro com a guanyat a la BD si n'ha guanyat un nou.
          return new Promise(function(resolve, reject) {
            const next_achievement_info = result[0];
            if ( (number_attendances_category + 1) == next_achievement_info.number_required_attendances) { // Ha de guanyar un nou 'logro'
              const sqlInsertacquisitionInDB = "INSERT IGNORE INTO acquisitions values ('"+req.body.uid+"', '"+req.body.provider+"', '"+next_achievement_info.id+"');";
              earned_achievement = next_achievement_info;
              new_takes_achievement = earned_achievement.takes;
              total_experience += new_takes_achievement;
              total_takes += new_takes_event;
              resolve( mysqlConnection.query(sqlInsertacquisitionInDB) );
            } else { resolve(1); }
          });
        })
        .then((result) => { // Guanya els takes de l'esdeveniment (i del logro si l'ha guanyat, si no aquest atribut val 0)
          const sql = "UPDATE users SET takes=takes+"+(new_takes_event+new_takes_achievement)+" WHERE uid='"+req.body.uid+"' AND provider='"+req.body.provider+"';";
          return mysqlConnection.query(sql);
        })
        .then((result) => { // Guanya l'experiencia de l'esdeveniment (i del logro si l'ha guanyat)
          const sql = "UPDATE users SET experience=experience+"+(new_takes_event+new_takes_achievement)+" WHERE uid='"+req.body.uid+"' AND provider='"+req.body.provider+"';";
          return mysqlConnection.query(sql);
        })
        .then((result) => { // Potser puja de nivell
          const new_level = utilsEventRelated.getNewLevel(level, total_experience);
          if (new_level > level) {
            level = new_level;
            const sql = "UPDATE users SET level="+new_level+" WHERE uid='"+req.body.uid+"' AND provider='"+req.body.provider+"';";
            return mysqlConnection.query(sql);
          }
          else { return new Promise(function(resolve, reject) { resolve(1); }); }
        })
        .then((result) => { // Nova assitència d'aquesta categoria a la BD
          const sql = (number_attendances_category == 0)  ? "INSERT INTO userscategories VALUES('"+req.body.uid+"', '"+req.body.provider+"', '"+category_id+"', 1)"
                                                          : "UPDATE userscategories SET number_attendances = number_attendances + 1 WHERE users_uid='"+req.body.uid+"' AND users_provider='"+req.body.provider+"' AND category_id='"+category_id+"'";
          return mysqlConnection.query(sql);
        })
        .then((result) => { // Fa el commit de la transacció
          return mysqlConnection.query('COMMIT');
        })
        .then((result) => { // Fa el Response bo :)
          const attendanceResponse = {
            'event_id' : req.params.id,
            'uid' : req.body.uid,
            'provider' : req.body.provider,
            'checkin_done' : '1',
            'new_takes' : new_takes_event,
            'total_takes' : total_takes,
            'experience' : total_experience,
            'level' : level,
            'achievement' : earned_achievement
          };
          res
            .status(200)
            .json({ attendance: attendanceResponse });
        })
        .catch((err) => {
          mysqlConnection.query('ROLLBACK');
          utilsErrors.handleError(err, res);
        })
        .finally(() => {
          pool.releaseConnection(mysqlConnection);
        });
      });
    }
  })

  .delete('/:id/user', function(req, res, next) {
    if(!req.body || !req.body.uid || !req.body.provider || !req.params.id) {  utilsErrors.handleNoParams(res); }
    else {
      pool.getConnection().then(function(mysqlConnection) {
        utilsSecurity.authorize_appkey(req.body.appkey, mysqlConnection)
        .then((result) => {
          return utilsSecurity.authorize_token(req.body.token, req.body.uid, req.body.provider, mysqlConnection);
        })
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
            utilsErrors.handleError(err, res);
          }
        })
        .finally(() => {
          pool.releaseConnection(mysqlConnection);
        });
      });
    }
  })

  .get('/:id', function(req, res, next) {
    if(!req.query || !req.params.id) { utilsErrors.handleNoParams(res); }
    else {
      pool.getConnection().then(function(mysqlConnection) {
        let eventEventful = null;
        utilsSecurity.authorize_appkey(req.query.appkey, mysqlConnection)
        .then((result) => {
          const params = "id=" + req.params.id;
          return utilsEventRelated.doRequest(params, "get");
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
              const sqlInsertEventInDB = "INSERT IGNORE INTO events values ('"+eventResEventful.id+"', "+eventResEventful.all_day+", "+start+", "+stop+", 0, "+utilsEventRelated.getTakesToEarnInEvent()+");";
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
            resolve(utilsEventRelated.getFinalJSONOfAnEvent(eventEventful, resultDB));
          });
        })
        .then((eventEventful) => {
          res
            .status(200)
            .json(eventEventful)

        })
        .catch((err) => {
          utilsErrors.handleError(err, res);
        })
        .finally(() => {
          pool.releaseConnection(mysqlConnection);
        });
      });

    }
  })

module.exports = router
