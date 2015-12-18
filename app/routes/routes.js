
var User = require('./../models/User');
var Message = require('./../models/Message');
var craigslist = require('./craigslist');
var request = require('request');
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
    User.find({userid:id},function(err, myData){

      if (err){
        return err;
      }

      // console.log(myData);

      // search for my friends list
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

      // for each of my friend
      for(i=0;i<pending;i++)
      {
      console.log((data[i].id));

      User.find({userid:data[i].id},function(err, data){

          if (err){
            return err;
          }
            if(data.length!=0)
            {

// =================Begin of self-defined matching algorithm==================
              // score of matching
              var score = 0;

              // 1. price: if two people have overlap in price range
              if(myData[0].toJSON().priceLow != null
                && myData[0].toJSON().priceHigh != null
                && data[0].toJSON().priceLow != null
                && data[0].toJSON().priceHigh != null)
              {
                if(myData[0].toJSON().priceLow < data[0].toJSON().priceHigh &&
                   myData[0].toJSON().priceHigh > data[0].toJSON().priceLow)
                {
                  score += 50;
                }
              }

              // 2. currentCity
              if(myData[0].toJSON().currentCity != null
                && data[0].toJSON().currentCity != null)
              {
                var myWords = [];
                myWords = myData[0].toJSON().currentCity
                          .toLowerCase()
                          .split(",");
                var friendWords = [];
                friendWords = data[0].toJSON().currentCity
                          .toLowerCase()
                          .split(",");
                // if they live in the same current city
                if (myWords[0] == friendWords[0]) {
                  score += 10;
                }
              }

              // 3. hometown
              if(myData[0].toJSON().hometown != null
                && data[0].toJSON().hometown != null)
              {
                myWords = [];
                myWords = myData[0].toJSON().hometown
                          .toLowerCase()
                          .split(",");
                friendWords = [];
                friendWords = data[0].toJSON().hometown
                          .toLowerCase()
                          .split(",");
                // if they live in the same current city
                if (myWords[0] == friendWords[0]) {
                  score += 10;
                }
              }

              // 4. birthday
              if(myData[0].toJSON().birthday != null
                && data[0].toJSON().birthday != null)
              {
                var myBirthDate = [];
                myBirthDate = myData[0].toJSON().birthday
                          .toLowerCase()
                          .split("/");
                var birthDate = [];
                birthDate = data[0].toJSON().birthday
                          .toLowerCase()
                          .split("/");
                // if their  age difference is less than 5 years old
                if (Math.abs(myBirthDate[2] - birthDate[2]) <= 5) {
                  score += 10;
                }
              }

              // 5. education
              if(myData[0].toJSON().education != null
                && data[0].toJSON().education != null)
              {
                // if they are ever in the same school
                for (i = 0; i < myData[0].toJSON().education.length; i++) {
                  for (j = 0; j < data[0].toJSON().education.length; j++) {
                    if (myData[0].toJSON().education[i].school.id == data[0].toJSON().education[j].school.id) {
                      score += 10;
                    }
                  }
                }

              }

              // 6. work
              if(myData[0].toJSON().work != null
                && data[0].toJSON().work != null)
              {
                // if they are ever in the same company
                for (i = 0; i < myData[0].toJSON().work.length; i++) {
                  for (j = 0; j < data[0].toJSON().work.length; j++) {
                    if (myData[0].toJSON().work[i].employer.id == data[0].toJSON().work[j].employer.id) {
                      score += 10;
                    }
                  }
                }

              }

              // 7. likes
              if(myData[0].toJSON().likes != null
                && data[0].toJSON().likes != null)
              {
                // if they have the same like
                for (i = 0; i < myData[0].toJSON().likes.data.length; i++) {
                  for (j = 0; j < data[0].toJSON().likes.data.length; j++) {
                    if (myData[0].toJSON().likes.data[i].id == data[0].toJSON().likes.data[j].id) {
                      score += 10;
                    }
                  }
                }

              }

// =================End of self-defined matching algorithm==================

              data[0].set('score', score);
              //console.log("QUERY RESULT match : " + data);
              result.push(data[0]);
              pending--;
              if(pending == 0){
                console.log("outprint!!!");
                console.log(result);
                console.log("end!!!");
                res.json(result);
              }
            }

        });
      }
      }); // Show the HTML for the Google homepage.





    });
    //console.log(myData);







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
