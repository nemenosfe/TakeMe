"use strict"
let request = require('supertest-as-promised');
const api = require('../app');
const host = api;

request = request(host);

var aux_id = "1";

describe('route of achievements', function() {

  this.timeout(4000); // Per les proves

  describe('GET /achievements', function() {
    it('should get the whole list of achievements', function(done) {
      request
        .get('/achievements/?appkey=7384d85615237469c2f6022a154b7e2c')
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /application\/json/)
      .then((res) => {

        expect(res.body).to.have.property('achievements');
        const achievements = res.body.achievements;

        expect(achievements).to.be.an('array')
          .and.to.have.length.of.at.least(3);

        const achievementResponse = achievements[0];

        expect(achievementResponse).to.have.property('id')
        expect(achievementResponse).to.have.property('name')
        expect(achievementResponse).to.have.property('description')
        expect(achievementResponse).to.have.property('takes')

        done();
      }, done)
    });
  });

  describe('GET /achievements/user/', function() { // No cal token, qualsevol usuari pot veure els logros de qualsevol usuari
    it('should obtain all achievements from a user', function(done) {
      const params = {
        'uid' : 1,
        'provider' : 'provider',
        'page_size' : 20
      };
      request
        .get('/achievements/user/?appkey=7384d85615237469c2f6022a154b7e2c&uid='+params.uid+"&provider="+params.provider+"&page_size="+params.page_size)
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
        expect(achievementResponse).to.have.property('id')
        expect(achievementResponse).to.have.property('takes')
        expect(achievementResponse).to.have.property('description')

        done();
      }, done)
    });
  });

  describe('POST /achievements/user/', function() {
    it('should create an acquisition from a user of an achievement', function(done) {
      const params = {
        'appkey' : '7384d85615237469c2f6022a154b7e2c',
        'token' : '5ba039ba572efb08d6442074d7d478d5',
        'uid' : 1,
        'provider' : 'provider',
        'achievement_id' : 'sales_10'
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
        expect(acquisitionResponse).to.have.property('achievement_id', params.achievement_id);
        expect(acquisitionResponse).to.have.property('uid', params.uid);
        expect(acquisitionResponse).to.have.property('provider', params.provider);
        done();
      }, done)
    });
  });

});
