var Template = require('../../persister/template');
var crypto = require("crypto");

module.exports = function(app){
	
	app.get(['/admin/templates/list','/admin/templates/list/:page'], isAuthenticated, function(req, res) {
	   var perPage = 10;
       var page = req.params.page || 1;
	   var moment = require('moment');
	   session = req.session;
       var firstname = session.firstname;
	   var data = [];
	   data.title = 'List Templates - Grasshopper';
	   data.firstname = firstname;
	   
	   Template
		.find({})
		.skip((perPage * page) - perPage)
		.limit(perPage)
		.exec(function(err, dataRecord) {
			Template.count().exec(function(err, count) {
				if (err) return next(err)
				res.render('templates/list', {
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
	
	app.get('/admin/templates/add', isAuthenticated, function(req, res) {
	   session = req.session;
       var firstname = session.firstname;
	   var data = [];
	   data.title = 'Add Template - Grasshopper';
	   data.firstname = firstname;
	   res.render('templates/add', { data: data, error: req.flash('error'), success: req.flash('success')});   
	});
	
	app.post('/admin/templates/add', isAuthenticated, function(req, res) {
	   session = req.session;
       var firstname = session.firstname;
	   var data = [];
	   data.title = 'Add Template - Grasshopper';
	   data.firstname = firstname;	   
		var addRecord = new Template();
		addRecord.title = req.body.title;
		addRecord.description = req.body.description;
		addRecord.status = req.body.status;
		addRecord.createdAt = Date.now();
		addRecord.updatedAt = Date.now();
		
		addRecord.save(function(err) {
			if (err){
			  req.flash('error','This template name already exist!');
			  res.redirect('/admin/templates/add');
			} else {
				req.flash('success','New template created successfully!');
			    res.redirect('/admin/templates/list');
			}			
		});
	});
	
	app.get('/admin/templates/edit/:id', isAuthenticated, function(req, res) {
		session = req.session;
        var id = req.params.id;
		var data = [];
	    data.title = 'Edit Template - Grasshopper';
		Template.findById( id, function(err, template) {
			 if(err){
				 req.flash('error','Something went wrong!');
				 res.redirect('/admin/logout');
			 } else {;
				res.render('templates/edit', { resultSet: template, data: data, error: req.flash('error'), success: req.flash('success')}); 			 
			 }
		}); 				     
	});
	
	app.post('/admin/templates/edit/:id', isAuthenticated, function(req, res) {
		req.checkBody('title', 'Required').notEmpty();
		req.checkBody('description', 'Required').notEmpty();
		var errors = req.validationErrors();
		var id = req.body.id;
		if (errors) {
			req.flash('error','Please enter all the fields!');
		    res.redirect('/admin/templates/edit/'+id);
		 } else {
			 session = req.session;
			 Template.findById(id, function(err, cmsData) {
				 if(err){
					 req.flash('error','Record could not be saved!');
				     res.redirect('/admin/templates/edit/'+id);
				 } else {
					 cmsData.title = req.body.title;
					 cmsData.description = req.body.description;
					 cmsData.status = req.body.status;
					 cmsData.updatedAt = Date.now();
					 cmsData.save(function(){
						req.flash('success','Record has been updated successfully!');
						res.redirect('/admin/templates/list');
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