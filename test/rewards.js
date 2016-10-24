"use strict"
let request = require('supertest-as-promised');
const api = require('../app');
const host = api;

request = request(host);

var aux_id = "1";

describe('route of rewards', function() {

  this.timeout(4000); // Per les proves

  describe('GET /rewards', function() {
    it('should get the whole list of rewards', function(done) {
      request
        .get('/rewards')
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /application\/json/)
      .then((res) => {

        expect(res.body).to.have.property('rewards');
        const rewards = res.body.rewards;

        expect(rewards).to.be.an('array')
          .and.to.have.length.of.at.least(3);

        const rewardResponse = rewards[0];

        expect(rewardResponse).to.have.property('name')
        expect(rewardResponse).to.have.property('description')
        expect(rewardResponse).to.have.property('takes')
        expect(rewardResponse).to.have.property('level')

        done();
      }, done)
    });
  });

  describe('GET /rewards/user/', function() { // CAL COMPROBAR EL TOKEN!!!
    it('should obtain all rewards from a user', function(done) {
      const params = {
        'uid' : 1,
        'provider' : 'provider',
        'page_size' : 20
      };
      request
        .get('/rewards/user')
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      .then((res) => {

        expect(res.body).to.have.property('total_items', 2);
        expect(res.body).to.have.property('total_rewards', 8);
        expect(res.body).to.have.property('rewards');
        const rewards = res.body.rewards;

        //console.log(JSON.stringify(res.body));

        expect(rewards).to.be.an('array')
          .and.to.have.length.of.at.least(1);
        expect(rewards).to.be.an('array')
          .and.to.have.length.of.at.most(params.page_size);

        const rewardResponse = rewards[0].reward;
        //console.log("rewardResponse: --> " + JSON.stringify(rewardResponse));
        expect(rewardResponse).to.have.property('name')
        expect(rewardResponse).to.have.property('description')
        expect(rewardResponse).to.have.property('takes')
        expect(rewardResponse).to.have.property('level')
        expect(rewardResponse).to.have.property('amount')

        done();
      }, done)
    });
  });

  describe('POST /rewards/user/', function() { // CAL COMPROBAR EL TOKEN!!!
    it.skip('should create an purchase from a user of a reward', function(done) {
      const params = {
        'uid' : 1,
        'provider' : 'provider',
        'reward_name' : 'logro 03'
      };
      request
        .post('/rewards/user')
        .set('Accept', 'application/json')
        .send(params)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      .then((res) => {
        expect(res.body).to.have.property('purchase');
        const purchaseResponse = res.body.purchase;
        expect(purchaseResponse).to.have.property('reward_name', params.reward_name);
        expect(purchaseResponse).to.have.property('uid', params.uid);
        expect(purchaseResponse).to.have.property('provider', params.provider);
        done();
      }, done)
    });
  });


});
