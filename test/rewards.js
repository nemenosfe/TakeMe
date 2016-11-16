"use strict"
let request = require('supertest-as-promised');
const api = require('../app');
const host = api;

request = request(host);

var aux_id = "1";

function buildGetParams(path, params) {
  let str_params = path;
  for (var key in params) {
    str_params += (str_params == path) ? "?" : "&";
    str_params += key + "=" + params[key];
  }
  return str_params;
}

describe('route of rewards', function() {

  this.timeout(30000); // Per les proves

  describe('GET /rewards', function() {
    it('should not get the list of rewards without the app key', function(done) {
      request
        .get("/rewards/")
        .set('Accept', 'application/json')
        .expect(401)
        .expect('Content-Type', /application\/json/)
      .then((res) => {
        expect(res.body.error).to.equal(true)
        expect(res.body.message).to.equal("Unauthorized")
        done();
      }, done)
    });
    it('should not get the list of rewards with a wrong app key', function(done) {
      const params = {
        'appkey' : '123456'
      };
      request
        .get(buildGetParams("/rewards/", params))
        .set('Accept', 'application/json')
        .expect(401)
        .expect('Content-Type', /application\/json/)
      .then((res) => {
        expect(res.body.error).to.equal(true)
        expect(res.body.message).to.equal("Unauthorized")
        done();
      }, done)
    });
    it('should get the whole list of rewards', function(done) {
      const params = {
        'appkey' : '7384d85615237469c2f6022a154b7e2c'
      };
      request
        .get(buildGetParams("/rewards/", params))
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
    it('should not obtain all rewards without the api key', function(done) {
      const params = {
        'uid' : 1,
        'provider' : 'provider',
        'page_size' : 20
      };
      request
        .get(buildGetParams("/rewards/user/", params))
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
    it('should not obtain all rewards with a wrong api key', function(done) {
      const params = {
        'appkey' : '123456',
        'uid' : 1,
        'provider' : 'provider',
        'page_size' : 20
      };
      request
        .get(buildGetParams("/rewards/user/", params))
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
    it('should obtain all rewards from a user', function(done) {
      const params = {
        'appkey' : '7384d85615237469c2f6022a154b7e2c',
        'uid' : 1,
        'provider' : 'provider',
        'page_size' : 20
      };
      request
        .get(buildGetParams("/rewards/user/", params))
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      .then((res) => {
        expect(res.body).to.have.property('total_items').and.to.be.at.least(2);
        expect(res.body).to.have.property('total_rewards').and.to.be.at.least(8);
        expect(res.body).to.have.property('rewards');
        const rewards = res.body.rewards;

        expect(rewards).to.be.an('array')
          .and.to.have.length.of.at.least(1);
        expect(rewards).to.be.an('array')
          .and.to.have.length.of.at.most(params.page_size);

        const rewardResponse = rewards[0].reward;
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
    it('should not create a purchase from a user of a reward without the api key', function(done) {
      const params = {
        'uid' : 1,
        'provider' : 'provider',
        'reward_name' : 'recompensa 04',
        'amount' : 2
      };
      request
        .post('/rewards/user/')
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
    it('should not create a purchase from a user of a reward with a wrong api key', function(done) {
      const params = {
        'appkey' : '123456',
        'uid' : 1,
        'provider' : 'provider',
        'reward_name' : 'recompensa 04',
        'amount' : 2
      };
      request
        .post('/rewards/user/')
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
    it('should create a purchase from a user of a reward', function(done) {
      const params = {
        'appkey' : '7384d85615237469c2f6022a154b7e2c',
        'uid' : 1,
        'provider' : 'provider',
        'reward_name' : 'recompensa 04',
        'amount' : 2
      };
      request
        .post('/rewards/user/')
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
        expect(purchaseResponse).to.have.property('amount', params.amount);
        expect(purchaseResponse).to.have.property('total_amount');
        expect(purchaseResponse).to.have.property('takes_left');

        done();
      }, done)
    });
  });


});
