
var User = require('./../models/User');
var Message = require('./../models/Message');
var craigslist = require('./craigslist');
var request = require('request');
var request=require('request');
var getScore=require('./score.js');

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

  //for testing
  app.get('/craigslist', function(req,res){
    craigslist('new york',300,600,function(err,rooms){
      if (err) res.send(err);
      res.json(rooms);
    });
  });

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

    // my profile data from database, ready to be compared to my friends' information
    var myData = [];
    // all user's profile data from database
    var data = [];

    User.find({userid:id},function(err, myData){

      if (err){
        return err;
      }

      User.find({}, function (err, user){
        if (err){
          return err;
        }

        for (index=0; index<user.length; index++) {
          data = [];
          data = user[index];

          // if the user id is not my id
          if (data.toJSON().userid != id)
          {

            // console.log(data.toJSON().gender);
            // console.log(myData[0].toJSON().lookingForList[0]);

          // if the user is the right gender I look for
          // if the user is the right professional type I look for
          if (myData[0].toJSON().lookingForList != null) {
            var list = myData[0].toJSON().lookingForList;
            // set female, male, student, professional == 0
            var male = 0;
            var female = 0;
            var student = 0;
            var professional = 0;
            for (p=0; p<list.length; p++) {
              if (list[p] != null && list[p] == "Males") {
                male = 1;
              }
              if (list[p] != null && list[p] == "Females") {
                female = 1;
              }
              if (list[p] != null && list[p] == "Students") {
                student = 1;
              }
              if (list[p] != null && list[p] == "Professionals") {
                professional = 1;
              }
            }

            // gender filter
            var isGender = 1;
            var gender = [];
            if (data.toJSON().gender) {
              gender = data.toJSON().gender;
              if ((gender == "female" && male) || (gender == "male" && female)) {
                isGender = 0;
              }
              if ((male && female) || (!male && !female)) {
                isGender = 1;
              }
            }

            // profession filter
            var isProfession = 1;
            var profession = [];
            var isStudent = 0;
            var isProfessional = 0;
            if (data.toJSON().linkedin && data.toJSON().linkedin._json.headline) {

              profession = data.toJSON().linkedin._json.headline;
              profession = profession.toLowerCase().split(" ");

              for (word = 0; word < profession.length; word++) {
                if (profession[word] == "student") {
                  isStudent = 1;
                }
              }
              isProfessional = (isStudent) ? 0 : 1;

              if ((isProfessional && student) || (isStudent && professional)) {
                isProfession = 0;
              }
              if ((student && professional) || (!student && !professional)) {
                isProfession = 1;
              }
            }
            // console.log(data.toJSON().name);
            // console.log(isProfession);
            // console.log(isProfessional);
            // console.log(isStudent);
            // console.log(professional);
            // console.log(student);

            if (!isGender || !isProfession) {
              continue;
            } else {

              var ret = getScore(data, myData);
              data.set('score', ret.value1);
              data.set('info', ret.value2);
              result.push(data);
              }
          } else {
              var ret = getScore(data, myData);
              data.set('score', ret.value1);
              data.set('info', ret.value2);
              result.push(data);
          }
        }// end if the user id is not my id

       }
       console.log("outprint!!!");
       console.log(result);
       console.log("end!!!");
       res.json(result);

      });

      // console.log("myData");
      // console.log(myData[0]);
    });

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

      //============add craigslist rooms===================
      var myid = req.session.passport.user.userid;
      User.find({userid: myid}, function (err,mydata){
        var myLow = mydata[0].toJSON().priceLow;
        var herLow = data[0].toJSON().priceLow;
        var myHigh = mydata[0].toJSON().priceHigh;
        var herHigh = data[0].toJSON().priceHigh;
        var myCity = mydata[0].toJSON().location;
        var herCity = data[0].toJSON().location;

        if (typeof myLow == 'undefined') {myLow = 0;}
        if (typeof herLow == 'undefined') {herLow = 0;}
        if (typeof myHigh == 'undefined') {myHigh = 10000;}
        if (typeof herHigh == 'undefined') {herHigh = 10000;}
        var min = Math.max(myLow,herLow);
        var max = Math.min(myHigh,herHigh);
        var city = {};
        if (typeof myCity == 'undefined' && typeof herCity == 'undefined'){
          city = '';
        }
        else if (typeof myCity == 'undefined' && typeof herCity != 'undefined'){
          city = herCity;
        }
        else if (typeof myCity != 'undefined' && typeof herCity == 'undefined'){
          city = myCity;
        }
        else if (myCity.toLowerCase() != (herCity).toLowerCase()){
          city = '';
        }
        else {
          city = myCity;
        }

        // console.log('================');
        // console.log(min);
        // console.log(max);
        // console.log(city);
        // console.log('================');
        if (min>max) {
          res.json(data);
        }
        else {
          craigslist(city,min,max,function(err,rooms){
            if (err) {
              res.json(data);
            }
            else {
              data[0].set('rooms',rooms);
              res.json(data);
            }
          });
        }
      });
      //============end of craigslist rooms===================


      //res.json(data);
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
