var mongoose = require('mongoose');

var faqModel = function () {
  var faqSchema = mongoose.Schema({
	question: { type : String , unique : true, required : true},
	answer: { type : String},
	status: Number,
	createdAt: { type: Date },
	updatedAt: { type: Date }
  });
  return mongoose.model('Faq', faqSchema);
};

module.exports = new faqModel();