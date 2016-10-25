"use strict"
let request = require('supertest-as-promised');
const api = require('../app');
const host = api;

request = request(host);

var aux_id = "E0-001-095173443-9";

describe('route of events', function() {

  this.timeout(120000); // Per les proves

  describe('GET /events', function() {
    it('should get a list of events in Barcelona', function(done) {
      const params = {
        'location' : 'Barcelona',
        'within' : '20',
        'page_size' : '15',
        'page_number' : '2'
      };
      request
        .get('/events')
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      .then((res) => {

        expect(res.body).to.have.property('events');
        const events = res.body.events.event;

        expect(events).to.be.an('array')
          .and.to.have.length.of(params.page_size)

        const eventResponse = events[0];

        expect(eventResponse).to.have.property('id')
        expect(eventResponse).to.have.property('title')
        expect(eventResponse).to.have.property('description')
        expect(eventResponse).to.have.property('url')
        expect(eventResponse).to.have.property('start_time')
        expect(eventResponse).to.have.property('stop_time')
        expect(eventResponse).to.have.property('venue_id')
        expect(eventResponse).to.have.property('venue_name')
        expect(eventResponse).to.have.property('venue_address')
        expect(eventResponse).to.have.property('latitude')
        expect(eventResponse).to.have.property('longitude')
        expect(eventResponse).to.have.property('all_day')
        //expect(eventResponse).to.have.property('category_id')
        expect(eventResponse).to.have.property('image')
        //expect(eventResponse).to.have.property('price')
        expect(eventResponse).to.have.property('number_attendances')


        done();
      }, done)
    });
    it('should get a list of events with some keywords', function(done) {
      const params = {
        'keywords' : 'LIGA soccer',
        'page_size' : '50',
        'page_number' : '2'
      };
      request
        .get('/events')
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      .then((res) => {

        expect(res.body).to.have.property('events');
        const events = res.body.events.event;

        expect(events).to.be.an('array')
          .and.to.have.length.of(params.page_size)

        const eventResponse = events[0];

        expect(eventResponse).to.have.property('id')
        expect(eventResponse).to.have.property('title')
        expect(eventResponse).to.have.property('description')
        expect(eventResponse).to.have.property('url')
        expect(eventResponse).to.have.property('start_time')
        expect(eventResponse).to.have.property('stop_time')
        expect(eventResponse).to.have.property('venue_id')
        expect(eventResponse).to.have.property('venue_name')
        expect(eventResponse).to.have.property('venue_address')
        expect(eventResponse).to.have.property('latitude')
        expect(eventResponse).to.have.property('longitude')
        expect(eventResponse).to.have.property('all_day')
        //expect(eventResponse).to.have.property('category_id')
        expect(eventResponse).to.have.property('image')
        //expect(eventResponse).to.have.property('price')
        expect(eventResponse).to.have.property('number_attendances')


        done();
      }, done)
    });
    it('should get a list of events of a category', function(done) {
      const params = {
        'category' : 'art'
      };
      request
        .get('/events')
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      .then((res) => {

        expect(res.body).to.have.property('events');
        const events = res.body.events.event;

        expect(events).to.be.an('array')
          .and.to.have.length.of(10)

        const eventResponse = events[0];

        expect(eventResponse).to.have.property('id')
        expect(eventResponse).to.have.property('title')
        expect(eventResponse).to.have.property('description')
        expect(eventResponse).to.have.property('url')
        expect(eventResponse).to.have.property('start_time')
        expect(eventResponse).to.have.property('stop_time')
        expect(eventResponse).to.have.property('venue_id')
        expect(eventResponse).to.have.property('venue_name')
        expect(eventResponse).to.have.property('venue_address')
        expect(eventResponse).to.have.property('latitude')
        expect(eventResponse).to.have.property('longitude')
        expect(eventResponse).to.have.property('all_day')
        //expect(eventResponse).to.have.property('category_id')
        expect(eventResponse).to.have.property('image')
        //expect(eventResponse).to.have.property('price')
        expect(eventResponse).to.have.property('number_attendances')


        done();
      }, done)
    });
    it('should get a list of events of a date', function(done) {
      const params = {
        'date' : 'Next week',
        'page_size' : '50',
        'page_number' : '2'
      };
      request
        .get('/events')
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      .then((res) => {

        expect(res.body).to.have.property('events');
        const events = res.body.events.event;

        expect(events).to.be.an('array')
          .and.to.have.length.of(params.page_size)

        const eventResponse = events[0];

        expect(eventResponse).to.have.property('id')
        expect(eventResponse).to.have.property('title')
        expect(eventResponse).to.have.property('description')
        expect(eventResponse).to.have.property('url')
        expect(eventResponse).to.have.property('start_time')
        expect(eventResponse).to.have.property('stop_time')
        expect(eventResponse).to.have.property('venue_id')
        expect(eventResponse).to.have.property('venue_name')
        expect(eventResponse).to.have.property('venue_address')
        expect(eventResponse).to.have.property('latitude')
        expect(eventResponse).to.have.property('longitude')
        expect(eventResponse).to.have.property('all_day')
        //expect(eventResponse).to.have.property('category_id')
        expect(eventResponse).to.have.property('image')
        //expect(eventResponse).to.have.property('price')
        expect(eventResponse).to.have.property('number_attendances')


        done();
      }, done)
    });
    it('should get a list of events of a category in a date in a place', function(done) {
      const params = {
        'category' : 'music',
        'date' : '2016091200-2017042200',
        'location' : 'Barcelona',
        'page_size' : '25'
      };
      request
        .get('/events')
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      .then((res) => {

        expect(res.body).to.have.property('events');
        const events = res.body.events.event;
        //console.log(JSON.stringify(res.body));
        expect(events).to.be.an('array')
          .and.to.have.length.of(params.page_size)

        const eventResponse = events[0];
        //console.log("eventResponse: --> " + JSON.stringify(eventResponse));
        expect(eventResponse).to.have.property('id')
        expect(eventResponse).to.have.property('title')
        expect(eventResponse).to.have.property('description')
        expect(eventResponse).to.have.property('url')
        expect(eventResponse).to.have.property('start_time')
        expect(eventResponse).to.have.property('stop_time')
        expect(eventResponse).to.have.property('venue_id')
        expect(eventResponse).to.have.property('venue_name')
        expect(eventResponse).to.have.property('venue_address')
        expect(eventResponse).to.have.property('latitude')
        expect(eventResponse).to.have.property('longitude')
        expect(eventResponse).to.have.property('all_day')
        //expect(eventResponse).to.have.property('category_id')
        expect(eventResponse).to.have.property('image')
        //expect(eventResponse).to.have.property('price')
        expect(eventResponse).to.have.property('number_attendances')


        done();
      }, done)
    });
  });

  describe('GET /events/:id', function() {
    it('should obtain an event with all its info when that event was not created from our app', function(done) {
      request
        .get('/events/' + aux_id)
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /application\/json/)
      .then((res) => {
        expect(JSON.parse(res.text)).to.have.property('event')
        const eventResponse = JSON.parse(res.text).event;
        //console.log("eventResponse: --> " + JSON.stringify(eventResponse));
        expect(eventResponse).to.have.property('id')
        expect(eventResponse).to.have.property('title')
        expect(eventResponse).to.have.property('description')
        expect(eventResponse).to.have.property('url')
        expect(eventResponse).to.have.property('start_time')
        expect(eventResponse).to.have.property('stop_time')
        expect(eventResponse).to.have.property('venue_id')
        expect(eventResponse).to.have.property('venue_name')
        expect(eventResponse).to.have.property('address')
        expect(eventResponse).to.have.property('city')
        expect(eventResponse).to.have.property('country')
        expect(eventResponse).to.have.property('latitude')
        expect(eventResponse).to.have.property('longitude')
        expect(eventResponse).to.have.property('all_day')
        expect(eventResponse).to.have.property('categories')
        expect(eventResponse.categories).to.have.property('category')
        expect(eventResponse).to.have.property('images')
        expect(eventResponse).to.have.property('free')
        expect(eventResponse).to.have.property('price')
        expect(eventResponse).to.have.property('number_attendances', 0)

        done();
      }, done)
    });
  });

  describe('GET /events/user/', function() { // CAL COMPROBAR EL TOKEN!!!
    it('should obtain all events from a user', function(done) {
      const params = {
        'uid' : 1,
        'provider' : 'provider',
        'page_size' : 20
      };
      request
        .get('/events/user')
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      .then((res) => {

        expect(res.body).to.have.property('total_items');
        expect(res.body).to.have.property('past');
        const eventsPast = res.body.past.events;
        const eventsFuture = res.body.future.events;

        //console.log(JSON.stringify(res.body));

        expect(eventsPast).to.be.an('array')
          .and.to.have.length.of.at.least(1);
        expect(eventsPast).to.be.an('array')
          .and.to.have.length.of.at.most(params.page_size);

          expect(eventsFuture).to.be.an('array')
            .and.to.have.length.of.at.least(1);
          expect(eventsFuture).to.be.an('array')
            .and.to.have.length.of.at.most(params.page_size);

        const eventResponse = eventsPast[0].event;
        //console.log("eventResponse: --> " + JSON.stringify(eventResponse));
        expect(eventResponse).to.have.property('id')
        expect(eventResponse).to.have.property('title')
        expect(eventResponse).to.have.property('description')
        expect(eventResponse).to.have.property('url')
        expect(eventResponse).to.have.property('start_time')
        expect(eventResponse).to.have.property('stop_time')
        expect(eventResponse).to.have.property('venue_id')
        expect(eventResponse).to.have.property('venue_name')
        expect(eventResponse).to.have.property('address')
        expect(eventResponse).to.have.property('city')
        expect(eventResponse).to.have.property('country')
        expect(eventResponse).to.have.property('latitude')
        expect(eventResponse).to.have.property('longitude')
        expect(eventResponse).to.have.property('all_day')
        expect(eventResponse).to.have.property('categories')
        expect(eventResponse.categories).to.have.property('category')
        expect(eventResponse).to.have.property('images')
        expect(eventResponse).to.have.property('free')
        expect(eventResponse).to.have.property('price')
        expect(eventResponse).to.have.property('checkin_done', 1)
        expect(eventResponse).to.have.property('number_attendances').and.to.be.at.least(1);

        done();
      }, done)
    });
  });

  describe('POST /events/user/', function() { // CAL COMPROBAR EL TOKEN!!!
    it('should create an attendance from a user to an event', function(done) {
      const params = {
        'uid' : 1,
        'provider' : 'provider',
        'event_id' : 'E0-001-093875660-9'
      };
      request
        .post('/events/user')
        .set('Accept', 'application/json')
        .send(params)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      .then((res) => {
        expect(res.body).to.have.property('attendance');
        const attendanceResponse = res.body.attendance;
        expect(attendanceResponse).to.have.property('event_id', params.event_id);
        expect(attendanceResponse).to.have.property('uid', params.uid);
        expect(attendanceResponse).to.have.property('provider', params.provider);
        expect(attendanceResponse).to.have.property('checkin_done', '0');
        done();
      }, done)
    });
  });

  describe('PUT /events/user/', function() { // CAL COMPROBAR EL TOKEN!!!
    it('should mark the check-in of an event from an user', function(done) {
      const params = {
        'uid' : 1,
        'provider' : 'provider',
        'event_id' : 'E0-001-093875660-9',
        'checkin_done' : '1'
      };
      request
        .put('/events/user')
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      .then((res) => {
        expect(res.body).to.have.property('attendance');
        const attendanceResponse = res.body.attendance;
        expect(attendanceResponse).to.have.property('event_id', params.event_id);
        expect(attendanceResponse).to.have.property('uid', params.uid);
        expect(attendanceResponse).to.have.property('provider', params.provider);
        expect(attendanceResponse).to.have.property('checkin_done', params.checkin_done);
        done();
      }, done)
    });
  });


});
