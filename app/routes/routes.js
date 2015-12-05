
var User = require('./../models/User');


module.exports = function(app) {

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


};
