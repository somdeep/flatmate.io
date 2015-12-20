var Message = require('../models/message'),
    User = require('../models/user')

module.exports = function(app){


  app.post('/messages', function(req, res){

    var payload = {
      text: req.body.text,
      to: req.body.to,
      from: req.user.userid,
      timestamp: Date.now()
    }

    User.find({userid: payload.to}, function(err, data){
      if(err) return err;

      toUser = JSON.parse(JSON.stringify(data[0]));
      payload.to_name = toUser.name;

      User.find({userid: payload.from}, function(err, data){
        if(err) return err;

        fromUser = JSON.parse(JSON.stringify(data[0]));
        payload.from_name = fromUser.name;

        Message.create(payload, function(err, data){
          if(err) return err;

          res.json(data);
        })
      })
    });

  });

  app.get('/messages', function(req, res){

    var id = req.user.userid;

    var messages = {};

    messages.myId = id;

    Message.find({to: id}, function(err, data){

      messages.in = data;

      Message.find({from: id}, function(err, data){

        messages.out = data;

        res.json(messages);

      });

    });

  });

}
