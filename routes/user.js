var User = require('../models/user');

module.exports = function(app){


  // get logged in user
  app.get('/user', function(req, res){

    id = req.user.userid;

    User.find({userid: id}, function(err, data){

      res.json(data[0])
    });

  });

  // update logged in user
  app.put('/user', function(req, res){

    User.update({userid:req.user.userid},{$set : req.body}, function (err,data){
      if (err) res.send(err);

      res.json(data);
    });

  });

  app.get('/user/:id', function(req, res){

    User.find({userid: req.params.id}, function(err, data){

      if(data.length == 0){
        res.json({});
      }

      else{
        res.json(data[0]);
      }
    });

  });


};
