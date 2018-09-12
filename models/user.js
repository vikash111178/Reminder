var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

//User Schema
var UserSchema = mongoose.Schema({
    username: {
        type: String,
        index: true
    },
    password: {
        type: String
    },
    email:{
        type: String
    },
    
    resetPasswordToken:{type:String} ,
    resetPasswordExpires: Date
  
   
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback){
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
           newUser.password= hash;
           newUser.save(callback);
        });
    });
}

module.exports.getUserByUsername = function(username, callback){
    var query= {username: username};
    User.findOne(query, callback);
}
module.exports.getisAdmin = function(isAdmin, callback){
    var query= {isAdmin: isAdmin};
    User.findOne(query, callback);
}
module.exports.getUserById = function(id, callback){
       User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, function(err, isMatch){
        if(err) throw err;
        callback(null, isMatch);
    });
}
module.exports.createPassword = function(user, callback){
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(user.password, salt, function(err, hash) {
            user.password= hash;
            user.save(callback);
        });
    });
}
module.exports.updateToken = function(conditionQuery, newValues, callback){
    User.updateMany(conditionQuery, newValues, callback);
 }

 
 module.exports.FindToUsername=function(conditionQuery,callback){
    User.find(conditionQuery,callback)
 }