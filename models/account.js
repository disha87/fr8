const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
var Q = require("q");

const AccountSchema = new Schema({
    username: String,
    password: String,
    type: String,
    carrierId: String,
    driverId: String,
    trustedOwnerOperators: [String]
});

AccountSchema.plugin(passportLocalMongoose);
var Account = mongoose.model('accounts', AccountSchema);

Account.getMembers = function(id, type, result) {

    var deferred = Q.defer();
    this.find({carrierId: id, type: type}, function(error, members){

        if (error) {
            deferred.reject(new Error(error));
        }
        else {

       		result['members'] = members;
            deferred.resolve(result);
        }
    });

    return deferred.promise;
}

module.exports = Account;