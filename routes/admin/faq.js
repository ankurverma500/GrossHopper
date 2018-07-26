var Faq = require('../../persister/faq');
var crypto = require("crypto");

module.exports = function(app){
	
	app.get(['/admin/faq/list','/admin/faq/list/:page'], isAuthenticated, function(req, res) {
	   var perPage = 10;
       var page = req.params.page || 1;
	   var moment = require('moment');
	   session = req.session;
       var firstname = session.firstname;
	   var data = [];
	   data.title = 'List FAQ - Grasshopper';
	   data.firstname = firstname;
	   
	   Faq
		.find({})
		.skip((perPage * page) - perPage)
		.limit(perPage)
		.exec(function(err, dataRecord) {
			Faq.count().exec(function(err, count) {
				if (err) return next(err)
				res.render('faq/list', {
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
	
	app.get('/admin/faq/add', isAuthenticated, function(req, res) {
	   session = req.session;
       var firstname = session.firstname;
	   var data = [];
	   data.title = 'Add FAQ - Grasshopper';
	   data.firstname = firstname;
	   res.render('faq/add', { data: data, error: req.flash('error'), success: req.flash('success')});   
	});
	
	app.post('/admin/faq/add', isAuthenticated, function(req, res) {
	   session = req.session;
       var firstname = session.firstname;
	   var data = [];
	   data.title = 'Add FAQ - Grasshopper';
	   data.firstname = firstname;	   
		var addRecord = new Faq();
		addRecord.question = req.body.question;
		addRecord.answer = req.body.answer;
		addRecord.status = req.body.status;
		addRecord.createdAt = Date.now();
		addRecord.updatedAt = Date.now();
		
		addRecord.save(function(err) {
			if (err){
			  req.flash('error','This faq name already exist!');
			  res.redirect('/admin/faq/add');
			} else {
				req.flash('success','New faq created successfully!');
			    res.redirect('/admin/faq/list');
			}			
		});
	});
	
	app.get('/admin/faq/edit/:id', isAuthenticated, function(req, res) {
		session = req.session;
        var id = req.params.id;
		var data = [];
	    data.title = 'Edit FAQ - Grasshopper';
		Faq.findById( id, function(err, faq) {
			 if(err){
				 req.flash('error','Something went wrong!');
				 res.redirect('/admin/logout');
			 } else {;
				res.render('faq/edit', { resultSet: faq, data: data, error: req.flash('error'), success: req.flash('success')}); 			 
			 }
		}); 				     
	});
	
	app.get('/admin/faq/delete/:id', isAuthenticated, function(req, res) {
		var id = req.params.id;
		Faq.deleteOne({ _id: id}, function(err, faq) {
			 if(err){
				 req.flash('error','Record could not be deleted!');
				 res.redirect('/admin/faq/list');
			 } else {
				 req.flash('success','Record has been deleted successfully!');
				 res.redirect('/admin/faq/list');			 
			 }
		}); 				     
	});
	
	app.post('/admin/faq/edit/:id', isAuthenticated, function(req, res) {
		req.checkBody('question', 'Required').notEmpty();
		req.checkBody('answer', 'Required').notEmpty();
		var errors = req.validationErrors();
		var id = req.body.id;
		if (errors) {
			req.flash('error','Please enter all the fields!');
		    res.redirect('/admin/faq/edit/'+id);
		 } else {
			 session = req.session;
			 Faq.findById(id, function(err, faqData) {
				 if(err){
					 req.flash('error','Record could not be saved!');
				     res.redirect('/admin/faq/edit/'+id);
				 } else {
					 faqData.question = req.body.question;
					 faqData.answer = req.body.answer;
					 faqData.status = req.body.status;
					 faqData.updatedAt = Date.now();
					 faqData.save(function(){
						req.flash('success','Record has been updated successfully!');
						res.redirect('/admin/faq/list');
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