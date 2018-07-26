var Skill = require('../../persister/skill');
var crypto = require("crypto");

module.exports = function(app){
	
	app.get(['/admin/skills/list','/admin/skills/list/:page'], isAuthenticated, function(req, res) {
	   var perPage = 10;
       var page = req.params.page || 1;
	   var moment = require('moment');
	   session = req.session;
       var firstname = session.firstname;
	   var data = [];
	   data.title = 'List Skills - Grasshopper';
	   data.firstname = firstname;
	   
	   Skill
		.find({})
		.skip((perPage * page) - perPage)
		.limit(perPage)
		.exec(function(err, dataRecord) {
			Skill.count().exec(function(err, count) {
				if (err) return next(err)
				res.render('skills/list', {
					resultSet: dataRecord,
					data: data,
					error: req.flash('error'),
					success: req.flash('success'),
					moment:moment,
					current: page,
					pages: Math.ceil(count / perPage)
				})
			})
		});  
	});
	
	app.get('/admin/skills/add', isAuthenticated, function(req, res) {
	   session = req.session;
       var firstname = session.firstname;
	   var data = [];
	   data.title = 'Add Skill - Grasshopper';
	   data.firstname = firstname;
	   res.render('skills/add', { data: data, error: req.flash('error'), success: req.flash('success')});   
	});
	
	app.post('/admin/skills/add', isAuthenticated, function(req, res) {
	   session = req.session;
       var firstname = session.firstname;
	   var data = [];
	   data.title = 'Add Skill - Grasshopper';
	   data.firstname = firstname;	   
		var addRecord = new Skill();
		addRecord.skill = req.body.skill;
		addRecord.status = req.body.status;
		addRecord.createdAt = Date.now();
		addRecord.updatedAt = Date.now();
		
		addRecord.save(function(err) {
			if (err){
			  req.flash('error','This skill name already exist!');
			  res.redirect('/admin/skills/add');
			} else {
				req.flash('success','New skill created successfully!');
			    res.redirect('/admin/skills/list');
			}			
		});
	});
	
	app.get('/admin/skills/edit/:id', isAuthenticated, function(req, res) {
		session = req.session;
        var id = req.params.id;
		var data = [];
	    data.title = 'Edit Skill - Grasshopper';
		Skill.findById( id, function(err, skills) {
			 if(err){
				 req.flash('error','Something went wrong!');
				 res.redirect('/admin/logout');
			 } else {;
				res.render('skills/edit', { resultSet: skills, data: data, error: req.flash('error'), success: req.flash('success')}); 			 
			 }
		}); 				     
	});
	
	app.post('/admin/skills/edit/:id', isAuthenticated, function(req, res) {
		req.checkBody('skill', 'Required').notEmpty();
		var errors = req.validationErrors();
		var id = req.body.id;
		if (errors) {
			req.flash('error','Please enter all the fields!');
		    res.redirect('/admin/skills/edit/'+id);
		 } else {
			 session = req.session;
			 Skill.findById(id, function(err, skillsData) {
				 if(err){
					 req.flash('error','Record could not be saved!');
				     res.redirect('/admin/skills/edit/'+id);
				 } else {
					 skillsData.skill = req.body.skill;
					 skillsData.status = req.body.status;
					 skillsData.updatedAt = Date.now();
					 skillsData.save(function(){
						req.flash('success','Record has been updated successfully!');
						res.redirect('/admin/skills/list');
					 });					 				 
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