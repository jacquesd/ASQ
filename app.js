
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , hello = require('./routes/helloWorld')  
  , http = require('http')
  , path = require('path')
  , flash = require('connect-flash')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , authentication = require('./routes/authentication');
  


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User = db.model('Users', schemas.users);
    var out = User.findOne({ id: id }, function (err, user) {
        if (user) {
            done(err, user);
        } else {
            done(null,new Error('User ' + id + ' does not exist'));
        }
      })
    });



// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.

passport.use(new LocalStrategy(
  function(username, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
    User= db.model('Users', schemas.users);
    var out =User.findOne({ name: username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      })
    });
  }
));

var app = express();

// mongoose, db, and schemas are global
mongoose = require('mongoose');
db = mongoose.createConnection('localhost', 'test');
schemas = require('./models/models.js');


app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser({uploadDir: './public/images/'}));
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(passport.initialize());
  app.use(flash());
  app.use(passport.session());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', function(req, res){
  res.render('index', { user: req.user, message: req.flash('error') });
});

app.get('/user', function(req,res) {
    res.render('user', { user: req.user, message: req.flash('error') });
});
/*


app.post('/login', authentication.signup );
*/
app.post('/signup', authentication.signup);

app.post('/user', passport.authenticate('local', { failureRedirect: '/', failureFlash: true }) ,function(req, res) {
    res.redirect('/user');
  });


   /*      
  passport.authenticate('local', { failureRedirect: '/', failureFlash: true }),
  function(req, res) {
    res.redirect('/user');
  });*/

app.get('/images/:path', authentication.get);

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
