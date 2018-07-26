var mongoose = require('mongoose');

var templateModel = function () {
  var templateSchema = mongoose.Schema({
	title: { type : String , unique : true, required : true},
	description: { type : String},
	status: Number,
	createdAt: { type: Date },
	updatedAt: { type: Date }
  });
  return mongoose.model('Template', templateSchema);
};

module.exports = new templateModel();