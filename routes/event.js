"use strict"
const express = require('express')
const _ = require('lodash')
const router = express.Router()

var Event = {}

router
  .post('/', function(req, res, next) {
    console.log("POST: ", req.body)
    if(!req.body) {
      console.log("No hi ha body :(")
      res
        .status(403)
        .json({error: true, message: 'Body empty'})
    }

    let _event = req.body
    _event._id = Date.now()

    Event[_event._id] = _event

    res
      .status(201)
      .json({event: Event[_event._id]})
  })

module.exports = router
