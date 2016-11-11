"use strict"
let request = require('supertest-as-promised');
const api = require('../app');
const host = api;

request = request(host);

var aux_id = "1";

describe('route of achievements', function() {

  this.timeout(4000); // Per les proves

  // ESTAN TOTES LES PROVES COM A SKIP DE MANERA TEMPORAL PERQUÈ S'HAN DE FER CANVIS

  describe('GET /achievements', function() {
    it.skip('should get the whole list of achievements', function(done) {
      request
        .get('/achievements')
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /application\/json/)
      .then((res) => {

        expect(res.body).to.have.property('achievements');
        const achievements = res.body.achievements;

        expect(achievements).to.be.an('array')
          .and.to.have.length.of.at.least(3);

        const achievementResponse = achievements[0];

        expect(achievementResponse).to.have.property('name')
        expect(achievementResponse).to.have.property('description')

        done();
      }, done)
    });
  });

  describe('GET /achievements/user/', function() { // No cal token, qualsevol usuari pot veure els logros de qualsevol usuari
    it.skip('should obtain all achievements from a user', function(done) {
      const params = {
        'uid' : 1,
        'provider' : 'provider',
        'page_size' : 20
      };
      request
        .get('/achievements/user/?uid='+params.uid+"&provider="+params.provider+"&page_size="+params.page_size)
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      .then((res) => {

        expect(res.body).to.have.property('total_items');
        expect(res.body).to.have.property('achievements');
        const achievements = res.body.achievements;

        //console.log(JSON.stringify(res.body));

        expect(achievements).to.be.an('array')
          .and.to.have.length.of.at.least(1);
        expect(achievements).to.be.an('array')
          .and.to.have.length.of.at.most(params.page_size);

        const achievementResponse = achievements[0].achievement;
        //console.log("achievementResponse: --> " + JSON.stringify(achievementResponse));
        expect(achievementResponse).to.have.property('name')
        expect(achievementResponse).to.have.property('description')

        done();
      }, done)
    });
  });

  describe('POST /achievements/user/', function() { // CAL COMPROBAR EL TOKEN!!!
    it.skip('should create an acquisition from a user of an achievement', function(done) {
      const params = {
        'uid' : 1,
        'provider' : 'provider',
        'achievement_name' : 'logro 02'
      };
      request
        .post('/achievements/user')
        .set('Accept', 'application/json')
        .send(params)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      .then((res) => {
        expect(res.body).to.have.property('acquisition');
        const acquisitionResponse = res.body.acquisition;
        expect(acquisitionResponse).to.have.property('achievement_name', params.achievement_name);
        expect(acquisitionResponse).to.have.property('uid', params.uid);
        expect(acquisitionResponse).to.have.property('provider', params.provider);
        done();
      }, done)
    });
  });

});
