"use strict"
let request = require('supertest-as-promised');
const _ = require('lodash');
const api = require('../app');
const host = api;
const mysql = require('promise-mysql');

request = request(host);

var pool  = mysql.createPool({ // No vull repetir codi però quan estigui més complet ja faré un refactor.
  host     : 'localhost',
  user     : 'root',
  password : '12345678',
  database : 'takemelegends'
});

describe('route of events', function() {

  // Evidentment el DROP TABLE IF EXISTS és temporal i quan tinguem esdeveniments de debó, només borraré els creats en les proves i no tots XD

  describe('POST /events', function() {
    it('should create an event', function(done) {
      this.timeout(5000); // Per fer proves, però no cal

      let event = {
        'title': 'title testing 01',
        'description': 'description testing 01'
      }

      pool.getConnection().then(function(mysqlConnection) {
        mysqlConnection.query("DROP TABLE IF EXISTS events")
        .then((res) => {
          //console.log("Table events doesn't exist now: " + JSON.stringify(res));
        })
        .catch((err) => {
          console.log("Error: " + JSON.stringify(err));
        })
        .finally(() => {
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
            expect(event).to.have.property('ID')

            done(err)
          })
        });
      });
    })
  })

  describe('GET /events', function() {
    it('should obtain all the events', function(done) {
      this.timeout(5000); // Per fer proves

      pool.getConnection().then(function(mysqlConnection) {
        mysqlConnection.query("DROP TABLE IF EXISTS events")
        .then((res) => {
          //console.log("Table events doesn't exist now: " + JSON.stringify(res));
          return mysqlConnection.query("CREATE TABLE events(ID int NOT NULL, title varchar(255) NOT NULL, description varchar(2000), PRIMARY KEY (ID));")
        })
        .then((res) => {
          //console.log("Table events created: " + JSON.stringify(res));
          return mysqlConnection.query("INSERT INTO events SET ?", {id: 2, title: "Títol 01", description: "Descripció random"})
        })
        .then((res) => {
          //console.log("Insert event1 done: " + JSON.stringify(res));
          return mysqlConnection.query("INSERT INTO events SET ?", {id: 3, title: "Títol 02", description: "Descripció random"})
        })
        .then((res) => {
          //console.log("Insert event2 done: " + JSON.stringify(res));
        })
        .catch((err) => {
          console.log("Error: " + JSON.stringify(err));
        })
        .finally(() => {
          request
            .get('/events')
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /application\/json/)
          .then((res) => {
            let body = res.body

            expect(body).to.have.property('events')
            expect(body.events).to.be.an('array');
            expect(Object.keys(body.events).length).to.eql(2);

            let events = body.events;
            //console.log("BODY.EVENTS: " + JSON.stringify(events));

            expect(events[0]).to.have.property('ID', 2)
            expect(events[0]).to.have.property('title', 'Títol 01')
            expect(events[0]).to.have.property('description', 'Descripció random')

            expect(events[1]).to.have.property('ID', 3)
            expect(events[1]).to.have.property('title', 'Títol 02')
            expect(events[1]).to.have.property('description', 'Descripció random')
            done();
          }, done)
        });
      });
    });
  });




});
