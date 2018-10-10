var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var photoSchema = new Schema({
  path:  { type: String },
  caption: { type: String },
  userid:{type:String}
  });

module.exports = mongoose.model('Photos', photoSchema);

