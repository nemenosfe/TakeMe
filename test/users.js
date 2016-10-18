"use strict"
let request = require('supertest-as-promised');
const api = require('../app');
const host = api;
const mysql = require('promise-mysql');

request = request(host);

var pool  = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : '12345678',
  database : 'takemelegends'
});

describe('Users route', function() {

    describe('POST /users', function() {
        it('should create a user', function(done) {
            this.timeout(5000);

            let user = {
                'id': 1,
                'provider': 'twitter',
                'name': 'name',
                'name': 'surname'
            }

            pool.getConnection().then(function(mysqlConnection) {
                mysqlConnection.query("DROP TABLE IF EXISTS users")
                .then((res) => {
                })
                .catch((err) => {
                    console.log("Error: " + JSON.stringify(err));
                })
                .finally(() => {
                    request
                        .post('/users')
                        .set('Accept', 'application/json')
                        .send(user)
                        .expect(201)
                        .expect('Content-Type', /application\/json/)
                        .end((err, res) => {
                            let body = res.body
                            expect(body).to.have.property('user')
                            user = body.user
                            expect(user).to.have.property('id', 1)
                            expect(user).to.have.property('provider', 'twitter')
                            expect(user).to.have.property('name', 'name')
                            expect(user).to.have.property('surname', 'surname')
                            done(err)
                        })
                });
            });
        })
    })

    describe('GET /users', function() {
        it('should get all the users', function(done) {
            this.timeout(5000);

            pool.getConnection().then(function(mysqlConnection) {
                mysqlConnection.query("DROP TABLE IF EXISTS users")
                .then((res) => {
                    return mysqlConnection.query("CREATE TABLE users(id int NOT NULL, provider varchar(255) NOT NULL, name varchar(30) NOT NULL, surname varchar(30), PRIMARY KEY (ID));")
                })
                .then((res) => {
                    return mysqlConnection.query("INSERT INTO users SET ?", {id: 1, provider: "provider 01", name: "name 01", surname: "surname 01"})
                })
                .then((res) => {
                    return mysqlConnection.query("INSERT INTO users SET ?", {id: 2, provider: "provider 02", name: "name 02", surname: "surname 02"})
                })
                .then((res) => {

                })
                .catch((err) => {
                    console.log("Error: " + JSON.stringify(err));
                })
                .finally(() => {
                    request
                        .get('/users')
                        .set('Accept', 'application/json')
                        .expect(200)
                        .expect('Content-Type', /application\/json/)
                    .then((res) => {
                        let body = res.body
                        expect(body).to.have.property('users')
                        expect(body.users).to.be.an('array');
                        expect(Object.keys(body.users).length).to.eql(2);
                        let users = body.users;

                        expect(users[0]).to.have.property('id', 1)
                        expect(users[0]).to.have.property('provider', 'provider 01')
                        expect(users[0]).to.have.property('name', 'name 01')
                        expect(users[0]).to.have.property('surname', 'surname 01')

                        expect(users[0]).to.have.property('id', 2)
                        expect(users[0]).to.have.property('provider', 'provider 02')
                        expect(users[0]).to.have.property('name', 'name 02')
                        expect(users[0]).to.have.property('surname', 'surname 02')
                        done();
                    }, done)
                });
            });
        });
    });
})
