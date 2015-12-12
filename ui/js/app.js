(function(){

  // include our submodules
  angular.module('flatmate.io',[
      'ngRoute',
  ])

  .config(['$routeProvider', function($routeProvider){
    $routeProvider.when('/',{
      templateUrl: 'templates/profile.html',
      controller: 'ProfileController',
      controllerAs: 'profileCtrl'
    })
    .when('/matches',{
      templateUrl: 'templates/matches.html',
      controller: 'MatchesController',
      controllerAs: 'matchCtrl'
    })
    .when('/messages',{
      templateUrl: 'templates/messages.html',
      controller: 'MessagesController',
      controllerAs: 'msgCtrl'
    })
    .when('/users/:id',{
      templateUrl: 'templates/user.html',
      controller: 'UserController',
      controllerAs: 'userCtrl'
    })
    .otherwise({redirectTo: '/'});

  }])

  .controller('ProfileController', ['$http', function($http){

    this.lookingForOptions = ['Males', 'Females', 'Students', 'Professionals'];

    this.profile = {}
    //   username : 'matt',
    //   location : 'White Plains, NY',
    //   priceLow : 0,
    //   priceHigh : 1800,
    //   about : 'Looking for a roommate. Don\'t be creepy',
    //   lookingFor : 'You should be able to pay rent',
    //   lookingForList : ['Males', 'Females', 'Professionals']
    // };
    this.profile.lookingForList = [];

    $http.get('/user/userid')
    .success(function(data, status, headers, config){
      that.profile = data[0];
      if(that.profile.lookingForList == null){
        that.profile.lookingForList = [];
      }
    });


    var that = this;

    this.toggleSelection = function(selection){
      var index = that.profile.lookingForList.indexOf(selection);

      if(index > -1){
        that.profile.lookingForList.splice(index, 1);
      }

      else{
        that.profile.lookingForList.push(selection);
      }
    }

    this.editProfile = function(){

      var path = '/user/userid/' + that.profile.userid;
      $('#editSubmit').prop("disabled",true);
      $('#editSubmit').text('Working..');
      $http.put(path, that.profile)
      .success(function(data, status, headers, config){
        $('#editSubmit').prop("disabled",false);
        $('#editSubmit').text('Save Changes');
      });

    }


  }])

  .controller('MatchesController', ['$location', '$http', function($location, $http){

    this.matches = [];

    var that = this;

    $http.get('/user/matches')
    .success(function(data, status, headers, config){
      that.matches = data;
    });

    this.matchClicked = function(id){
      $location.url('/users/' + id);
    }

  }])

  .controller('MessagesController', ['$location','$http', '$scope', function($location, $http, $scope){
    this.inbox = [];
    this.outbox = [];
    this.new = {}; //new message to post to db

    this.messages = [];
    this.users = [];
    this.activeUser;
    this.myId = null;

    this.message = '';


    var that = this;
    $http.get('/message')
    .success(function(data, status, headers, config){
      // that.inbox = data.in;
      // //sort inbox: latest first
      // that.inbox.sort(function(a,b){
      //   var d_a = new Date(a.time);
      //   var d_b = new Date(b.time);
      //   if (d_a < d_b){
      //     return 1;
      //   } else if (d_a > d_b) {
      //     return -1;
      //   } else {
      //     return 0;
      //   }
      // });
      // that.outbox = data.out;
      // //sort outbox: latest first
      // that.outbox.sort(function(a,b){
      //   var d_a = new Date(a.time);
      //   var d_b = new Date(b.time);
      //   if (d_a < d_b){
      //     return 1;
      //   } else if (d_a > d_b) {
      //     return -1;
      //   } else {
      //     return 0;
      //   }
      // });
      // that.new.from = data.userid;
      that.myId = data.userid;

      var userSet = {};
      for(var i=0; i<data.in.length; i++){
        that.messages.push(data.in[i]);
        userSet[data.in[i].from] = data.in[i].from_name;
      }
      for(var i=0; i<data.out.length; i++){
        that.messages.push(data.out[i]);
        userSet[data.out[i].to] = data.out[i].to_name;
      }
      for(var key in userSet){
        that.users.push({id: key, name: userSet[key]});
      }
      that.activeUser = 0;
    });

    // //go to that user's profile on click
    // this.clicked = function(userid){
    //   console.log(userid);
    //   $location.url('/users/' + userid);
    // }
    //
    // this.deleteMsg = function(msgid){
    //   $http.delete('/message/msgid/'+msgid);
    // }
    //
    // this.sendMsg = function(){
    //   $http.post('/message',that.new);
    //   console.log(this.new.from);
    //   console.log(this.new.to);
    //   console.log(this.new.text);
    // }

    this.userClick = function(index){
      that.activeUser = index;
    }

    this.userClass = function(index){
      return (index == that.activeUser) ? ['active'] : [];
    }

    this.messageClass = function(message){
      return (message.from === that.myId) ? ['mine'] : [];
    }

    this.sendMessage = function(){
      var body = {
        to : that.users[that.activeUser].id,
        from : that.myId,
        text : that.message
      }
      $http.post('/message', body);
      that.messages.push(body);
      that.message = '';
      $scope.sendMessage.$setPristine();
    }


  }])

  .controller('UserController', ['$routeParams', '$http', function($routeParams, $http){

    this.id = $routeParams.id;

    this.profile = {}
    //   username : 'Steven',
    //   location : 'Newark, NJ',
    //   priceLow : 0,
    //   priceHigh : 1800,
    //   about : "I'm a professor in the Computer Science department at Columbia University. I joined the faculty here after many years at AT&T  Labs Research in Florham Park, New Jersey. I do research on networks, security and why the two don't get along.",
    //   lookingFor : 'You should be able to pay rent',
    //   lookingForList : ['Males', 'Females', 'Professionals']
    // };

    this.message = '';

    var that = this;

    $http.get('/user/userid/' + that.id)
    .success(function(data, status, headers, config){
      that.profile = data[0];
    });

    that.sendMessage = function(){
      var body = {
        text: that.message,
        to: that.id
      };
      $http.post('/message', body)
      .success(function(data, status, headers, config){
        $('#myModal').modal('hide');
      })

    }

  }]);


})();
