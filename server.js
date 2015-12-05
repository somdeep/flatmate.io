var express = require('express'),
path = require('path'),
logger = require('morgan')
bodyParser = require('body-parser')
passport = require('passport');



var mongoose    = require('mongoose');
var dbUrl       = "mongodb://flatmate:flatmate@ds061974.mongolab.com:61974/flatmate";
//var dbUrl = "mongodb://localhost:27017/flatmate1";

var db          = mongoose.connect(dbUrl);

var User = require('./app/models/User');



var port = process.env.PORT || 9000;

var app = express();
app.use(bodyParser.json());
app.use(logger('dev'));

app.use(express.static(path.join(__dirname, 'ui')));
//route file
require('./app/routes/routes.js')(app);



app.listen(port, function(){
  console.log('listening on port', port);
});
