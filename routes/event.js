"use strict"
const express = require('express')
const _ = require('lodash')
const router = express.Router()
const mysql = require('promise-mysql');
const rp = require('request-promise');

const oauthTokenEventbrite = "VOYBQID3OWOAMLM6FFLQ";
const urlEventbriteApi = "https://www.eventbriteapi.com/v3/";

var pool  = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : '12345678',
  database : 'takemelegends'
});

function fillExtraInfo(varFrom, varTo) {
  if (varFrom.price) { varTo.price = varFrom.price; }
  if (varFrom.address) { varTo.address = varFrom.address; }
  if (varFrom.coords && varFrom.coords.latitude && varFrom.coords.longitude) {
    varTo.latitude = varFrom.coords.latitude;
    varTo.longitude = varFrom.coords.longitude;
  }
}

router
  .post('/', function(req, res, next) {
    if(!req.body || !req.body.name || !req.body.startTime || !req.body.endTime) {
      res
        .status(403)
        .json({error: true, message: 'Params empty'})
    } else {
      const eventRequest = req.body;
      const timeZone = "Europe/Madrid";
      const currency = "EUR";
      let eventResEventBrite;
      let insertEventDB;
      let eventResponse;

      pool.getConnection().then(function(mysqlConnection) {
        mysqlConnection.query("CREATE TABLE IF NOT EXISTS events(id bigint NOT NULL PRIMARY KEY, price DECIMAL(10, 2), address VARCHAR(500), latitude DECIMAL(10, 8), longitude DECIMAL(11, 8));")
        .then((result) => { // Fa la Resquest a EventBrite API
          let eventReqEventBrite = {
                                event: {
                                  name: { html: eventRequest.name },
                                  start: {
                                    utc: eventRequest.startTime,
                                    timezone: timeZone
                                  },
                                  end: {
                                    utc: eventRequest.endTime,
                                    timezone: timeZone
                                  },
                                  currency: currency
                                }
                              };
          if (eventRequest.description) { eventReqEventBrite.event.description = {html: eventRequest.description} };
          //if (eventRequest.category_id) { eventReqEventBrite.event.category_id = eventRequest.category_id };
          if (eventRequest.capacity) { eventReqEventBrite.event.capacity = eventRequest.capacity };
          var optionsRequest = {
            url: urlEventbriteApi+"events/",
            method: "POST",
            'auth': {
              'bearer': oauthTokenEventbrite
            },
            json: true,   // Important!
            body: eventReqEventBrite
          };
          return rp(optionsRequest);
        })
        .then((result) => { // Inserta a la nostra BD
          eventResEventBrite = result;
          insertEventDB = {id: eventResEventBrite.id};
          fillExtraInfo(eventRequest, insertEventDB);
          return mysqlConnection.query("INSERT INTO events SET ?", insertEventDB);
        })
        .then((result) => { // Fa el Response bo :)
          let eventResponse = {
            id: eventResEventBrite.id,
            name: eventResEventBrite.name.text,
            description: eventResEventBrite.description.text,
            url: eventResEventBrite.url,
            resource_uri: eventResEventBrite.resource_uri,
            start: eventResEventBrite.start,
            end: eventResEventBrite.end,
            capacity: eventResEventBrite.capacity,
            category_id: eventResEventBrite.category_id,
            logo: eventResEventBrite.logo
          };
          fillExtraInfo(eventRequest, eventResponse);
          res
            .status(201)
            .json({ event: eventResponse });
        })
        .catch((err) => {
          console.log("Error: " + JSON.stringify(err));
          res
            .status(500)
            .json({error: true, message: 'Error: ' +  JSON.stringify(err)});
        });
      });
    }
  })

  .get('/', function(req, res, next) {
    //console.log("GET events");
    pool.getConnection().then(function(mysqlConnection) {
      mysqlConnection.query("SELECT * FROM events;")
      .then((result) => {
        //console.log("Get events done: " + JSON.stringify(result));
        res
          .status(200)
          .json({events: result})
      })
      .catch((err) => {
        //console.log("Error GEEEEEET: " + JSON.stringify(err));
        res
          .status(500)
          .json({error: true, message: 'DB error: ' +  JSON.stringify(err)})
      });
    });
  })

  .get('/:id', function(req, res, next) {
    //console.log('GET:id', req.params.id)
    if(!req.params.id) {
      res
        .status(403)
        .json({error: true, message: 'Params empty'})
    } else {
      let _id = req.params.id
      pool.getConnection().then(function(mysqlConnection) {
        mysqlConnection.query("SELECT * FROM events WHERE id = ?;", _id)
        .then((result) => {
          //console.log("Get events done: " + JSON.stringify(result));
          res
            .status(200)
            .json({event: result[0]})
        })
        .catch((err) => {
          //console.log("Error GEEEEEET: " + JSON.stringify(err));
          res
            .status(500)
            .json({error: true, message: 'DB error: ' +  JSON.stringify(err)})
        });
      });
    }
  })

  .put('/:id', function(req, res, next) {
    //console.log("PUT:id", req.params.id)
    if(!req.params.id || !req.body) {
      res
        .status(403)
        .json({error: true, message: 'Params empty'})
    } else {
      //console.log("REQ.BODY: " + JSON.stringify(req.body));
      const event = req.body;
      pool.getConnection().then(function(mysqlConnection) {
        mysqlConnection.query("UPDATE events SET name='"+event.name+"', description='"+event.description+"' WHERE id = ?;", req.params.id)
        .then((result) => {
          //console.log("PUT events done: " + JSON.stringify(result));
          res
            .status(200)
            .json({event: event})
        })
        .catch((err) => {
          //console.log("Error PUT: " + JSON.stringify(err));
          res
            .status(500)
            .json({error: true, message: 'DB error: ' +  JSON.stringify(err)})
        });
      });
    }
  })

  .delete('/:id', function(req, res, next) {
    console.log("DELETE:id", req.params.id)
    if(!req.params.id) {
      res
        .status(403)
        .json({error: true, message: 'Params empty'})
    } else {
      pool.getConnection().then(function(mysqlConnection) {
        mysqlConnection.query("DELETE FROM events WHERE id = ?;", req.params.id)
        .then((result) => {
          res
            .status(200)
            .json({})
        })
        .catch((err) => {
          res
            .status(500)
            .json({error: true, message: 'DB error: ' +  JSON.stringify(err)})
        });
      });
    }
  })

module.exports = router
