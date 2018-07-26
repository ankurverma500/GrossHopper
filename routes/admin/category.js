var Category = require('../../persister/category');
var SubCategory = require('../../persister/subcategory');
var crypto = require("crypto");

module.exports = function(app){
	
	app.get('/admin/category/list', isAuthenticated, function(req, res) {
	   var moment = require('moment');
	   session = req.session;
       var firstname = session.firstname;
	   var data = [];
	   data.title = 'List Category - Grasshopper';
	   data.firstname = firstname;
	   Category.find({},function(err, dataRecord) {
			 if(err){
				 req.flash('error','Something went wrong!');
				 res.redirect('/admin/logout');
			 } else {
				console.log(dataRecord);
				res.render('category/list', { resultSet: dataRecord,data: data, error: req.flash('error'), success: req.flash('success'),moment:moment });		 
			 }
		});	   
	});
	
	app.get('/admin/category/add', isAuthenticated, function(req, res) {
	   session = req.session;
       var firstname = session.firstname;
	   var data = [];
	   data.title = 'Add Category - Grasshopper';
	   data.firstname = firstname;
	   res.render('category/add', { data: data, error: req.flash('error'), success: req.flash('success')});   
	});
	
	app.post('/admin/category/add', isAuthenticated, function(req, res) {
	   session = req.session;
       var firstname = session.firstname;
	   var data = [];
	   data.title = 'Add Category - Grasshopper';
	   data.firstname = firstname;	   
		var addRecord = new Category();
		addRecord.category = req.body.category;
		addRecord.status = req.body.status;
		addRecord.createdAt = Date.now();
		addRecord.updatedAt = Date.now();
		
		addRecord.save(function(err) {
			if (err){
			  req.flash('error','This category name already exist!');
			  res.redirect('/admin/category/add');
			} else {
				req.flash('success','New category created successfully!');
			    res.redirect('/admin/category/list');
			}			
		});
	});
	
	app.get('/admin/category/edit/:id', isAuthenticated, function(req, res) {
		session = req.session;
        var id = req.params.id;
		var data = [];
	    data.title = 'Edit Category - Grasshopper';
		Category.findById( id, function(err, category) {
			 if(err){
				 req.flash('error','Something went wrong!');
				 res.redirect('/admin/logout');
			 } else {;
				res.render('category/edit', { resultSet: category, data: data, error: req.flash('error'), success: req.flash('success')}); 			 
			 }
		}); 				     
	});
	
	app.post('/admin/category/edit/:id', isAuthenticated, function(req, res) {
		req.checkBody('category', 'Required').notEmpty();
		var errors = req.validationErrors();
		var id = req.body.id;
		if (errors) {
			req.flash('error','Please enter all the fields!');
		    res.redirect('/admin/category/edit/'+id);
		 } else {
			 session = req.session;
			 Category.findById(id, function(err, categoryData) {
				 if(err){
					 req.flash('error','Record could not be saved!');
				     res.redirect('/admin/category/edit/'+id);
				 } else {
					 categoryData.category = req.body.category;
					 categoryData.status = req.body.status;
					 categoryData.updatedAt = Date.now();
					 categoryData.save(function(){
						req.flash('success','Record has been updated successfully!');
						res.redirect('/admin/category/list');
					 });					 				 
				 }
			 });
		 }  				     
	});
	
	app.get('/admin/category/listsubcat', isAuthenticated, function(req, res) {
	   var moment = require('moment');
	   session = req.session;
       var firstname = session.firstname;
	   var data = [];
	   data.title = 'List Sub Category - Grasshopper';
	   data.firstname = firstname;
	   
	   var mongoose = require('mongoose');	
		var db = mongoose.connection;
		db.collection('subcategories').aggregate([
		{ $lookup:
			{
				from: 'categories',
				localField: 'categoryid',
				foreignField: '_id',
				as: 'categoryDetail'
			}
		},
		{   $unwind:"$categoryDetail" }
		]).toArray(function(err, dataRecord) {
			if (err) throw err;
			console.log(JSON.stringify(dataRecord));
			res.render('category/listsubcat', { resultSet: dataRecord,data: data, error: req.flash('error'), success: req.flash('success'),moment:moment });
			
		});	
	});
	
	app.get('/admin/category/addsubcat', isAuthenticated, function(req, res) {
	   session = req.session;
       var firstname = session.firstname;
	   var data = [];
	   data.title = 'Add Sub Category - Grasshopper';
	   data.firstname = firstname;
	   
	   Category.find({}, function(err, dataRecord) {
		 if(err){
			 console.log(err);
		 } else {
			 res.render('category/addsubcat', { resultSet: dataRecord, data: data, error: req.flash('error'), success: req.flash('success')});
		 }
	  });
	});
	
	app.post('/admin/category/addsubcat', isAuthenticated, function(req, res) {
	   session = req.session;
       var firstname = session.firstname;
	   var data = [];
	   data.title = 'Add Sub Category - Grasshopper';
	   data.firstname = firstname;	   
		var addRecord = new SubCategory();
		addRecord.categoryid = req.body.categoryid;
		addRecord.subcategory = req.body.subcategory;
		addRecord.status = req.body.status;
		addRecord.createdAt = Date.now();
		addRecord.updatedAt = Date.now();
		
		addRecord.save(function(err) {
			if (err){
			  req.flash('error','This sub category name already exist!');
			  res.redirect('/admin/category/add');
			} else {
				req.flash('success','New sub category created successfully!');
			    res.redirect('/admin/category/listsubcat');
			}			
		});
	});
	
	app.get('/admin/category/editsubcat/:id', isAuthenticated, function(req, res) {
		session = req.session;
        var id = req.params.id;
		var data = [];
	    data.title = 'Edit Sub Category - Grasshopper';
		SubCategory.findById( id, function(err, category) {
			 if(err){
				 req.flash('error','Something went wrong!');
				 res.redirect('/admin/logout');
			 } else {;
				res.render('category/editsubcat', { resultSet: category, data: data, error: req.flash('error'), success: req.flash('success')}); 			 
			 }
		}); 				     
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