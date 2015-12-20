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
              match.score += 20;
              match.criteria.push('Facebook friends')
            }
          }

          // do we agree on price?
          if((flatmate.priceLow <= me.priceHigh && flatmate.priceLow >= me.priceLow) ||
              flatmate.priceHigh <= me.priceHigh && flatmate.priceHigh >= me.priceLow){

            match.score += 20;
            match.criteria.push('Agree on price range');

          }

          matches.push(match);

        }

        res.json(matches);

      });
    });

  });

};
