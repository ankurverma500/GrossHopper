var mongoose = require('mongoose');
var userModel = function () {

  var userSchema = mongoose.Schema({
	firstname: String,
	lastname: String,
    username: String,
    password: String,
    email: String,
	token: String,
	usertype: Number,
	createdAt: { type: Date },
	updatedAt: { type: Date }
  });
 

  return mongoose.model('User', userSchema);
};

module.exports = new userModel();