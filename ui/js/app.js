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

  .controller('MatchesController', ['$location', function($location){

    this.matchClicked = function(id){
      $location.url('/users/' + id);
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

    var that = this;

    $http.get('/user/userid/' + that.id)
    .success(function(data, status, headers, config){
      that.profile = data[0];
    });

  }]);

})();
