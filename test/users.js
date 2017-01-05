"use strict"
let request = require('supertest-as-promised');
const api = require('../app'),
      helperCommon = require('./helpers/common');
request = request(api);

describe('Users route', function() {

  this.timeout(120000);

  describe('POST /users', function() {
    let token;
    after(function(done) {
      const params = { appkey: helperCommon.appkey, token };
      request
        .delete('/users/32-providerTest2')
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .then((res) => { expect(res.body).to.be.empty; done(); })
    });
    it("should create a new user when it doesn't exist", function(done) {
      const params = {
        'appkey': helperCommon.appkey,
        'uid': 32,
        'provider': 'providerTest2',
        'name': 'nameTest2'
      };
      request
        .post('/users')
        .set('Accept', 'application/json')
        .send(params)
        .expect(201)
        .expect('Content-Type', /application\/json/)
        .then((res) => {
          expect(res.body).to.have.property('user');
          const userResponse = res.body.user;
          expect(userResponse).to.have.property('uid', params.uid.toString());
          expect(userResponse).to.have.property('provider', params.provider);
          expect(userResponse).to.have.property('name', params.name);
          expect(userResponse).to.have.property('takes', 0);
          expect(userResponse).to.have.property('experience', 0);
          expect(userResponse).to.have.property('level', 1);
          expect(userResponse).to.have.property('new_user', true); // És un nou usuari
          expect(userResponse).to.have.property('token');
          token = userResponse.token;
          done();
        }, done)
    });
    it('should update the token when the user exists', function(done) {
      const params = {
        'appkey': helperCommon.appkey,
        'uid': 32,
        'provider': 'providerTest2',
        'name': 'nameTest2'
      };
      request
        .post('/users')
        .set('Accept', 'application/json')
        .send(params)
        .expect(201)
        .expect('Content-Type', /application\/json/)
        .then((res) => {
          expect(res.body).to.have.property('user');
          const userResponse = res.body.user;
          expect(userResponse).to.have.property('uid', params.uid.toString());
          expect(userResponse).to.have.property('provider', params.provider);
          expect(userResponse).to.have.property('name', params.name);
          expect(userResponse).to.have.property('takes', 0);
          expect(userResponse).to.have.property('experience', 0);
          expect(userResponse).to.have.property('level', 1);
          expect(userResponse).to.have.property('new_user', false); // No és un nou usuari
          expect(userResponse).to.have.property('token').and.not.to.eql(token);
          token = userResponse.token;
          done();
        }, done)
    });
  });

  describe('GET /users', function() {
    it('should return all users', function(done) {
      request
        .get('/users?appkey=' + helperCommon.appkey)
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .then((res) => {
          expect(res.body).to.have.property('users');
          const users = res.body.users;
          expect(users).to.be.an('array');
          const user = users[0];
          expect(user).to.have.property('uid');
          expect(user).to.have.property('provider');
          expect(user).to.have.property('name');
          expect(user).to.have.property('takes');
          expect(user).to.have.property('experience');
          expect(user).to.have.property('level');
          done();
        }, done)
    });
  });

  describe('GET /users/:id', function() {
    let token;
    before(function(done) {
      const params = {
        'appkey': helperCommon.appkey,
        'uid': 33,
        'provider': 'providerTest2',
        'name': 'nameTest3'
      };
      request
        .post('/users')
        .set('Accept', 'application/json')
        .send(params)
        .expect(201)
        .then((res) => {
          expect(res.body).to.have.property('user');
          const userResponse = res.body.user;
          token = userResponse.token;
          expect(userResponse).to.have.property('uid', params.uid.toString());
          expect(userResponse).to.have.property('provider', params.provider);
          expect(userResponse).to.have.property('new_user');
          done();
        });
    });
    after(function(done) {
      const params = { appkey: helperCommon.appkey, token };
      request
        .delete('/users/33-providerTest2')
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .then((res) => { expect(res.body).to.be.empty; done(); })
    });
    it('should return a certain user', function(done) {
      request
        .get('/users/33-providerTest2?appkey=' + helperCommon.appkey)
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .then((res) => {
          expect(res.body).to.have.property('user');
          const user = res.body.user;
          expect(user).to.have.property('uid', '33');
          expect(user).to.have.property('provider', 'providerTest2');
          expect(user).to.have.property('name', 'nameTest3');
          expect(user).to.have.property('takes', 0);
          expect(user).to.have.property('experience', 0);
          expect(user).to.have.property('level', 1);
          expect(user).to.have.property('experience_of_next_level')
            .and.to.be.at.least(0.60);
          done();
        }, done)
    });
  });

  describe('PUT /users/:id', function() {
    let token;
    before(function(done) {
      const params = {
        'appkey': helperCommon.appkey,
        'uid': 31,
        'provider': 'providerTest',
        'name': 'nameTest'
      };
      request
        .post('/users')
        .set('Accept', 'application/json')
        .send(params)
        .expect(201)
        .then((res) => { token = res.body.user.token; done(); })
    });
    after(function(done) {
      const params = { appkey: helperCommon.appkey, token };
      request
        .delete('/users/31-providerTest')
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .then((res) => { expect(res.body).to.be.empty; done(); })
    });
    it('should update a user information', function(done) {
      const updatedName = "updated31",
            params = {
              'appkey': helperCommon.appkey,
              'name': updatedName,
              token
            };
      request
        .put('/users/31-providerTest')
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .then((res) => {
          expect(res.body).to.have.property('user');
          const user = res.body.user;
          expect(user).to.have.property('uid', '31');
          expect(user).to.have.property('provider', 'providerTest');
          expect(user).to.have.property('name', params.name);
          done();
        }, done)
    });
  });

  describe('DELETE users/:id', function() {
    let token;
    before(function(done) {
      const params = {
        'appkey': helperCommon.appkey,
        'uid': 31,
        'provider': 'providerTest',
        'name': 'nameTest'
      };
      request
        .post('/users')
        .set('Accept', 'application/json')
        .send(params)
        .expect(201)
        .then((res) => { token = res.body.user.token; done(); })
    });
    it('should delete a user', function(done) {
      const params = { appkey: helperCommon.appkey, token };
      request
        .delete('/users/31-providerTest')
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .then((res) => {
          expect(res.body).to.be.empty;
          done();
        }, done)
    });
  });

  describe('POST /users/:id/preferences', function() {
    const uid = 2, provider = 'provider';
    after(function(done) {
      const params = { appkey: helperCommon.appkey, token: 'randomToken' };
      request
        .delete(`/users/${uid}-${provider}/preferences`)
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .then((res) => { expect(res.body).to.be.empty; done(); })
    });
    it("should create the identified user's preferences", function(done) {
      const params = {
        'appkey': helperCommon.appkey,
        'token': 'randomToken',
        'categories': 'music||comedy||art||sports',
        'locations': 'Barcelona||Madrid||Bilbao'
      };
      request
        .post(`/users/${uid}-${provider}/preferences`)
        .set('Accept', 'application/json')
        .send(params)
        .expect(201)
        .expect('Content-Type', /application\/json/)
        .then((res) => {
          expect(res.body).to.have.property('preferences');
          const preferencesResponse = res.body.preferences;
          expect(preferencesResponse).to.have.property('uid', uid.toString());
          expect(preferencesResponse).to.have.property('provider', provider.toString());
          expect(preferencesResponse).to.have.property('categories', params.categories);
          expect(preferencesResponse).to.have.property('locations', params.locations);
          done();
        }, done)
    });
  });

  describe('DELETE /users/:id/preferences', function() {
    const uid = 2, provider = 'provider';
    before(function(done) {
      const params = {
        'appkey': helperCommon.appkey,
        'token': 'randomToken',
        'categories': 'music||comedy||art||sports',
        'locations': 'Barcelona||Madrid||Bilbao'
      };
      request
        .post(`/users/${uid}-${provider}/preferences`)
        .set('Accept', 'application/json')
        .send(params)
        .expect(201)
        .expect('Content-Type', /application\/json/)
        .then((res) => { done(); })
    });
    it("should delete the identified user's preferences", function(done) {
      const params = { appkey: helperCommon.appkey, token: 'randomToken' };
      request
        .delete(`/users/${uid}-${provider}/preferences`)
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .then((res) => {
          expect(res.body).to.be.empty;
          done();
        }, done)
    });
  });

  describe('GET /users/:id/preferences', function() {
    const uid = 2, provider = 'provider',
    categories = 'music||comedy||art||sports',
    locations = 'Barcelona||Madrid||Bilbao';
    before(function(done) { // Abans: crea la preference
      const params = {
        'appkey': helperCommon.appkey,
        'token': 'randomToken',
        categories,
        locations
      };
      request
        .post(`/users/${uid}-${provider}/preferences`)
        .set('Accept', 'application/json')
        .send(params)
        .expect(201)
        .expect('Content-Type', /application\/json/)
        .then((res) => { done(); })
    });
    after(function(done) { // Després: elimina la preference
      const params = { appkey: helperCommon.appkey, token: 'randomToken' };
      request
        .delete(`/users/${uid}-${provider}/preferences`)
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .then((res) => { expect(res.body).to.be.empty; done(); })
    });
    it("should return a certain user's preferences", function(done) {
      request
        .get(`/users/${uid}-${provider}/preferences?appkey=${helperCommon.appkey}&token=randomToken`)
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .then((res) => {
          expect(res.body).to.have.property('preferences');
          const preferencesResponse = res.body.preferences;
          expect(preferencesResponse).to.have.property('uid', uid.toString());
          expect(preferencesResponse).to.have.property('provider', provider.toString());
          expect(preferencesResponse).to.have.property('categories', categories);
          expect(preferencesResponse).to.have.property('locations', locations);
          done();
        }, done)
    });
  });

  describe('PUT /users/:id/preferences', function() {
    const uid = 2, provider = 'provider';
    let categories = 'music||comedy||art||sports',
    locations = 'Barcelona||Madrid||Bilbao';
    before(function(done) { // Abans: crea la preference
      const params = {
        'appkey': helperCommon.appkey,
        'token': 'randomToken',
        categories,
        locations
      };
      request
        .post(`/users/${uid}-${provider}/preferences`)
        .set('Accept', 'application/json')
        .send(params)
        .expect(201)
        .expect('Content-Type', /application\/json/)
        .then((res) => { done(); })
    });
    after(function(done) { // Després: elimina la preference
      const params = { appkey: helperCommon.appkey, token: 'randomToken' };
      request
        .delete(`/users/${uid}-${provider}/preferences`)
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .then((res) => { expect(res.body).to.be.empty; done(); })
    });
    it('should update a user preferences', function(done) {
      categories = "music||learning_education";
      const params = {
        'appkey': helperCommon.appkey,
        'token': 'randomToken',
        categories
      };
      request
        .put(`/users/${uid}-${provider}/preferences`)
        .set('Accept', 'application/json')
        .send(params)
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .then((res) => {
          expect(res.body).to.have.property('preferences');
          const preferencesResponse = res.body.preferences;
          expect(preferencesResponse).to.have.property('uid', uid.toString());
          expect(preferencesResponse).to.have.property('provider', provider.toString());
          expect(preferencesResponse).to.have.property('categories', categories);
          expect(preferencesResponse).to.have.property('locations', locations);
          done();
        }, done)
    });
  });

});
