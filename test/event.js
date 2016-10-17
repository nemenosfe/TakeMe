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
    it.only('should create an event', function(done) {
      this.timeout(5000); // Per fer proves, però no cal

      let event = {
        'name': 'name testing 01',
        'description': 'description testing 01',
        'startTime' : "2017-01-12T13:00:00Z",
        'endTime' : "2017-02-12T13:00:00Z",
        'category_id' : '1',
        'capacity' : '200'
      }
      // QUEDA PENDENT EL CATEGORY!!

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

            expect(event).to.have.property('id')
            expect(event).to.have.property('name', 'name testing 01')
            expect(event).to.have.property('description', 'description testing 01')
            expect(event).to.have.property('url')
            expect(event).to.have.property('resource_uri')
            expect(event).to.have.property('start')
            expect(event).to.have.property('end')
            expect(event).to.have.property('capacity')
            expect(event).to.have.property('category_id')
            expect(event).to.have.property('logo')

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
          return mysqlConnection.query("CREATE TABLE events(id int NOT NULL, name varchar(255) NOT NULL, description varchar(2000), PRIMARY KEY (id));")
        })
        .then((res) => {
          //console.log("Table events created: " + JSON.stringify(res));
          return mysqlConnection.query("INSERT INTO events SET ?", {id: 2, name: "Títol 01", description: "Descripció random"})
        })
        .then((res) => {
          //console.log("Insert event1 done: " + JSON.stringify(res));
          return mysqlConnection.query("INSERT INTO events SET ?", {id: 3, name: "Títol 02", description: "Descripció random"})
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

            expect(events[0]).to.have.property('id', 2)
            expect(events[0]).to.have.property('name', 'Títol 01')
            expect(events[0]).to.have.property('description', 'Descripció random')

            expect(events[1]).to.have.property('id', 3)
            expect(events[1]).to.have.property('name', 'Títol 02')
            expect(events[1]).to.have.property('description', 'Descripció random')
            done();
          }, done)
        });
      });
    });
  });

  describe('GET /events/:id', function() {
    it('should obtain an event', function(done) {
      this.timeout(5000); // Per fer proves

      pool.getConnection().then(function(mysqlConnection) {
        mysqlConnection.query("DROP TABLE IF EXISTS events")
        .then((res) => {
          //console.log("Table events doesn't exist now: " + JSON.stringify(res));
          return mysqlConnection.query("CREATE TABLE events(id int NOT NULL, name varchar(255) NOT NULL, description varchar(2000), PRIMARY KEY (id));")
        })
        .then((res) => {
          //console.log("Table events created: " + JSON.stringify(res));
          return mysqlConnection.query("INSERT INTO events SET ?", {id: 2, name: "Títol 01", description: "Descripció random"})
        })
        .then((res) => {
          //console.log("Insert event1 done: " + JSON.stringify(res));
          return mysqlConnection.query("INSERT INTO events SET ?", {id: 3, name: "Títol 02", description: "Descripció random"})
        })
        .then((res) => {
          //console.log("Insert event2 done: " + JSON.stringify(res));
        })
        .catch((err) => {
          console.log("Error: " + JSON.stringify(err));
        })
        .finally(() => {
          request
            .get('/events/' + 2)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /application\/json/)
          .then((res) => {
            let body = res.body

            expect(body).to.have.property('event')
            let event = body.event;

            expect(event).to.have.property('id', 2)
            expect(event).to.have.property('name', 'Títol 01')
            expect(event).to.have.property('description', 'Descripció random')

            done();
          }, done)
        });
      });
    });
  });

  describe('PUT:  /events/:id', function() {
    it('should update an event', function(done) {
      this.timeout(5000); // Per fer proves

      var event = {id: 2, name: "Títol 01", description: "Descripció random"}

      pool.getConnection().then(function(mysqlConnection) {
        mysqlConnection.query("DROP TABLE IF EXISTS events")
        .then((res) => {
          //console.log("Table events doesn't exist now: " + JSON.stringify(res));
          return mysqlConnection.query("CREATE TABLE events(id int NOT NULL, name varchar(255) NOT NULL, description varchar(2000), PRIMARY KEY (id));")
        })
        .then((res) => {
          //console.log("Table events created: " + JSON.stringify(res));
          return mysqlConnection.query("INSERT INTO events SET ?", event)
        })
        .then((res) => {
          //console.log("Insert event1 done: " + JSON.stringify(res));
          return mysqlConnection.query("INSERT INTO events SET ?", {id: 3, name: "Títol 02", description: "Descripció random"})
        })
        .then((res) => {
          //console.log("Insert event2 done: " + JSON.stringify(res));
        })
        .catch((err) => {
          console.log("Error: " + JSON.stringify(err));
        })
        .finally(() => {
          event.name = 'Nou Títol de levent';
          event.description = 'Nova descripció random';
          request
            .put('/events/' + event.id)
            .set('Accept', 'application/json')
            .send(event)
            .expect(200)
            .expect('Content-Type', /application\/json/)
          .then((res) => {
            let body = res.body

            expect(body).to.have.property('event')
            let event_res = body.event;

            expect(event_res).to.have.property('id', 2)
            expect(event_res).to.have.property('name', 'Nou Títol de levent')
            expect(event_res).to.have.property('description', 'Nova descripció random')

            done();
          }, done)
        });
      });
    });
  })

  describe('DELETE:  /events/:id', function() {
    it('should delete an event', function(done) {
      this.timeout(5000); // Per fer proves

      pool.getConnection().then(function(mysqlConnection) {
        mysqlConnection.query("DROP TABLE IF EXISTS events")
        .then((res) => {
          //console.log("Table events doesn't exist now: " + JSON.stringify(res));
          return mysqlConnection.query("CREATE TABLE events(id int NOT NULL, name varchar(255) NOT NULL, description varchar(2000), PRIMARY KEY (id));")
        })
        .then((res) => {
          //console.log("Table events created: " + JSON.stringify(res));
          return mysqlConnection.query("INSERT INTO events SET ?", {id: 2, name: "Títol 01", description: "Descripció random"})
        })
        .then((res) => {
          //console.log("Insert event1 done: " + JSON.stringify(res));
          return mysqlConnection.query("INSERT INTO events SET ?", {id: 3, name: "Títol 02", description: "Descripció random"})
        })
        .then((res) => {
          //console.log("Insert event2 done: " + JSON.stringify(res));
        })
        .catch((err) => {
          console.log("Error: " + JSON.stringify(err));
        })
        .finally(() => {
          request
            .delete('/events/' + 2)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /application\/json/)
          .then((res) => {
            let body = res.body

            expect(body).to.be.empty

            done();
          }, done)
        });
      });
    })
  })


});
