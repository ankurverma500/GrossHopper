var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var engine = require('ejs-locals')
var Database = require('./persister/database');
var config = require('./config.json');
var app = express();
var expressSession = require('express-session');
var flash = require('connect-flash');
var validator = require('express-validator');

// view engine setup
app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(expressSession({secret: 'mySecretKey'}));


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(validator());

require('./routes/admin/index')(app);
require('./routes/admin/category')(app);
require('./routes/admin/skill')(app);
require('./routes/admin/cms')(app);
require('./routes/admin/faq')(app);
require('./routes/admin/template')(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

Database.config(
  config && config.mongodb && config.mongodb.address ? config.mongodb.address : '', 'grasshopper',
  config.mongodb && config.mongodb.options ? config.mongodb.options : undefined,
  function(err, message) {
    if (!err) console.info('  - Mongodb is connected');
  }
);

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
