const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var Q = require("q");

const LoadSchema = new Schema({
    origin: String,
    destination: String,
    pickupTime: Date,
    dropoffTime: Date,
    rate: Number,
    driverId: String,
    carrierId: String    
});
var Loads = mongoose.model('Load', LoadSchema);

Loads.getLoad = function(ids, result) {

    var deferred = Q.defer();
    this.find({'driverId': {'$in' : ids}}, function(error, loads){

        if (error) {

            deferred.reject(new Error(error));
        }
        else {

       		result['loads'] = loads;
            deferred.resolve(result);
        }
    });

    return deferred.promise;
}


module.exports = Loads
