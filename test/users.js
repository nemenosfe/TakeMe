"use strict"
let request = require('supertest-as-promised');
const api = require('../app');
const host = api;

request = request(host);

describe('Users route', function() {

    this.timeout(120000);

    var random = Math.floor((Math.random() * 1000) + 1);
    var randomemail = 'email' + random + '@test.com';

    describe('GET /users', function() {
        it('should return all users', function(done) {
            request
                .get('/users')
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
                expect(user).to.have.property('surname');
                expect(user).to.have.property('email');
                expect(user).to.have.property('takes');
                expect(user).to.have.property('experience');
                expect(user).to.have.property('level');
                done();
            }, done)
        });
    });

    describe('GET /users/:id', function() {
        it('should return a certain user', function(done) {
            request
                .get('/users/31-providerTest')
                .set('Accept', 'application/json')
                .expect(200)
                .expect('Content-Type', /application\/json/)
            .then((res) => {
                expect(res.body).to.have.property('user');
                const user = res.body.user;
                expect(user).to.have.property('uid', 31);
                expect(user).to.have.property('provider', 'providerTest');
                expect(user).to.have.property('name', 'nameTest');
                expect(user).to.have.property('surname', 'surnameTest');
                expect(user).to.have.property('email', 'email31@test.com');
                expect(user).to.have.property('takes', 0);
                expect(user).to.have.property('experience', 0);
                expect(user).to.have.property('level', 1);
                done();
            }, done)
        });
    });

    describe('POST /users', function() {
        it('should create a new user', function(done) {
            const params = {
                'uid' : random,
                'provider' : 'providerTest',
                'name' : 'nameTest',
                'surname' : 'surnameTest',
                'email' : randomemail
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
                expect(userResponse).to.have.property('uid', params.uid);
                expect(userResponse).to.have.property('provider', params.provider);
                expect(userResponse).to.have.property('name', params.name);
                expect(userResponse).to.have.property('surname', params.surname);
                expect(userResponse).to.have.property('email', params.email);
                expect(userResponse).to.have.property('takes', 0);
                expect(userResponse).to.have.property('experience', 0);
                expect(userResponse).to.have.property('level', 1);
                done();
            }, done)
        });
    });

    describe('PUT /users/:id', function(done) {
        it.only('should update a user information', function() {
            var updatedMail = "updated" + 31 + "@test.com";
            const params = {
                'name' : 'updatedName',
                'surname' : 'updatedSurname',
                'email' : updatedMail
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
                expect(user).to.have.property('uid', 31);
                expect(user).to.have.property('provider', 'providerTest');
                expect(user).to.have.property('name', params.name);
                expect(user).to.have.property('surname', params.surname);
                expect(user).to.have.property('email', params.email);
                done();
            }, done)
        });
    });
});
