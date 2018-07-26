var mongoose = require('mongoose');

var cmsModel = function () {
  var cmsSchema = mongoose.Schema({
	title: { type : String , unique : true, required : true},
	description: { type : String},
	status: Number,
	createdAt: { type: Date },
	updatedAt: { type: Date }
  });
  return mongoose.model('Cms', cmsSchema);
};

module.exports = new cmsModel();