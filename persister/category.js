var mongoose = require('mongoose');

var categoryModel = function () {
  var categorySchema = mongoose.Schema({
	category: { type : String , unique : true, required : true},
	status: Number,
	createdAt: { type: Date },
	updatedAt: { type: Date }
  });
  return mongoose.model('Category', categorySchema);
};

module.exports = new categoryModel();