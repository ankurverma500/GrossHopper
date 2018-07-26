var User = require('../../persister/user');
var crypto = require("crypto");

module.exports = function(app){
	
	app.post('/admin/login', function(req, res) {
		req.checkBody("username", "Please enter your username.").notEmpty();
		req.checkBody("password", "Please enter your password.").notEmpty();
		var errors = req.validationErrors();
		if (errors) {
			req.flash('error','Please fill all the fields first!');
		    res.redirect('/admin/login');
		 } else {
			var username = req.body.username;
			var password = encrypt(req.body.password);
			User.findOne({ 'username' : username,'password' : password },function(err, user) {
				 if(!user){
					 req.flash('error','You have entered invalid username or password!');
					 res.redirect('/admin/login');
				 } else {
					 session = req.session;
					 session.userid = user._id;
					 session.email = user.email;
					 session.username = user.username;
					 session.firstname = user.firstname;
					 session.usertype = user.usertype;
					 var rememberme = req.body.rememberme;
					 if(rememberme){
						 res.cookie('cookieUser', username);
						 res.cookie('cookiePass', req.body.password);
					 }
					 res.redirect('/admin/dashboard');
				 }
			  }
			);
		 }		
	});

	app.get('/admin/login', function(req, res) {
	   if(req.cookies['cookieUser']){
		   var cookieUser = req.cookies['cookieUser'];
		   var cookiePass = req.cookies['cookiePass'];
	   }
	   res.render('admin/login', { error: req.flash('error'), success: req.flash('success'),cookieUser:cookieUser,cookiePass:cookiePass});
	});
	
	app.get('/admin/forgotpass', function(req, res) {
	   res.render('admin/forgotpass', { error: req.flash('error'), success: req.flash('success') });
	});
	
	app.post('/admin/forgotpass', function(req, res) {
		req.checkBody('email', 'Email is required').notEmpty();
		var errors = req.validationErrors();
		if (errors) {
			req.flash('error','Please enter your valid email.!');
		    res.redirect('/admin/forgotpass');
		 } else {
			 User.findOne({'email' : req.body.email},function(err, user) {
				 if(!user){
					 req.flash('error','This email does not exist in our database!');
					 res.render('admin/forgotpass', { error: req.flash('error'), success: req.flash('success') });
				 } else {
					 var randomNumber = Math.floor(1000 + Math.random() * 9000);
					 var randomNumber = randomNumber.toString();
					 user.token = encrypt(randomNumber);
					 user.save(function(){
						req.flash('success','An email has been sent to your account!');
						res.render('admin/forgotpass', { error: req.flash('error'), success: req.flash('success') });
					 });				 
				 }
			 });
		 } 				     
	});
	
	app.get('/admin/resetpass/:id', function(req, res) {
	   var token = req.params.id;
	   User.findOne({'token' : token},function(err, user) {
	         if(!user){
  	             res.redirect('/admin/login');
			 } else {
				 res.render('admin/resetpass', { token: token,error: req.flash('error'), success: req.flash('success')});
			 }
	     });	     
	});
	
	app.post('/admin/resetpass/:id', function(req, res) {
	    req.checkBody("password", "Please enter your password.").notEmpty();
		req.checkBody("c_password", "Please enter your confirm password.").notEmpty();
		var errors = req.validationErrors();
		if (errors) {
		    res.redirect('/admin/resetpass'+req.body.token);
		 } else {
		   var token = req.body.token;
		   User.findOne({'token' : token},function(err, user) {
				 if(err){
					 req.flash('error','Something went wrong!');
					 res.redirect('/admin/resetpass/'+token);
				 } else {
					 user.password = encrypt(req.body.password);
					 user.token = '';
					 user.save(function(){
						req.flash('success','Your password has been reset successfully!');
						res.redirect('/admin/login');
					 });
				 }
			});
		}	   	     
	});

	app.get('/admin/logout', function(req, res) {
	   req.session.destroy();
  	   res.redirect('/admin/login');
	});
	
	app.get('/admin/signup', function(req, res){
		res.render('admin/signup',{ error: req.flash('error'), success: req.flash('success') });
	});
	
	app.get('/admin/dashboard', isAuthenticated, function(req, res) {
	   session = req.session;
       var firstname = session.firstname;
	   var data = [];
	   data.title = 'Dashboard - Grasshopper';
	   data.firstname = firstname;
	   res.render('admin/dashboard', { data : data });
	});

	app.post('/admin/signup', function(req, res) {		
		var newUser = new User();
		newUser.firstname = req.body.firstname;
		newUser.lastname = req.body.lastname;
		newUser.email = req.body.email;
		newUser.username = req.body.username;
		newUser.password = encrypt(req.body.password);
		newUser.token = '';
		newUser.usertype = 1;
		newUser.createdAt = Date.now();
		addRecord.updatedAt = Date.now();
		newUser.save(function(err) {
			if (err){
			  console.log('Error in Saving bbs: '+err);  
			  res.send({"result":false});
			}
			req.flash('success','New user created successfully!');
  	        res.redirect('/admin/login');
		});
	});
	
	app.get('/admin/profile', isAuthenticated,function(req, res) {
		session = req.session;
        var userid = session.userid;
		var data = [];
	    data.title = 'Profile - Grasshopper';
		User.findById( userid,function(err, user) {
			 if(err){
				 req.flash('error','Something went wrong!');
				 res.redirect('/admin/logout');
			 } else {
				data.firstname = user.firstname;
				res.render('admin/profile', { dataUser: user,data: data });				 
			 }
		}); 				     
	});
	
	app.get('/admin/profile/edit', isAuthenticated, function(req, res) {
		session = req.session;
        var userid = session.userid;
		var data = [];
	    data.title = 'Edit Profile - Grasshopper';
		User.findById( userid, function(err, user) {
			 if(err){
				 req.flash('error','Something went wrong!');
				 res.redirect('/admin/logout');
			 } else {
				data.firstname = user.firstname;
				res.render('admin/edit', { dataUser: user,data: data, error: req.flash('error'), success: req.flash('success') });				 
			 }
		}); 				     
	});
	
	app.post('/admin/profile/edit', isAuthenticated, function(req, res) {
		req.checkBody('firstname', 'Required').notEmpty();
		req.checkBody('lastname', 'Required').notEmpty();
		req.checkBody('email', 'Required').notEmpty();
		req.checkBody('username', 'Required').notEmpty();
		var errors = req.validationErrors();
		if (errors) {
			req.flash('error','Please enter all the fields!');
		    res.redirect('/admin/profile/edit');
		 } else {
			 session = req.session;
			 var userid = session.userid;
			 var data = [];
			 data.title = 'Edit Profile - Grasshopper';
			 User.findById(userid, function(err, user) {
				 if(err){
					 req.flash('error','Record could not be saved!');
				     res.redirect('/admin/profile/edit');
				 } else {
					 user.firstname = req.body.firstname;
					 user.lastname = req.body.lastname;
					 user.email = req.body.email;
					 user.username = req.body.username;
					 session.firstname = req.body.firstname;
					 user.save(function(){
						req.flash('success','Record has been saved successfully!');
						res.redirect('/admin/profile/edit');
					 });				 
				 }
			 });
		 } 				     
	});
	
	app.get('/admin/changepass', isAuthenticated, function(req, res) {
		session = req.session;
        var userid = session.userid;
		var data = [];
	    data.title = 'Change Password - Grasshopper';
		User.findById( userid, function(err, user) {
			 if(err){
				 req.flash('error','Something went wrong!');
				 res.redirect('/admin/logout');
			 } else {
				data.firstname = user.firstname;
				res.render('admin/changepass', { data: data, error: req.flash('error'), success: req.flash('success')});				 
			 }
		}); 				     
	});
	
	app.post('/admin/changepass', isAuthenticated, function(req, res) {
		req.checkBody('old_password', 'Required').notEmpty();
		req.checkBody('password', 'Required').notEmpty();
		req.checkBody('c_password', 'Required').notEmpty();
		var errors = req.validationErrors();
		if (errors) {
			req.flash('error','Please enter all the fields!');
		    res.redirect('/admin/changepass');
		 } else {
			 session = req.session;
			 var userid = session.userid;
			 var data = [];
			 data.title = 'Change Password - Grasshopper';
			 User.findById(userid, function(err, user) {
				 if(err){
					 req.flash('error','Record could not be saved!');
				     res.redirect('/admin/changepass');
				 } else {
					 var old_password = encrypt(req.body.old_password);
					 if(old_password != user.password){
						 req.flash('error','Your old password does not match!');
						 res.redirect('/admin/changepass');
					 } else {
						 user.password = encrypt(req.body.password);
						 session.firstname = req.body.firstname;
						 user.save(function(){
							req.flash('success','Password has been changed successfully!');
							res.redirect('/admin/changepass');
						 });
					 }					 				 
				 }
			 });
		 } 				     
	});
}

var isAuthenticated = function (req, res, next) {
   session = req.session;
   var userid = session.userid;
   var usertype = session.usertype;
   if (userid && usertype === 1)
	 return next();
   res.redirect('/admin/login');
}

function encrypt(text){
  var cipher = crypto.createCipher('aes-256-cbc','d6F3Efeq')
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(text){
  var decipher = crypto.createDecipher('aes-256-cbc','d6F3Efeq')
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}