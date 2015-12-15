
var User = require('./../models/User');
var Message = require('./../models/Message');
var request=require('request');

module.exports = function(app) {

  //===================message routing========================

  // each message should have at least 3 fields: from, to, text
  // timestamp will be added here if not present
  app.post('/message', function(req,res){
    var input = req.body;
    input.from = req.session.passport.user.userid;

    //populate missing fields
    if (typeof input.time == 'undefined'){
      var now = new Date().toString();     // can also store Date directly as ISO 8601 date string
      input['time'] = now;
      // var before = 'Sat Dec 2 2015 00:42:16 GMT-0500 (EST)';
      // console.log(new Date(before) > new Date(now));
    }


    User.find({userid:input.from},function(err, data) {
      if (err || data.length == 0) {}
      else {
        input['from_name'] = data[0].toJSON().name.toString();
      }
      User.find({userid:input.to},function(err, data) {
        if (err || data.length == 0) {}
        else {
          input['to_name'] = data[0].toJSON().name.toString();
        }
        //put message into db
        Message.create(input,function(err, data) {
          if (err) { return err; }
          res.json(data);
        });
      });
    });

  });

  //not used by frontend, for backend testing
  app.get('/message/from/:from', function(req,res){
    Message.find({from:req.params.from},function(err, data) {
      if (err) { return err; }
      res.json(data);
    });
  });

  //not used by frontend, for backend testing
  app.get('/message/to/:to', function(req,res){
    Message.find({to:req.params.to},function(err, data) {
      if (err) { return err; }
      res.json(data);
    });
  });

  // get all messages related to this userid
  // send to frontend with 3 keys: userid, in, out
  app.get('/message', function(req,res){
    var userid = req.session.passport.user.userid;
    Message.find({to:userid},function(err, data1) {
      if (err) { return err; }
      Message.find({from:userid},function(err, data2) {
        if (err) { return err; }
        var data = {'userid': userid,
                    'in': data1,
                    'out': data2
                   };
        res.json(data);
      });
    });
  });

  app.delete('/message/msgid/:msgid', function(req,res){
    Message.remove({_id:req.params.msgid},function(err,data){
      if(err) res.send(err);
      res.json(data);
    });
  });
  //=================done with message routing=====================

  app.get('/user', function(req, res){

    User.find({},function(err, data){

      if (err){
        return err;
      }

      res.json(data);
    });

  });


  app.get('/user/matches', function(req, res){
    var result=[];
    var id = req.session.passport.user.userid;


    var accessToken=req.session.passport.user.accessToken;
    console.log("accessToken : " + accessToken);





      User.findOne({userid:id},function(error,dat){
      //var prof=JSON.stringify(dat[0].friends);
      var str= JSON.parse(JSON.stringify(dat), function(k, v) {
        //console.log(v); // log the current property name, the last is "".
        return v;       // return the unchanged property value.
      });

      var friend=(str["friends"]);
      var list=JSON.stringify(friend.data);
      var data=JSON.parse(list);
      var pending=0;


      for(key in data)
      {
    console.log("MATCHED FRIENDS : " + JSON.stringify(data[key].id));

      pending++;
      }
      console.log("COUNT : " + pending);


      //  var i;


    for(i=0;i<pending;i++)
       {
       console.log((data[i].id));

      User.find({userid:data[i].id},function(err, data){

          if (err){
            return err;
          }
            if(data.length!=0)
            {
              //console.log("QUERY RESULT match : " + data);
              result.push(data[0]);
              pending--;
              if(pending == 0){




                res.json(result);
              }
            }

        });
    }
    }); // Show the HTML for the Google homepage.






  });

  app.get('/user/userid', function(req, res){
    // console.log(req.session.passport.user);
    // var user=req.session.passport.user.userid;
  // //  console.log(req.params.userid);
  // console.log(req.session.passport.user.userid);
    var id = req.session.passport.user.userid;
    console.log(id);
    // User.find({userid:req.session.passport.user.userid}, function (err,data){
    //
    //
    //   if (err){
    //     return err;
    //   }
    //
    //   res.json(data);
    // });
    User.find({userid:id}, function (err,data){


      if (err){
        return err;
      }

      res.json(data);
    });

  });


  app.get('/user/userid/:userid', function(req, res){

    console.log(req.params.userid);
    User.find({userid:req.params.userid}, function (err,data){


      if (err){
        return err;
      }

      res.json(data);
    });

  });


  app.get('/user/email/:email', function(req, res){

    console.log(req.params.email);
    User.find({email:req.params.email}, function (err,data){


      if (err){
        return err;
      }

      res.json(data);
    });

  });

  app.get('/user/name/:name', function(req, res){

    console.log(req.params.name);
    User.find({name:req.params.name}, function (err,data){


      if (err){
        return err;
      }

      res.json(data);
    });

  });


  app.get('/user/username/:username', function(req, res){

    console.log(req.params.username);
    User.find({userName:req.params.userName}, function (err,data){


      if (err){
        return err;
      }

      res.json(data);
    });

  });

  app.get('/user/location/:location', function(req, res){

    console.log(req.params.location);
    User.find({location:req.params.location}, function (err,data){


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

  app.put('/user/userid/:userid', function(req, res){
    //res.json(req.params.id);
    var updatedData=req.body;
    console.log(updatedData);


    User.update({userid:req.params.userid},{$set : updatedData}, function (err,updated){
      if (err)
        res.send(err);

        res.json(updated);
      });


  });

  app.put('/user/username/:username', function(req, res){
    //res.json(req.params.id);
    var updatedData=req.body;
    console.log(updatedData);


    User.update({username:req.params.username},{$set : updatedData}, function (err,updated){
      if (err)
        res.send(err);

        res.json(updated);
      });


  });





  app.delete('/user/userid/:userid',function(req,res){
    User.remove({userid:req.params.userid},function(err,data){
      if(err)
        res.send(err);

        res.json(data);

    });

  });


  app.delete('/user/username/:username',function(req,res){
    User.remove({username:req.params.username},function(err,data){
      if(err)
        res.send(err);

        res.json(data);

    });

  });


};
