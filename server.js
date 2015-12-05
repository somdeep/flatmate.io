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

//app.use(express.static(path.join(__dirname, 'ui')));

app.get('/user', function(req, res){

  User.find({},function(err, data){

    if (err){
      return err;
    }

    res.json(data);
  });

});


app.get('/user/:userId', function(req, res){

  console.log(req.params.userId);
  User.find({userId:req.params.userId}, function (err,data){


    if (err){
      return err;
    }

    res.json(data);
  });

});

app.post('/user', function(req, res){
  //res.json(req.params.id);

  User.create(req.body,function(err, data) {
    if (err) {
      return err;
    }

    res.json(data);

  });



});

app.put('/user/:userId', function(req, res){
  //res.json(req.params.id);
  var updatedData=req.body;
  console.log(updatedData);


  User.update({userId:req.params.userId},{$set : updatedData}, function (err,updated){
    if (err)
      res.send(err);

      res.json(updated);
    });


});


app.delete('/user/:userId',function(req,res){
  User.remove({userId:req.params.userId},function(err,data){
    if(err)
      res.send(err);

      res.json(data);

  });

});



app.listen(port, function(){
  console.log('listening on port', port);
});
