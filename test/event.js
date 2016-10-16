"use strict"
let request = require('supertest-as-promised');
const _ = require('lodash');
const api = require('../app');
const host = api;
const mysql = require('mysql');

request = request(host);

var pool  = mysql.createPool({ // No vull repetir codi però quan estigui més complet ja faré un refactor.
  host     : 'localhost',
  user     : 'root',
  password : '12345678',
  database : 'takemelegends'
});

describe('route of events', function() {

  // Evidentment el DROP TABLE IF EXISTS és temporal i quan tinguem esdeveniments de debó, només borraré els creats en les proves i no tots XD

  beforeEach(function() {
    pool.getConnection(function(err, mysqlConnection) {
      mysqlConnection.query("DROP TABLE IF EXISTS events", function(err, result) {
        if (!err) {
          console.log("Table events doesn't exist now: " + JSON.stringify(result));
          mysqlConnection.release();
        } else {
          console.log("Error: " + JSON.stringify(err));
        }
      });
    });
  });

  after(function() { // Al final netejo la BD de les proves que he fet
    pool.getConnection(function(err, mysqlConnection) {
      mysqlConnection.query("DROP TABLE IF EXISTS events", function(err, result) {
        if (!err) {
          console.log("Table events doesn't exist now: " + JSON.stringify(result));
          mysqlConnection.release();
        } else {
          console.log("Error: " + JSON.stringify(err));
        }
      });
    });
  });

  describe('POST /events', function() {
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
