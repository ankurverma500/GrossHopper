var mongoose = require('mongoose');

var subcategoryModel = function () {
  var subcategorySchema = mongoose.Schema({
	categoryid: { type : mongoose.Schema.Types.ObjectId, ref: 'Category'},
	subcategory:{ type : String, unique : true, required : true},
	status: Number,
	createdAt: { type: Date },
	updatedAt: { type: Date }
  });
  return mongoose.model('SubCategory', subcategorySchema);
};

module.exports = new subcategoryModel();