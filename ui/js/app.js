(function(){

  // include our submodules
  angular.module('flatmate.io',[
      'ngRoute',
  ])

  .config(['$routeProvider', function($routeProvider){
    $routeProvider.when('/',{
      templateUrl: 'templates/profile.html'
    })
    .otherwise({redirectTo: '/'});

  }]);


})();
