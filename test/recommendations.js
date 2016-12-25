"use strict"
let request = require('supertest-as-promised');
const api = require('../app'),
      helperCommon = require('./helpers/common');
request = request(api);

const default_page_size = 20;

describe('Recommendations route', function() {

  this.timeout(120000);

  describe('GET /recommendations', function() {
    const paramsWP = {
        uid: 2,
        provider: 'provider',
        token: 'randomToken'
      },
      categories = 'music||comedy||art||sports',
      locations = 'Barcelona||Madrid||Bilbao';

    before(function(done) { // Abans: crea la preference
      const postParams = {
        appkey: helperCommon.appkey,
        token: paramsWP.token,
        categories,
        locations
      };
      request
        .post(`/users/${paramsWP.uid}-${paramsWP.provider}/preferences`)
        .set('Accept', 'application/json')
        .send(postParams)
        .expect(201)
        .expect('Content-Type', /application\/json/)
        .then((res) => { done(); })
    });
    after(function(done) { // Després: elimina la preference
      const deleteParams = {
        appkey: helperCommon.appkey,
        token: paramsWP.token
      };
      request
        .delete(`/users/${paramsWP.uid}-${paramsWP.provider}/preferences`)
        .set('Accept', 'application/json')
        .send(deleteParams)
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .then((res) => {
          expect(res.body).to.be.empty;
          done();
        })
    });

    it(`returns ${default_page_size} events with the selected preferences`, function(done) {
      request
        .get(`/recommendations/${paramsWP.uid}-${paramsWP.provider}?appkey=${helperCommon.appkey}&token=${paramsWP.token}`)
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .then((res) => {
          expect(res.body).to.have.property('events');
          const events = res.body.events;

          expect(events).to.be.an('array')
            .and.to.have.length.of(default_page_size);

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
          expect(eventResponse).to.have.property('takes')
            .and.to.be.at.least(1);
          expect(eventResponse).to.have.property('images')
          //expect(eventResponse).to.have.property('price')
          expect(eventResponse).to.have.property('number_attendances')
            .and.to.be.an.integer;
          expect(eventResponse).not.to.have.property('links')
          expect(eventResponse).not.to.have.property('performers')
          done();
        }, done)
    });

    it(`returns ${default_page_size} random events without selected preferences`, function(done) {
      const paramsWOP = {
        uid: 1,
        provider: 'provider',
        token: '5ba039ba572efb08d6442074d7d478d5'
      };

      request
        .get(`/recommendations/${paramsWOP.uid}-${paramsWOP.provider}?appkey=${helperCommon.appkey}&token=${paramsWOP.token}`)
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .then((res) => {
          expect(res.body).to.have.property('events');
          const events = res.body.events;

          expect(events).to.be.an('array')
            .and.to.have.length.of(default_page_size);

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
          expect(eventResponse).to.have.property('takes')
            .and.to.be.at.least(1);
          expect(eventResponse).to.have.property('images')
          //expect(eventResponse).to.have.property('price')
          expect(eventResponse).to.have.property('number_attendances')
            .and.to.be.an.integer;
          expect(eventResponse).not.to.have.property('links')
          expect(eventResponse).not.to.have.property('performers')

          expect(categories).to.include(eventResponse.categories.category[0].id);
          done();
        }, done)
    });
  });
});
