var mongoose = require('mongoose');
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
    groupid:{type:String},
    mobile: {type:Number},
    
    resetPasswordToken:{type:String} ,
    resetPasswordExpires: Date
  
   
});

var MemberList = module.exports = mongoose.model('Memberlist', UserSchema);
module.exports.createMemberList = function(newMemberList, callback){
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newMemberList.password, salt, function(err, hash) {
            newMemberList.password= hash;
            newMemberList.save(callback);
        });
    });
}

module.exports.findMemberList=function(conditionQuery,callback){
    MemberList.find(conditionQuery,callback)
 }
 module.exports.deleteMemberList=function(conditionDeleteQuery,callback){
    MemberList.deleteOne(conditionDeleteQuery,callback)
 }
 