const should = require("should");
const mongoose = require('mongoose');
const Account = require("../models/account.js");
const Loads = require("../models/load.js");
const app      = require("../app");
const request  = require("supertest");
const agent = request.agent(app);
const expect = require('chai').expect;
const Q = require("q");

describe('Account', () => {

    beforeEach( (done) => {
        var tasks = [];
        for(i=0; i < 3; i++ ) {
            var account = new Account({
                username: 'c' + i,
                password: 'cat',
                type: 'Carrier',
                carrierId: 'c' + i,
                driverId: '',
                trustedOwnerOperators: ['o'+i, 'o' + (i + 1)]
            });
            tasks.push(account.save());
        }

        for(i=0; i < 6; i++ ) {
            var account = new Account({
                username: 'o' + i,
                password: 'pet',
                type: 'OwnerOperator',
                carrierId: 'o' + i%3,
                driverId: 'o' + i,
                trustedOwnerOperators: []
            });
            tasks.push(account.save());
        }

        for(i=0; i < 6; i++ ) {
            var account = new Account({
                username: 'd' + i,
                password: 'me',
                type: 'Driver',
                carrierId: 'c' + i%3,
                driverId: 'd' +i,
                trustedOwnerOperators: []
            });
            tasks.push(account.save());

        }

        //Carrier Loads
        for(i=0; i < 6; i++ ) {
            var load = new Loads({
                origin: 'd' + i,
                destination: 'me',
                pickupTime: Date(),
                dropoffTime: Date(),
                driverId: 'd' + i,
                carrierId: 'c' + i%3
            });
            tasks.push(load.save());

        }

        //Owner loads
        for(i=0; i < 6; i++ ) {
            var load = new Loads({
                orgin: 'd' + i,
                destination: 'me',
                pickupTime: Date(),
                dropoffTime: Date(),
                driverId: 'o' + i%3,
                carrierId: 'c' + i%3
            });
            tasks.push(load.save());

        }

        Q.all(tasks)
          .then(function(results) {
            done();
          }, function (err) {
            console.log(err);
          });
    });

    it('should redirect to /', function (done) {
        agent
        .post('/login')
        .field('username', 'user@user.com')
        .field('password', 'pass11')
        .expect('Location','/login')
        .end(done)
    });

    
    it('find a user by username', (done) => {
        Account.findOne({ username:'c1'}, (err, account) => {
            account.username.should.eql('c1');
            done();
        });
    
    });
    
    it('should post load', function (done) {
        agent
        .post('/loads')
        .field('origin', 'san jose')
        .field('destination', 'oakland')
        .field('driverId', 'd1')
        .field('carrierId', 'c1')
        .field('pickupTime', Date())
        .field('dropoffTime', Date())
        .expect("Found. Redirecting to /")
        .end(done)
    });

    it('schedule carrier', function (done) {
        agent
        .get('/schedule?type=Carrier&id=c0')
        .expect(200)
        .end(function(err, res){
            done();
        })
    });
    
    it('schedule owner', function (done) {
        agent
        .get('/schedule?type=OwnerOperator&id=o0')
        .expect(200)
        .end(function(err, res){
            done();
        })
    });

    afterEach((done) => {
        Loads.remove({}, () => {
        });
        Account.remove({}, () => {
        });
        done();
    
     });

});
