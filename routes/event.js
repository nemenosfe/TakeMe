"use strict"
const express = require('express')
const router = express.Router()
const rp = require('request-promise');

const urlEventfulApi = "http://api.eventful.com/json/events/";
const keyEventfulApi = "KxZvhSVN3f38ct54";

function handleError(err, res, requestVerb) {
  if (err.error && err.error.status_code && err.error.status_code == 403) {
    res
      .status(err.error.status_code)
      .json({error: true, message: err.error.error_description})
  } else {
    console.log("Error "+requestVerb+" : " + JSON.stringify(err));
    res
      .status(500)
      .json({error: true, message: 'Error: ' +  JSON.stringify(err)})
  }
}

function handleNoParams(res) {
  res
    .status(403)
    .json({error: true, message: 'Params empty'})
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


router

  .get('/', function(req, res, next) {
    if( !req.body || (!req.body.location && !req.body.keywords && !req.body.category && !req.body.date) ) { handleNoParams(res); }
    else {
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
        if (eventsResEventful.error) {
          console.log("ERROR: " + JSON.stringify(err));
          handleError(eventsResEventful.error, res, "GET");
        } else {
          res
            .status(200)
            .json(eventsResEventful)
        }
      })
      .catch((err) => {
        console.log("ERROR: " + JSON.stringify(err));
        handleError(err, res, "GET");
      })
    }
  })

  .get('/:id', function(req, res, next) {
    if(!req.params.id) { handleNoParams(res); }
    else {
      const params = "id=" + req.params.id;
      doRequest(params, "get")
      .then((eventsResEventful) => {
        if (eventsResEventful.error) {
          console.log("ERROR: " + JSON.stringify(err));
          handleError(eventsResEventful.error, res, "GET");
        } else {
          res
            .status(200)
            .json({event: eventsResEventful})
        }
      })
      .catch((err) => {
        console.log("ERROR: " + JSON.stringify(err));
        handleError(err, res, "GET/:id");
      })
    }
  })

module.exports = router
