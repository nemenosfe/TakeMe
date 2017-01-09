"use strict"
let request = require('supertest-as-promised');
const api = require('../app'),
      utilsDatabaseRelated = require('../utils/databaseRelated'),
      utilsEventRelated = require('../utils/eventRelated'),
      helperCommon = require('./helpers/common'),
      pool = utilsDatabaseRelated.getPool();
request = request(api);

let aux_id = "E0-001-095173443-9";

function deleteAttendancesAndAcquisitionsFromTestsForUser3() {
  pool.getConnection().then(function(mysqlConnection) {
    const sql = "DELETE FROM attendances WHERE users_uid = 3 AND users_provider = 'provider';";
    mysqlConnection.query(sql)
    .then(() => {
      const sql = "DELETE FROM acquisitions WHERE users_uid = 3 AND users_provider = 'provider';";
      return mysqlConnection.query(sql);
    })
    .then(() => {
      const sql = "DELETE FROM userscategories WHERE users_uid = 3 AND users_provider = 'provider';";
      return mysqlConnection.query(sql);
    })
    .finally(() => {
      pool.releaseConnection(mysqlConnection);
    });
  });
}

describe('route of events', function() {

  this.timeout(120000); // Per les proves

  describe('GET /events', function() {
    it('should not get a list of events without the api key', function(done) {
      const params = {
        'location' : 'Barcelona',
        'within' : '20',
        'page_size' : '5',
        'page_number' : '2'
      };
      request
        .get(helperCommon.buildGetParams("/events/", params))
        .set('Accept', 'application/json')
        .expect(401)
        .expect('Content-Type', /application\/json/)
      .then((res) => {
        expect(res.body.error).to.equal(true)
        expect(res.body.message).to.equal("Unauthorized")
        done();
      }, done)
    });
    it('should not get a list of events with a wrong api key', function(done) {
      const params = {
        'appkey' : '123456',
        'location' : 'Barcelona',
        'within' : '20',
        'page_size' : '5',
        'page_number' : '2'
      };
      request
        .get(helperCommon.buildGetParams("/events/", params))
        .set('Accept', 'application/json')
        .expect(401)
        .expect('Content-Type', /application\/json/)
      .then((res) => {
        expect(res.body.error).to.equal(true)
        expect(res.body.message).to.equal("Unauthorized")
        done();
      }, done)
    });
    it('should get a list of events in Barcelona', function(done) {
      const params = {
        'appkey' : helperCommon.appkey,
        'location' : 'Barcelona',
        'within' : '20',
        'page_size' : '5',
        'page_number' : '2'
      };
      request
        .get(helperCommon.buildGetParams("/events/", params))
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /application\/json/)
      .then((res) => {
        expect(res.body).not.to.have.property('first_item');
        expect(res.body).to.have.property('events');
        const events = res.body.events;

        expect(events).to.be.an('array')
          .and.to.have.length.of(params.page_size)

        const eventResponse = events[0].event;

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
        expect(eventResponse).to.have.property('region')
        expect(eventResponse).to.have.property('country')
        expect(eventResponse).to.have.property('postal_code')
        expect(eventResponse).to.have.property('latitude')
        expect(eventResponse).to.have.property('longitude')
        expect(eventResponse).to.have.property('all_day')
        expect(eventResponse).to.have.property('categories');
        expect(eventResponse.categories.category[0]).to.have.property('id');
        expect(eventResponse).to.have.property('takes')
          .and.to.be.at.least(1);

        expect(eventResponse).to.have.property('images');
        const eventResponseImage = eventResponse.images;
        if(eventResponseImage) {
          expect(eventResponseImage).to.have.property('large');
          expect(eventResponseImage).to.have.property('medium');
          expect(eventResponseImage).to.have.property('thumb');
        }

        //expect(eventResponse).to.have.property('price')
        expect(eventResponse).to.have.property('number_attendances')
          .and.to.be.an.integer;
        expect(eventResponse).to.have.property('wanted_attendance')
        expect(eventResponse).to.have.property('checkin_done')
          .and.to.not.be.null;
        expect(eventResponse).not.to.have.property('links')
        expect(eventResponse).not.to.have.property('performers')

        done();
      }, done)
    });
    it('should get a list of events with some keywords', function(done) {
      const params = {
        'appkey' : helperCommon.appkey,
        'keywords' : 'LIGA soccer',
        'page_size' : '50',
        'page_number' : '2'
      };
      request
        .get(helperCommon.buildGetParams("/events/", params))
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /application\/json/)
      .then((res) => {

        expect(res.body).not.to.have.property('first_item');
        expect(res.body).to.have.property('events');
        const events = res.body.events;

        expect(events).to.be.an('array')
          .and.to.have.length.of(params.page_size)

        const eventResponse = events[0].event;

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
        expect(eventResponse).to.have.property('region')
        expect(eventResponse).to.have.property('country')
        expect(eventResponse).to.have.property('postal_code')
        expect(eventResponse).to.have.property('latitude')
        expect(eventResponse).to.have.property('longitude')
        expect(eventResponse).to.have.property('all_day')
        expect(eventResponse).to.have.property('categories');
        expect(eventResponse.categories.category[0]).to.have.property('id');
        expect(eventResponse).to.have.property('takes')
          .and.to.be.at.least(1);

        expect(eventResponse).to.have.property('images');
        const eventResponseImage = eventResponse.images;
        if(eventResponseImage) {
          expect(eventResponseImage).to.have.property('large');
          expect(eventResponseImage).to.have.property('medium');
          expect(eventResponseImage).to.have.property('thumb');
        }

        //expect(eventResponse).to.have.property('price')
        expect(eventResponse).to.have.property('number_attendances')
          .and.to.be.an.integer;
        expect(eventResponse).to.have.property('wanted_attendance')
        expect(eventResponse).to.have.property('checkin_done')
          .and.to.not.be.null;
        expect(eventResponse).not.to.have.property('links')
        expect(eventResponse).not.to.have.property('performers')


        done();
      }, done)
    });
    it('should get a list of events of a category', function(done) {
      const params = {
        'appkey' : helperCommon.appkey,
        'category' : 'art'
      };
      request
        .get(helperCommon.buildGetParams("/events/", params))
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /application\/json/)
      .then((res) => {

        expect(res.body).not.to.have.property('first_item');
        expect(res.body).to.have.property('events');
        const events = res.body.events;

        expect(events).to.be.an('array')
          .and.to.have.length.of(10)

        const eventResponse = events[0].event;

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
        expect(eventResponse).to.have.property('region')
        expect(eventResponse).to.have.property('country')
        expect(eventResponse).to.have.property('postal_code')
        expect(eventResponse).to.have.property('latitude')
        expect(eventResponse).to.have.property('longitude')
        expect(eventResponse).to.have.property('all_day')
        expect(eventResponse).to.have.property('categories');
        expect(eventResponse.categories.category[0]).to.have.property('id');
        expect(eventResponse).to.have.property('takes')
          .and.to.be.at.least(1);

        expect(eventResponse).to.have.property('images');
        const eventResponseImage = eventResponse.images;
        if(eventResponseImage) {
          expect(eventResponseImage).to.have.property('large');
          expect(eventResponseImage).to.have.property('medium');
          expect(eventResponseImage).to.have.property('thumb');
        }

        //expect(eventResponse).to.have.property('price')
        expect(eventResponse).to.have.property('number_attendances')
          .and.to.be.an.integer;
        expect(eventResponse).to.have.property('wanted_attendance')
        expect(eventResponse).to.have.property('checkin_done')
          .and.to.not.be.null;
        expect(eventResponse).not.to.have.property('links')
        expect(eventResponse).not.to.have.property('performers')


        done();
      }, done)
    });
    it('should get a list of events of a date', function(done) {
      const params = {
        'appkey' : helperCommon.appkey,
        'date' : 'Next week',
        'page_size' : '50',
        'page_number' : '2'
      };
      request
        .get(helperCommon.buildGetParams("/events/", params))
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /application\/json/)
      .then((res) => {

        expect(res.body).not.to.have.property('first_item');
        expect(res.body).to.have.property('events');
        const events = res.body.events;

        expect(events).to.be.an('array')
          .and.to.have.length.of(params.page_size)

        const eventResponse = events[0].event;

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
        expect(eventResponse).to.have.property('region')
        expect(eventResponse).to.have.property('country')
        expect(eventResponse).to.have.property('postal_code')
        expect(eventResponse).to.have.property('latitude')
        expect(eventResponse).to.have.property('longitude')
        expect(eventResponse).to.have.property('all_day')
        expect(eventResponse).to.have.property('categories');
        expect(eventResponse.categories.category[0]).to.have.property('id');
        expect(eventResponse).to.have.property('takes')
          .and.to.be.at.least(1);

        expect(eventResponse).to.have.property('images');
        const eventResponseImage = eventResponse.images;
        if(eventResponseImage) {
          expect(eventResponseImage).to.have.property('large');
          expect(eventResponseImage).to.have.property('medium');
          expect(eventResponseImage).to.have.property('thumb');
        }

        //expect(eventResponse).to.have.property('price')
        expect(eventResponse).to.have.property('number_attendances')
          .and.to.be.an.integer;
        expect(eventResponse).to.have.property('wanted_attendance')
        expect(eventResponse).to.have.property('checkin_done')
          .and.to.not.be.null;
        expect(eventResponse).not.to.have.property('links')
        expect(eventResponse).not.to.have.property('performers')


        done();
      }, done)
    });
    it.skip('should return future dates for "Future" in "Barcelona"', function(done) {
      const params = {
        'appkey' : helperCommon.appkey,
        'date' : 'Future',
        'page_size' : '50',
        'location' : 'Barcelona'
      };
      request
        .get(helperCommon.buildGetParams("/events/", params))
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /application\/json/)
      .then((res) => {

        expect(res.body).not.to.have.property('first_item');
        expect(res.body).to.have.property('events');
        const events = res.body.events;

        expect(events).to.be.an('array')
          .and.to.have.length.of(params.page_size)

        for (let i = events.length - 1; i >= 0; --i) {
          const event = events[i].event;
          expect(helperCommon.getMomentInTime(new Date(event.start_time))).to.eql(1); // 1 = Future, 0 = Present, -1 = Past
        }

        done();
      }, done)
    });
    it('should get a list of events of a category in a date in a place', function(done) {
      const params = {
        'appkey' : helperCommon.appkey,
        'category' : 'music',
        'date' : '2016091200-2017042200',
        'location' : 'Barcelona',
        'page_size' : '25'
      };
      request
        .get(helperCommon.buildGetParams("/events/", params))
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /application\/json/)
      .then((res) => {

        expect(res.body).not.to.have.property('first_item');
        expect(res.body).to.have.property('events');
        const events = res.body.events;

        expect(events).to.be.an('array')
          .and.to.have.length.of(params.page_size)

        const eventResponse = events[0].event;

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
        expect(eventResponse).to.have.property('region')
        expect(eventResponse).to.have.property('country')
        expect(eventResponse).to.have.property('postal_code')
        expect(eventResponse).to.have.property('latitude')
        expect(eventResponse).to.have.property('longitude')
        expect(eventResponse).to.have.property('all_day')
        expect(eventResponse).to.have.property('categories');
        expect(eventResponse.categories.category[0]).to.have.property('id');
        expect(eventResponse).to.have.property('takes')
          .and.to.be.at.least(1);

        expect(eventResponse).to.have.property('images');
        const eventResponseImage = eventResponse.images;
        if(eventResponseImage) {
          expect(eventResponseImage).to.have.property('large');
          expect(eventResponseImage).to.have.property('medium');
          expect(eventResponseImage).to.have.property('thumb');
        }

        expect(eventResponse).to.have.property('number_attendances')
          .and.to.be.an.integer;
        expect(eventResponse).to.have.property('wanted_attendance')
        expect(eventResponse).to.have.property('checkin_done')
          .and.to.not.be.null;
        expect(eventResponse).not.to.have.property('links')
        expect(eventResponse).not.to.have.property('performers')


        done();
      }, done)
    });
  });

  describe('GET /events/:id', function() {
    it('should not the event info without the api key', function(done) {
      request
        .get("/events/"+aux_id)
        .set('Accept', 'application/json')
        .expect(401)
        .expect('Content-Type', /application\/json/)
      .then((res) => {
        expect(res.body.error).to.equal(true)
        expect(res.body.message).to.equal("Unauthorized")
        done();
      }, done)
    });
    it('should not get the event info with a wrong api key', function(done) {
      const params = { 'appkey' : '123456' };
      request
        .get(helperCommon.buildGetParams("/events/"+aux_id, params))
        .set('Accept', 'application/json')
        .expect(401)
        .expect('Content-Type', /application\/json/)
      .then((res) => {
        expect(res.body.error).to.equal(true)
        expect(res.body.message).to.equal("Unauthorized")
        done();
      }, done)
    });
    it('should obtain an event with all its info when that event was not created from our app', function(done) {
      const params = { 'appkey' : helperCommon.appkey };
      request
        .get(helperCommon.buildGetParams("/events/"+aux_id, params))
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
        expect(eventResponse).to.have.property('takes')
          .and.to.be.at.least(1);

        expect(eventResponse).to.have.property('images');
        const eventResponseImage = eventResponse.images.image;
        if(eventResponseImage) {
          expect(eventResponseImage).to.have.property('large');
          expect(eventResponseImage).to.have.property('medium');
          expect(eventResponseImage).to.have.property('thumb');
        }

        expect(eventResponse).to.have.property('free')
        expect(eventResponse).to.have.property('price')
        expect(eventResponse).to.have.property('number_attendances', 0)
        expect(eventResponse).to.have.property('wanted_attendance')
        expect(eventResponse).to.have.property('checkin_done')
          .and.to.not.be.null;
        expect(eventResponse).not.to.have.property('links')
        expect(eventResponse).not.to.have.property('performers')

        done();
      }, done)
    });
  });

  describe('GET /events/user/', function() {
    it('should not get a list of events without the api key', function(done) {
      const params = {
        'token' : '5ba039ba572efb08d6442074d7d478d5',
        'uid' : 1,
        'provider' : 'provider',
        'page_size' : 20
      };
      request
        .get(helperCommon.buildGetParams("/events/user/", params))
        .set('Accept', 'application/json')
        .expect(401)
        .expect('Content-Type', /application\/json/)
      .then((res) => {
        expect(res.body.error).to.equal(true)
        expect(res.body.message).to.equal("Unauthorized")
        done();
      }, done)
    });
    it('should not get a list of events with a wrong api key', function(done) {
      const params = {
        'token' : '5ba039ba572efb08d6442074d7d478d5',
        'appkey' : "123456",
        'uid' : 1,
        'provider' : 'provider',
        'page_size' : 20
      };
      request
        .get(helperCommon.buildGetParams("/events/user/", params))
        .set('Accept', 'application/json')
        .expect(401)
        .expect('Content-Type', /application\/json/)
      .then((res) => {
        expect(res.body.error).to.equal(true)
        expect(res.body.message).to.equal("Unauthorized")
        done();
      }, done)
    });
    it('should obtain all events from a user', function(done) {
      const params = {
        'token' : '5ba039ba572efb08d6442074d7d478d5',
        'appkey' : helperCommon.appkey,
        'uid' : 1,
        'provider' : 'provider',
        'page_size' : 20
      };
      request
        .get(helperCommon.buildGetParams("/events/user/", params))
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /application\/json/)
      .then((res) => {
        expect(res.body).to.have.property('total_items');
        expect(res.body).to.have.property('number_checkins').and.to.be.at.least(0);
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
        expect(eventResponse).to.have.property('takes')
          .and.to.be.at.least(1);

        expect(eventResponse).to.have.property('images');
        const eventResponseImage = eventResponse.images;
        if(eventResponseImage) {
          expect(eventResponseImage).to.have.property('large');
          expect(eventResponseImage).to.have.property('medium');
          expect(eventResponseImage).to.have.property('thumb');
        }

        expect(eventResponse).to.have.property('free')
        expect(eventResponse).to.have.property('price')
        //expect(eventResponse).to.have.property('wanted_attendance', 1)
        expect(eventResponse).to.have.property('checkin_done', 1)
        expect(eventResponse).to.have.property('time_checkin');
        expect(['08:04', '13:32']).to.include(eventResponse.time_checkin);
        expect(eventResponse).to.have.property('number_attendances').and.to.be.at.least(1);
        expect(eventResponse).not.to.have.property('links')
        expect(eventResponse).not.to.have.property('performers')

        done();
      }, done)
    });
  });

  describe('POST /events/user/', function() {
    it('should not create an attendance without the api key', function(done) {
      const params = {
        'token' : '5ba039ba572efb08d6442074d7d478d5',
        'uid' : 1,
        'provider' : 'provider',
        'event_id' : 'E0-001-093875660-9'
      };
      request
        .post('/events/user')
        .set('Accept', 'application/json')
        .send(params)
        .expect(401)
        .expect('Content-Type', /application\/json/)
      .then((res) => {
        expect(res.body.error).to.equal(true)
        expect(res.body.message).to.equal("Unauthorized")
        done();
      }, done)
    });
    it('should not create an attendance with a wrong api key', function(done) {
      const params = {
        'token' : '5ba039ba572efb08d6442074d7d478d5',
        'appkey' : '123456',
        'uid' : 1,
        'provider' : 'provider',
        'event_id' : 'E0-001-093875660-9'
      };
      request
        .post('/events/user')
        .set('Accept', 'application/json')
        .send(params)
        .expect(401)
        .expect('Content-Type', /application\/json/)
      .then((res) => {
        expect(res.body.error).to.equal(true)
        expect(res.body.message).to.equal("Unauthorized")
        done();
      }, done)
    });
    it('should create an attendance from a user to an event', function(done) {
      const params = {
        'token' : '5ba039ba572efb08d6442074d7d478d5',
        'appkey' : helperCommon.appkey,
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
        expect(attendanceResponse).to.have.property('takes')
          .and.to.be.at.least(1);
        expect(attendanceResponse).to.have.property('checkin_done', 0);
        expect(attendanceResponse).to.have.property('time_checkin', null);
        done();
      }, done)
    });
  });

  describe('PUT /events/:id/user/ for the check-ins', function() {
    it('should not mark the check-in without the api key', function(done) {
      const params = {
        'token' : '5ba039ba572efb08d6442074d7d478d5',
        'uid' : 1,
        'provider' : 'provider',
        'checkin_done' : '1',
        'time_checkin' : '09:36'
      };
      request
        .put('/events/'+aux_id+'/user')
        .set('Accept', 'application/json')
        .send(params)
        .expect(401)
        .expect('Content-Type', /application\/json/)
      .then((res) => {
        expect(res.body.error).to.equal(true)
        expect(res.body.message).to.equal("Unauthorized")
        done();
      }, done)
    });
    it('should not mark the check-in with a wrong api key', function(done) {
      const params = {
        'token' : '5ba039ba572efb08d6442074d7d478d5',
        'appkey' : '123456',
        'uid' : 1,
        'provider' : 'provider',
        'checkin_done' : '1',
        'time_checkin' : '09:36'
      };
      request
        .put('/events/'+aux_id+'/user')
        .set('Accept', 'application/json')
        .send(params)
        .expect(401)
        .expect('Content-Type', /application\/json/)
      .then((res) => {
        expect(res.body.error).to.equal(true)
        expect(res.body.message).to.equal("Unauthorized")
        done();
      }, done)
    });
    it('should mark the check-in of an event from a user', function(done) {
      aux_id = 'E0-001-093875660-9';
      const params = {
        'token' : '5ba039ba572efb08d6442074d7d478d5',
        'appkey' : helperCommon.appkey,
        'uid' : 1,
        'provider' : 'provider',
        'checkin_done' : '1',
        'time_checkin' : '09:36'
      };
      request
        .put('/events/'+aux_id+'/user')
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      .then((res) => {
        expect(res.body).to.have.property('attendance');
        const attendanceResponse = res.body.attendance;
        expect(attendanceResponse).to.have.property('event_id', aux_id);
        expect(attendanceResponse).to.have.property('uid', params.uid);
        expect(attendanceResponse).to.have.property('provider', params.provider);
        expect(attendanceResponse).to.have.property('checkin_done', params.checkin_done);
        expect(attendanceResponse).to.have.property('time_checkin', params.time_checkin);
        expect(attendanceResponse).to.have.property('new_takes').and.to.be.at.least(1);
        expect(attendanceResponse).to.have.property('total_takes').and.to.be.at.least(1);
        expect(attendanceResponse).to.have.property('experience').and.to.be.at.least(1);
        expect(attendanceResponse).to.have.property('level').and.to.be.at.least(1);
        expect(attendanceResponse).to.have.property('achievement');
        done();
      }, done)
    })
    it('should mark the check-in of an event from a user when the assitance was not done', function(done) {
      aux_id = 'E0-001-093875660-9';
      const params = {
        'token' : '5ba039ba572efb08d6442074d7d478d5',
        'appkey' : helperCommon.appkey,
        'uid' : 1,
        'provider' : 'provider',
        'checkin_done' : '1',
        'time_checkin' : '09:36'
      };
      request
        .put('/events/E0-001-096784716-9/user')
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      .then((res) => {
        expect(res.body).to.have.property('attendance');
        const attendanceResponse = res.body.attendance;
        expect(attendanceResponse).to.have.property('event_id', 'E0-001-096784716-9');
        expect(attendanceResponse).to.have.property('uid', params.uid);
        expect(attendanceResponse).to.have.property('provider', params.provider);
        expect(attendanceResponse).to.have.property('checkin_done', params.checkin_done);
        expect(attendanceResponse).to.have.property('time_checkin', params.time_checkin);
        expect(attendanceResponse).to.have.property('new_takes').and.to.be.at.least(1);
        expect(attendanceResponse).to.have.property('total_takes').and.to.be.at.least(1);
        expect(attendanceResponse).to.have.property('experience').and.to.be.at.least(1);
        expect(attendanceResponse).to.have.property('level').and.to.be.at.least(1);
        expect(attendanceResponse).to.have.property('achievement');
        done();
      }, done)
    })
  });

  describe('PUT /events/:id/user/ for earning achievements with many check-ins for a category', function() {
    const array_event_ids = [
      "E0-001-096944568-2", "E0-001-094326294-6", "E0-001-096289239-5",
      "E0-001-096692991-6@2017030319", "E0-001-096647444-3", "E0-001-096919282-3",
      "E0-001-096802626-8", "E0-001-096857379-3", "E0-001-096802631-0"
    ];
    const params = {
      'token' : '364b99c40b84b5207e89a207a606720a',
      'appkey' : helperCommon.appkey,
      'uid' : 3,
      'provider' : 'provider',
      'checkin_done' : '1',
      'time_checkin' : '23:50'
    };

    before(function(done) {
      deleteAttendancesAndAcquisitionsFromTestsForUser3();
      request
        .put('/events/' + array_event_ids[0] + '/user')
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      .then((res) => {
        return request
        .put('/events/' + array_event_ids[1] + '/user')
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      })
      .then((res) => {
        return request
        .put('/events/' + array_event_ids[2] + '/user')
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      })
      .then((res) => {
        return request
        .put('/events/' + array_event_ids[3] + '/user')
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      })
      .then((res) => {
        return request
        .put('/events/' + array_event_ids[4] + '/user')
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      })
      .then((res) => {
        return request
        .put('/events/' + array_event_ids[5] + '/user')
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      })
      .then((res) => {
        return request
        .put('/events/' + array_event_ids[6] + '/user')
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      })
      .then((res) => {
        return request
        .put('/events/' + array_event_ids[7] + '/user')
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      })
      .then((res) => {
        return request
        .put('/events/' + array_event_ids[8] + '/user')
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      })
      .then((res) => {
        done();
      })
    });

    it('should earn an achievement when the required number of attended events is reached', function(done) {
      const event_id = 'E0-001-096784716-9';
      request
        .put('/events/'+event_id+'/user')
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      .then((res) => {
        expect(res.body).to.have.property('attendance');
        const attendanceResponse = res.body.attendance;
        expect(attendanceResponse).to.have.property('event_id', event_id);
        expect(attendanceResponse).to.have.property('checkin_done', '1');
        expect(attendanceResponse).to.have.property('time_checkin', params.time_checkin);
        expect(attendanceResponse).to.have.property('new_takes').and.to.be.at.least(1 + 100);
        expect(attendanceResponse).to.have.property('total_takes').and.to.be.at.least(10 + 100);
        expect(attendanceResponse).to.have.property('experience').and.to.be.at.least(10 + 100);
        expect(attendanceResponse).to.have.property('level').and.to.be.at.least(1);
        expect(attendanceResponse).to.have.property('achievement');
        const earnedAchievement = attendanceResponse.achievement;
        expect(earnedAchievement).to.have.property('id', 'music_10');
        expect(earnedAchievement).to.have.property('name', 'Interesado en Música.');
        expect(earnedAchievement).to.have.property('description', 'Has asistido a 10 eventos de Música.');
        expect(earnedAchievement).to.have.property('takes', 100);
        expect(earnedAchievement).to.have.property('category_id', 'music');
        expect(earnedAchievement).to.have.property('number_required_attendances', 10);
        done();
      }, done)
    })
  });

  describe('DELETE /events/:id/user/', function() {
    after(function(done) {
      const params = {
        'token' : '5ba039ba572efb08d6442074d7d478d5',
        'appkey' : helperCommon.appkey,
        'uid' : 1,
        'provider' : 'provider',
        'event_id' : 'E0-001-096844204-0@2016102500'
      };
      request
        .post('/events/user')
        .set('Accept', 'application/json')
        .send(params)
        .expect(201)
        .then(() => {done();})
    });
    it('should not delete an event without an appkey', function(done) {
      aux_id = 'E0-001-096844204-0@2016102500';
      const params = {
        'token' : '5ba039ba572efb08d6442074d7d478d5',
        'uid' : 1,
        'provider' : 'provider'
      };
      request
        .delete('/events/'+aux_id+'/user')
        .set('Accept', 'application/json')
        .send(params)
        .expect(401)
        .expect('Content-Type', /application\/json/)
      .then((res) => {
        expect(res.body.error).to.equal(true)
        expect(res.body.message).to.equal("Unauthorized")
        done();
      }, done)
    });
    it('should not delete an event with a wrong appkey', function(done) {
      aux_id = 'E0-001-096844204-0@2016102500';
      const params = {
        'token' : '5ba039ba572efb08d6442074d7d478d5',
        'appkey' : '123456',
        'uid' : 1,
        'provider' : 'provider'
      };
      request
        .delete('/events/'+aux_id+'/user')
        .set('Accept', 'application/json')
        .send(params)
        .expect(401)
        .expect('Content-Type', /application\/json/)
      .then((res) => {
        expect(res.body.error).to.equal(true)
        expect(res.body.message).to.equal("Unauthorized")
        done();
      }, done)
    });
    it('should delete an event from a user with the check-in not done', function(done) {
      aux_id = 'E0-001-096844204-0@2016102500';
      const params = {
        'token' : '5ba039ba572efb08d6442074d7d478d5',
        'appkey' : helperCommon.appkey,
        'uid' : 1,
        'provider' : 'provider'
      };
      request
        .delete('/events/'+aux_id+'/user')
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      .then((res) => {

        expect(res.body).to.be.empty

        done();
      }, done)
    });
    it('should not delete an event from a user with the check-in done', function(done) {
      aux_id = 'E0-001-093875660-9' // no ha de deixar, perquè té check-in
      const params = {
        'token' : '5ba039ba572efb08d6442074d7d478d5',
        'appkey' : helperCommon.appkey,
        'uid' : 1,
        'provider' : 'provider'
      };
      request
        .delete('/events/'+aux_id+'/user')
        .set('Accept', 'application/json')
        .send(params)
        .expect(403)
        .expect('Content-Type', /application\/json/)
      .then((res) => {

        expect(res.body).to.have.property('error')
          .and.to.be.eql("No es pot desmarcar l'assitència si ja s'ha fet el check-in");

        done();
      }, done)
    });
  });


});
