"use strict"
let request = require('supertest-as-promised');
const api = require('../app');
const host = api;

request = request(host);

var aux_id = "1";

describe('route of rewards', function() {

  this.timeout(4000); // Per les proves

  describe('GET /rewards', function() {
    it.only('should get the whole list of rewards', function(done) {
      request
        .get('/rewards')
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /application\/json/)
      .then((res) => {

        expect(res.body).to.have.property('rewards');
        const rewards = res.body.rewards;

        expect(rewards).to.be.an('array')
          .and.to.have.length.of.above(1)

        const rewardResponse = rewards[0];

        expect(rewardResponse).to.have.property('name')
        expect(rewardResponse).to.have.property('description')
        expect(rewardResponse).to.have.property('takes')
        expect(rewardResponse).to.have.property('level')

        done();
      }, done)
    });
  });


});
