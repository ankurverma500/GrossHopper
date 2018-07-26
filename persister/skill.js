var mongoose = require('mongoose');

var skillModel = function () {
  var skillSchema = mongoose.Schema({
	skill: { type : String , unique : true, required : true},
	status: Number,
	createdAt: { type: Date },
	updatedAt: { type: Date }
  });
  return mongoose.model('Skill', skillSchema);
};

module.exports = new skillModel();