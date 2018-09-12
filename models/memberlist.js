var mongoose = require('mongoose');
//User Schema
var MemberSchema = mongoose.Schema({
    groupid:{type:String},
    fullname: {
        type: String,
        index: true
    },
    email:{type:String},
    mobile: {type:Number},
    password:{type:String}
   
});
var MemberList = module.exports = mongoose.model('MemberList', MemberSchema);
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

 