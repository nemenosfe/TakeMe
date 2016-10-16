"use strict"
let request = require('supertest-as-promised')
const _ = require('lodash')
const api = require('../app')
const host = api

request = request(host)

describe('route of events', function() {

  describe('POST', function() {
    it('should create an event', function(done) {
      this.timeout(5000); // Per fer proves, però no cal

      let event = {
        'title': 'title testing 01',
        'description': 'description testing 01'
      }

      request
        .post('/events')
        .set('Accept', 'application/json')
        .send(event)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      .end((err, res) => {
        let body = res.body

        expect(body).to.have.property('event')
        event = body.event

        expect(event).to.have.property('title', 'title testing 01')
        expect(event).to.have.property('description', 'description testing 01')
        expect(event).to.have.property('_id')

        done(err)
      })
    })
  })

});
