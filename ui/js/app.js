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
      templateUrl: 'templates/user.html'
    })
    .otherwise({redirectTo: '/'});

  }])

  .controller('ProfileController', function(){

    this.lookingForOptions = ['Males', 'Females', 'Students', 'Professionals'];

    this.profile = {
      username : 'matt',
      location : 'White Plains, NY',
      priceLow : 0,
      priceHigh : 1800,
      about : 'Looking for a roommate. Don\'t be creepy',
      lookingFor : 'You should be able to pay rent',
      lookingForList : ['Males', 'Females', 'Professionals']
    };

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

    }


  })

  .controller('MatchesController', ['$location', function($location){

    this.matchClicked = function(id){
      $location.url('/users/' + id);
    }

  }]);


})();
