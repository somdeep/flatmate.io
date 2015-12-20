var User = require('../models/user');

module.exports = function(app){

  app.get('/matches', function(req, res){

    var matches = [];

    User.find({userid: req.user.userid}, function(myErr, myData){

      // no idea why i had to fucking do this
      var me = JSON.parse(JSON.stringify(myData[0]));

      User.find(function(err, data){

        for(var i=0; i<data.length; i++){

          // no idea why i had to fucking do this
          var flatmate = JSON.parse(JSON.stringify(data[i]));

          // console.log('ME',);
          // console.log('DATA[i]', JSON.stringify(data[i]));

          if(flatmate.userid == me.userid){
            continue;
          }

          var match = {
            username: flatmate.username,
            userid: flatmate.userid,
            location: flatmate.location,
            score: 0,
            criteria: []
          }

          // everyone on here is a flatmate user
          match.criteria.push('Flatmate.io user');

          // are we friends on facebook?
          friends = me.facebook._json.friends.data;
          for(var j=0; j<friends.length; j++){
            if(friends[j].id === flatmate.userid){

              // we do!
              match.score += 10;
              match.criteria.push('Facebook friends');
            }
          }

          // match the gender you are looking for?
          if(flatmate.facebook._json.gender){
            if(me.lookingForList != null){
              var iWantMale = me.lookingForList.indexOf('Males') != -1;
              var iWantFemale = me.lookingForList.indexOf('Females') != -1;
              if(iWantMale && flatmate.facebook._json.gender === 'male'){
                match.score += 10;
                match.criteria.push('Male');
              }
              if(iWantFemale && flatmate.facebook._json.gender === 'female'){
                match.score += 10;
                match.criteria.push('Female');
              }
            }
          }

          // same location?
          if(me.location != null && flatmate.location != null){

            if(me.location.split(',')[1].toUpperCase() == flatmate.location.split(',')[1].toUpperCase()){

              if(me.location.split(',')[0].toUpperCase() === flatmate.location.split(',')[0].toUpperCase()){
                match.score += 10;
                match.criteria.push('Live in the same city');
              }
              else{
                match.score += 5;
                match.criteria.push('Live in the same state');
              }
            }

          }

          // do we agree on price?
          if((flatmate.priceLow <= me.priceHigh && flatmate.priceLow >= me.priceLow) ||
              flatmate.priceHigh <= me.priceHigh && flatmate.priceHigh >= me.priceLow){

            match.score += 10;
            match.criteria.push('Agree on price range');
          }

          // close to same age?
          if(Math.abs(
              flatmate.facebook._json.birthday.slice(-4) -
              me.facebook._json.birthday.slice(-4)) <= 3){

            match.score += 10;
            match.criteria.push('Close to same age');

          }

          // same school?
          if(flatmate.facebook._json.education != null && me.facebook._json.education != null){

            var found = false;
            for(var j=0; j<me.facebook._json.education.length; j++){
              var mySchool = me.facebook._json.education[j].school;
              for(var k=0; k<flatmate.facebook._json.education.length; k++){
                var theirSchool = flatmate.facebook._json.education[k].school;
                if(mySchool.name.toUpperCase() === theirSchool.name.toUpperCase()){
                  match.score += 10;
                  found = true;
                }
              }
            }

            if(found) match.criteria.push('Went to the same school');

          }

          // same work?
          if(flatmate.facebook._json.work != null && me.facebook._json.work != null){

            var found = false;
            for(var j=0; j<me.facebook._json.work.length; j++){
              var myWork = me.facebook._json.work[j].employer;
              for(var k=0; k<flatmate.facebook._json.work.length; k++){
                var theirWork = flatmate.facebook._json.work[k].employer;
                if(myWork.name.toUpperCase() === theirWork.name.toUpperCase()){
                  match.score += 10;
                  found = true;
                }
              }
            }

            if(found) match.criteria.push('Worked for the same company');

          }

          // similar likes?
          if(flatmate.facebook._json.likes != null && me.facebook._json.likes != null){

            var found = false;
            for(var j=0; j<me.facebook._json.likes.data.length; j++){
              var myLike = me.facebook._json.likes.data[j].name;
              for(var k=0; k<flatmate.facebook._json.likes.data.length; k++){
                var theirLike = flatmate.facebook._json.likes.data[k].name;
                if(myLike.toUpperCase() === theirLike.toUpperCase()){
                  match.score += 1;
                  found = true;
                }
              }
            }

            if(found) match.criteria.push('Like the same things on Facebook');

          }

          // linkedin section

          // if they have a linkedin they are at least somewhat professional
          if(flatmate.linkedin != null){

            if(me.lookingForList && me.lookingForList.indexOf('Professionals') != -1){
              match.score += 10;
              match.criteria.push('Professional');
            }


            if(me.linkedin != null){


              // linkedin geographies match?
              if(me.linkedin._json.location && flatmate.linkedin._json.location){
                if(me.linkedin._json.location.name === flatmate.linkedin._json.location.name){
                  match.score += 10;
                  match.criteria.push('Work in the same location');
                }
              }

              // linkedin industries match?
              if(me.linkedin._json.industry && flatmate.linkedin._json.industry){
                if(me.linkedin._json.industry === flatmate.linkedin._json.industry){
                  match.score += 10;
                  match.criteria.push('Work in the same industry');
                }
              }

            }

          }


          matches.push(match);

        }

        res.json(matches);

      });
    });

  });

};
