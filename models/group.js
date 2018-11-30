var mongoose = require('mongoose');
//User Schema
var GroupSchema = mongoose.Schema({
    userid: { type: String },
    groupname: {
        type: String,
        index: true
    },
    total: { type: Number },
    limit: { type: Number },
    startdate: { type: Date },
    biddate: { type: String },
    amount: { type: Number },

    createdAt: { type: Date, default: Date.now }

});
var Group = module.exports = mongoose.model('Group', GroupSchema);
module.exports.createGroup = function (newGroup, callback) {
    newGroup.save(callback);
}

module.exports.findGroup = function (conditionQuery, callback) {
    Group.find(conditionQuery, callback)
}
//Delete User Details By Id
module.exports.deleteGroup = function (conditionDeleteQuery, callback) {
    Group.deleteOne(conditionDeleteQuery, callback)
}
module.exports.updateTotal = function (conditionQuery, newValues, callback) {
    Group.update(conditionQuery, newValues, callback);
}
