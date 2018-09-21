var mongoose = require('mongoose');

//Token Schema
var ListSchema = mongoose.Schema({
    userid: {
        type: String
    },
    username:{
        type: String
    },
    productname: {
        type:String
    },
    productprice: {
        type:Number,
        
    },
    groupid:{type:String}
     
});

var listToken = module.exports = mongoose.model('List', ListSchema);

module.exports.createList = function(newProductList, callback){
    newProductList.save(callback);
}

//Find tokencode
module.exports.FindList=function(conditionQuery,callback){
    listToken.find(conditionQuery,callback)
 }

 //Update Tokenlist values by Id
module.exports.updateTokenbyId = function(conditionQuerys, newValues, callback){
    listToken.updateMany(conditionQuerys, newValues, callback);
 }
// delete item list
 module.exports.deleteToken=function(conditionDeleteQuery,callback){
    listToken.deleteOne(conditionDeleteQuery,callback)
 }

 

 