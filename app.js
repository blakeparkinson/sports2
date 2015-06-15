var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require("http"),
    mongojs = require("mongojs");

var routes = require('./routes/index');
var teams = require('./routes/teams');
var quiz = require('./routes/quiz');
var about = require('./routes/about');
var ourteam = require('./routes/ourteam');
var leaguesearch = require('./routes/leaguesearch');
var common = require('./routes/common');
var config = common.config();

var auth = require('./routes/auth');
var session = require('express-session'); //express-session is currently working, but is deprecated
var RedisStore = require('connect-redis')(session);

var app = express();
var passport = require('passport');

var hbs = require('hbs');

if (process.env.REDISTOGO_URL){
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redisClient = require("redis").createClient(rtg.port, rtg.hostname);
  redisClient.auth(rtg.auth.split(":")[1]);
}
else{
  var redis = require("redis"),
    redisClient = redis.createClient({detect_buffers: true});
}
if (common.isProduction){
  require('newrelic');
}
hbs.registerPartials(__dirname + '/views/partials');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ store: new RedisStore({
  client: redisClient
  }), secret: config.sessionKey,
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session()); 


app.use('/', routes);
app.use('/teams', teams);
app.use('/about', about);
app.use('/ourteam', ourteam);
app.use('/leaguesearch', leaguesearch);
app.use('/auth', auth);
app.use('/quiz', quiz);




// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

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

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

hbs.registerHelper('json_stringify', function(context) {
    var c = JSON.stringify(context);
    return c;
});

hbs.registerHelper('compare', function (lvalue, operator, rvalue, options) {

    var operators, result;
    
    if (arguments.length < 3) {
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
    }
    
    if (options === undefined) {
        options = rvalue;
        rvalue = operator;
        operator = "===";
    }
    
    operators = {
        '==': function (l, r) { return l == r; },
        '===': function (l, r) { return l === r; },
        '!=': function (l, r) { return l != r; },
        '!==': function (l, r) { return l !== r; },
        '<': function (l, r) { return l < r; },
        '>': function (l, r) { return l > r; },
        '<=': function (l, r) { return l <= r; },
        '>=': function (l, r) { return l >= r; },
        'typeof': function (l, r) { return typeof l == r; }
    };
    
    if (!operators[operator]) {
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
    }
    
    result = operators[operator](lvalue, rvalue);
    
    if (result) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }

});

hbs.registerHelper('inc', function(value, options)
{
    return parseInt(value) + 1;
});

hbs.registerHelper('render_position', function(league, position){
  if (arguments.length < 2) {
        throw new Error("Handlerbars Helper 'render_position' needs 2 parameters");
    }

  var position = position.toUpperCase();
  switch (league){
    case 'nba':
      switch (position){
        case 'G':
          position = 'Guard';
        break;
        case 'F':
          position = 'Forward';
        break;
        case 'C':
          position = 'Center';
        break;
        case 'F-C':
        case 'C-F':
         position = 'Forward/Center';
        break;
        case 'G-F':
        case 'F-G':
         position = 'Guard/Forward';
        break;
      }
    break;
    case 'eu_soccer':
      switch (position){
        case 'D': 
          position = 'Defender';
        break;
        case 'F':
          position = 'Forward';
        break;
        case 'M':
          position = 'Midfielder';
        break;
        case 'G':
          position = 'Goalie';
        break;

      }
      break;
    case 'nhl':
      switch(position){
        case 'D':
          position = 'Defence';
        break;
        case 'F':
          position = 'Forward';
        break;
        case 'G':
          position = 'Goalie';
        break;
      }
    break;
  }
  return position;
})


module.exports = app;
