var express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    session = require('express-session'),
    FacebookStrategy = require('passport-facebook').Strategy
    fs = require('fs');
    var mongoose    = require('mongoose');
    var dbUrl       = "mongodb://flatmate:flatmate@ds061974.mongolab.com:61974/flatmate";
    //var dbUrl = "mongodb://localhost:27017/flatmate1";

    var db          = mongoose.connect(dbUrl);

    var User = require('./app/models/User');
// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Facebook profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the FacebookStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Facebook
//   profile), and invoke a callback with a user object.
passport.use(new FacebookStrategy({
    clientID: '188629254815291',
    clientSecret: '3c3c7744ede569d79bfa772f725b325c',
    callbackURL: "http://localhost:9000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // var dbprofile={""};
    // asynchronous verification, for effect...


    console.log("ACCESS TOKEN: " + JSON.stringify(accessToken));
     console.log("PRINTING PROFILE: " + JSON.stringify(profile));
    process.nextTick(function () {


      User.find({userid:profile['id']}, function (err,data){


        if (err){
          return err;
        }
        //console.log(data.userid);
        if(data.length==0)
        {

          var newdata={
            username:profile.displayName,
            userid:profile.id,
            name:profile.displayName,




          };

          console.log("data empty");
          console.log("newdata : " +newdata);

          User.create(newdata,function(err, data) {
            if (err) {
              return err;
            }

            //res.json(data);

          });


        }
        var dbprofile = {
          userid: profile.id,
          accessToken: accessToken
        }
        // dbprofile['userid']=data.userid;
        // dbprofile['accessToken']=accessToken;


        return done(null, dbprofile);
      });
      // To keep the example simple, the user's Facebook profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Facebook account with a user record in your database,
      // and return that user instead.


      //return done(null, profile);
    });
  }
));





var port = process.env.PORT || 9000;

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
  passport.authenticate('facebook',{scope:['user_friends','email','user_photos']}),
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

//route file
app.use(express.static(path.join(__dirname, 'ui')));
app.use(ensureAuthenticated);
require('./app/routes/routes.js')(app);





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
  if (req.isAuthenticated()) { console.log("IS AUTH : " + req); return next(); }
  res.redirect('/')
}
