var express = require('express'),
    path = require('path'),
    logger = require('morgan')
    bodyParser = require('body-parser')
    passport = require('passport');

var port = process.env.PORT || 9000;

var app = express();
app.use(bodyParser.json());
app.use(logger('dev'));

app.use(express.static(path.join(__dirname, 'ui')));

app.get('/', function(req, res){
  res.send('hello, world!');
});

app.listen(port, function(){
  console.log('listening on port', port);
});
