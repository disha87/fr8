const express = require('express');
const passport = require('passport');
const Account = require('../models/account');
const router = express.Router();
const Loads = require('../models/load')
const Q = require("q");
const async = require('async');


router.get('/addLoad', (req, res) => {
    res.render('addLoad', { user : req.user});
});


router.get('/register', (req, res) => {
    res.render('register', { });
});

router.post('/register', (req, res, next) => {

    var driverId = '';
    var carrierId = req.body.carrier;
    var type = req.body.type;
    var username = req.body.username;
    if (type === 'Carrier') {
        carrierId = username;
    } else if (type == 'OwnerOperator'){
        carrierId = username;
        driverId = username;
    } else {
        driverId = username;
    }
    Account.register(new Account({ username : username,
        type: type,
        driverId: driverId,
        carrierId: carrierId,
        trustedOwnerOperators: req.body.trustedOwnerOperators
     }), req.body.password, (err, account) => {
        if (err) {
          return res.render('register', { error : err.message });
        }
        passport.authenticate('local')(req, res, () => {
            req.session.save((err) => {
                if (err) {
                    return next(err);
                }
                res.redirect('/');
            });
        });
    });
});

router.get('/', (req, res) => {
    if(!req.user){
      res.render('index', { user : req.user, loads: null});
      return;
    }
    var type = req.user.type;
    var id = req.user.username;
    var deferred = Q.defer();
    var tasks = []; 
    var result = {'DriverLoads': [], 'OwnerOperatorLoads': []};

    if (type === 'Carrier') {

        Account.getMembers(id, 'Driver', result)
        .then(function(result){
            drivers = result['members'];
            var items = []
            for(var i =0; i < drivers.length; i++){
                items.push(drivers[i].driverId);
            }
            return Loads.getLoad(items, result)
        })
        .then(function(result){
            result['DriverLoads'] = result['loads'];
            return Account.getMembers(id, 'Carrier', result)
        })
        .then(function(result){
            var trustedOwnerOperators = result['members'][0].trustedOwnerOperators;
            return Loads.getLoad(trustedOwnerOperators, result)            
        })
        .done(function(result){
            loads = result['loads'];
            carrierId = result['members'][0].carrierId;
            for (var i =0; i < loads.length; i++){
                if (loads[i].carrierId != carrierId){
                    loads[i].origin = 'Unavailable';
                    loads[i].destination = 'Unavailable';
                    loads[i].rate = 'Unavailable';
                }
            }
            result['OwnerOperatorLoads'] = loads;
            delete result.loads;
            delete result.members;
            res.render('index', { user : req.user, loads: result});
        });

    } else {
        Loads.getLoad([id], result)
        .done(function(result){
            result['OwnerOperatorLoads'] = result['loads'];
            delete result.loads;
            res.render('index', { user : req.user, loads: result});
        })

    }
});


router.get('/login', (req, res) => {
    res.render('login', { user : req.user, error : req.flash('error')});
});

router.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), (req, res, next) => {
    req.session.save((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

router.get('/logout', (req, res, next) => {
    req.logout();
    req.session.save((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

router.post('/loads', (req, res) => {
    var load = new Loads({
        origin: req.body.origin,
        destination: req.body.destination,
        pickupTime: req.body.pickupTime,
        dropoffTime: req.body.dropoffTime,
        driverId: req.body.driverId,
        carrierId: req.body.carrierId
    })
    load.save(function(err){
      if(err)
        console.log(err);
      else
        res.redirect('/');
    });

});


module.exports = router;
