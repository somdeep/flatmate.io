var express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),


    LinkedInStrategy = require('passport-linkedin').Strategy
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


//Passport linked in Strategy
    passport.use(new LinkedInStrategy({
        consumerKey: "77k71lq8q0x5i1",
        consumerSecret: "soUiwkC5METRPjR4",
        callbackURL: "http://localhost:9001/auth/linkedin/callback"
      },
      function(token, tokenSecret, profile, done) {


        console.log("ACCESS TOKEN: " + JSON.stringify(token));
         console.log("PRINTING PROFILE: " + JSON.stringify(profile));


         process.nextTick(function () {

           return done(null, profile);

         });
        // User.findOrCreate({ linkedinId: profile.id }, function (err, user) {
        //   return done(err, user);
        // });
      }
    ));





    var port = process.env.PORT || 9001;

    var app = express();
    app.use(bodyParser.json());
    app.use(logger('dev'));
    app.use(cookieParser());
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

    app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});


    // GET /auth/facebook
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.  The first step in Facebook authentication will involve
    //   redirecting the user to facebook.com.  After authorization, Facebook will
    //   redirect the user back to this application at /auth/facebook/callback
    app.get('/auth/linkedin',
      passport.authenticate('linkedin'),
      function(req, res){
        // The request will be redirected to Facebook for authentication, so this
        // function will not be called.
      });

    // GET /auth/facebook/callback
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.  If authentication fails, the user will be redirected back to the
    //   login page.  Otherwise, the primary route function function will be called,
    //   which, in this example, will redirect the user to the home page.
    app.get('/auth/linkedin/callback',
      passport.authenticate('linkedin', { failureRedirect: '/' }),
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
