var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//Use for tokens
var jwt    = require('jsonwebtoken');

var index = require('./routes/index');
var users = require('./routes/users');
var products = require('./routes/products');
var loans = require('./routes/loans');

var models = require("./models");
models.sequelize.sync();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


/*
* Connect a user
*/
app.post("/users/connect", function(req,res,next){
  console.log("We pass in connextion");
  models.User.find({
    where: {
      pseudo: req.body.pseudo,
      password: req.body.password
    }
  }).then(function(user){
    if(user){

      // if user pseudo and password are good,
      // we create a token
      var token = jwt.sign({user}, "pocebleu",{
        expiresIn : 60*60*24
      });
      res.status(200).send({
        "result": 1,
        "message": "Athentification is a success",
        "token": token
      })
      res.status(200)
    }else{
      res.status(400).send({
        "result": 0,
        "message": "Athentification failed",
      })
    }
  })
})

/*
* Create a user (inscription)
*/
app.post("/users", function(req,res,next){
  let lastname = req.body.lastname;
  let firstname = req.body.firstname;
  let email = req.body.email;
  let pseudo = req.body.pseudo;
  let password = req.body.password;
  let phone = req.body.phone;
  models.User.create({
    lastname: lastname,
    firstname: firstname,
    email: email,
    pseudo: pseudo,
    password: password,
    phone_number: phone
  }).then(function(user){
    res.json(user);
  }).catch(next);
});

/*
* middleware in order to Keep token security
*/
app.use(function(req,res,next){
  console.log("We pass in token middleware");
  let token =req.body.token || req.query.token;
  if (token){
    // verifies secret and checks exp
    jwt.verify(token, "pocebleu", function(err, decoded) {
      if (err) {
        return res.json({ result: 0, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
  }
  else{
    // if there is no token
   // return an error
   return res.status(403).send({
       result: 0,
       message: 'No token provided.'
   });
 }
});


app.use('/', index);
app.use('/users', users);
app.use('/products', products);
app.use('/loans', loans);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
