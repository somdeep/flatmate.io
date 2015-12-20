var express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    session = require('express-session'),
    FacebookStrategy = require('passport-facebook').Strategy,
    LinkedInStrategy = require('passport-linkedin-oauth2').Strategy

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
    callbackURL: "http://localhost:9000/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'emails', 'gender', 'birthday', 'locale',
    'location', 'hometown', 'likes', 'education', 'work', 'bio','friends','posts'],
  },
  function(accessToken, refreshToken, profile, done) {
    // var dbprofile={""};
    // asynchronous verification, for effect...

//    console.log("testing: " + JSON.stringify(profile));
//    console.log("ACCESS TOKEN: " + JSON.stringify(accessToken));
//    //console.log("PRINTING PROFILE: " + JSON.stringify(profile));
//      console.log("PRINTING FRIENDS" + JSON.stringify(profile._json.friends));
    console.log("PRINTING POSTS :  " + JSON.stringify(profile._json.posts));


    process.nextTick(function () {


      User.find({userid:profile['id']}, function (err,data){


        if (err){
          return err;
        }

        if(data.length==0 || data.length==1)
        {

          var newdata={
            username:profile.displayName,
            userid:profile.id,
            name:profile.displayName,
            email:profile.emails[0].value,
            gender:profile.gender,
            birthday:profile._json.birthday,
            locale:profile._json.locale,
            currentCity:profile._json.location,
            hometown:profile._json.hometown,
            likes:profile._json.likes,
            education:profile._json.education,
            work:profile._json.work,
            about_me:profile._json.bio,
            friends : profile._json.friends,
              posts : profile._json.posts
          };

        //  console.log("data empty");
      //    console.log("newdata : " +newdata);

        if(data.length==0)
        {
            User.create(newdata,function(err, data) {
            if (err) {
              return err;
            }

            //res.json(data);

          });


        }
        else if(data.length==1)
        {
            User.update({userid:profile.id},{$set:newdata},function(err, data) {
            if (err) {
              return err;
            }

            //res.json(data);

          });

        }

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

//Passport linked in Strategy
    passport.use(new LinkedInStrategy({
        clientID: "77k71lq8q0x5i1",
        clientSecret: "soUiwkC5METRPjR4",
        callbackURL: "http://localhost:9000/connect/linkedin/callback",
        state: true
      },
      function(token, tokenSecret, profile, done) {


        console.log("ACCESS TOKEN: " + JSON.stringify(token));
         console.log("PRINTING PROFILE: " + JSON.stringify(profile.displayName));

          //var id = req.session.passport.user.userid;

     //   console.log(id);
        //  process.nextTick(function () {
         //
        //    var newdata={
        //      username:profile.displayName,
        //      userid:profile.id,
        //      name:profile.displayName,
        //      accessToken:token
         //
         //
         //
        //    };
         //
         //
         //
         //
         //
         //
         //
        //    return done(null, newdata);
         //
        //  });
        // User.findOrCreate({ linkedinId: profile.id }, function (err, user) {
        //   return done(err, user);
        // });
        return done(null,profile);
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
  passport.authenticate('facebook',
  {scope:['user_friends','email','user_photos','user_location','user_likes','user_birthday',
  'user_education_history','user_work_history','user_about_me','user_hometown','user_posts']}),
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


//      console.log("LINKED IN : " + JSON.stringify(req.account));
       var id = req.session.passport.user.userid;
      var updatedData = {linkedin : req.account};
      console.log("LINKED IN : " + JSON.stringify(updatedData));


     User.update({userid:id},{$set : updatedData}, function (err,updated){
      if (err)
        res.send(err);

//        res.json(updated);
         res.redirect('/');
      });

//      console.log("Facebook : " + JSON.stringify(req.user));
//
    // Associate the Twitter account with the logged-in user.
    // account.userId = user.id;
    // account.save(function(err) {
    //   if (err) { return self.error(err); }
    //   self.redirect('/profile');
    // });
  }
);


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
