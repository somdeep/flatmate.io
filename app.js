var express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    session = require('express-session'),
    FacebookStrategy = require('passport-facebook').Strategy,
    LinkedInStrategy = require('passport-linkedin-oauth2').Strategy,
    fs = require('fs'),
    mongoose = require('mongoose'),

    User = require('./models/user');


var dbUrl = "mongodb://flatemate:flatemate@ds033915.mongolab.com:33915/flatemateio";
var db = mongoose.connect(dbUrl);

var port = process.env.PORT || 9000;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var cbUrl = (process.env.PORT) ?
    'https://flatmateio.mybluemix.net/auth/facebook/callback' :
    "http://localhost:9000/auth/facebook/callback"

passport.use(new FacebookStrategy({
    clientID: '1072403569458016',
    clientSecret: 'a622f10ac5fb5d8f1ff5a33a78d51487',
    callbackURL: cbUrl,
    profileFields: ['id', 'displayName', 'emails', 'gender', 'birthday', 'locale',
    'location', 'hometown', 'likes', 'education', 'work', 'bio','friends'],
  },
  function(accessToken, refreshToken, profile, done) {

    process.nextTick(function () {

      var session = {
        userid: profile.id,
        accessToken: accessToken
      };

      User.find({userid:profile.id}, function(err, data){

        if(err) return err;

        var userData = {
          userid: profile.id,
          username: profile.displayName,
          name: profile.displayName,
          facebook: {}
        };

        // dump ALL the facebook stuff into this facebook key
        for(var key in profile){
          userData.facebook[key] = profile[key];
        }

        if(data.length == 0){

          User.create(userData, function(err, data){
            if(err) return err;

            return done(null, session);
          });

        }
        else{

          User.update({userid:profile.id}, {$set : userData}, function(err, data){
            if(err) return err;

            return done(null, session);
          });

        }

      });
    });
  }
));

var linkedCB = (process.env.PORT) ?
  'https://flatmateio.mybluemix.net/connect/linkedin/callback' :
  "http://localhost:9000/connect/linkedin/callback";

// Passport linked in Strategy
passport.use(new LinkedInStrategy({
    clientID: "77a9ip8c2y6scs",
    clientSecret: "4e46yF68YoZlJgDq",
    callbackURL: linkedCB,
    state: true
  },
  function(token, tokenSecret, profile, done) {

    //
    // console.log("ACCESS TOKEN: " + JSON.stringify(token));
    //  console.log("PRINTING PROFILE: " + JSON.stringify(profile.displayName));

    return done(null,profile);
  }
));


var app = express();
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(session({ secret: 'keyboard cat' }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res){
  var file = (req.isAuthenticated()) ? 'ui/app.html' : 'ui/index.html';
  fs.readFile(file, 'utf8', function (err,data) {
    res.send(data);
  });

});

// GET /auth/facebook
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Facebook authentication will involve
//   redirecting the user to facebook.com.  After authorization, Facebook will
//   redirect the user back to this application at /auth/facebook/callback
app.get('/auth/facebook',
  passport.authenticate('facebook',
  {scope:['user_friends','email','user_photos','user_location','user_likes','user_birthday',
  'user_education_history','user_work_history','user_about_me','user_hometown']}),
  function(req, res){
    // The request will be redirected to Facebook for authentication, so this
    // function will not be called.
  });

// GET /auth/facebook/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  });



app.get('/connect/linkedin',
  passport.authorize('linkedin', { failureRedirect: '/' })
);


app.get('/connect/linkedin/callback',
  passport.authorize('linkedin', { failureRedirect: '/' }),
  function(req, res) {
    var user = req.user;
    var account = req.account;

    var id = req.user.userid;

    User.update({userid:id},{$set : {linkedin : req.account}}, function (err,updated){
      if (err) res.send(err);

       res.redirect('/');
    });
});


//route file
app.use(express.static(path.join(__dirname, 'ui')));
app.use(ensureAuthenticated);
// require('./app/routes/routes.js')(app);

require('./routes/user.js')(app);
require('./routes/matches.js')(app);
require('./routes/messages.js')(app);

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(port, function(){
  console.log('listening on port', port);
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}
