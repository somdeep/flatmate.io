(function(){

  // include our submodules
  angular.module('flatmate.io',[
      'ngRoute',
  ])

  .config(['$routeProvider', function($routeProvider){
    $routeProvider.when('/',{
      templateUrl: 'templates/profile.html'
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

  .controller('MatchesController', ['$location', function($location){

    this.matchClicked = function(id){
      $location.url('/users/' + id);
    }

  }]);


})();
