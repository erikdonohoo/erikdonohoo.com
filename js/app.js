//*****************************************************************************
//  ANGULAR MODULE SETUP
//*****************************************************************************

var app = angular.module('app', []);
app.config(['$routeProvider', function($routeProvider,$locationProvider) {
  $routeProvider.
  	  when('/', {templateUrl: 'html/home.html', controller: HomeCtrl}).
  	  when('/games', {templateUrl: 'html/games.html', controller: GamesCtrl}).
  	  when('/about', {templateUrl: 'html/about.html', controller: AboutCtrl}).
  	  when('/register', {templateUrl: 'html/register.html', controller: RegisterCtrl}).
      otherwise({redirectTo: '/'});
}]);

//*****************************************************************************
//  ROOTSCOPE SETUP
//*****************************************************************************
app.run(function($rootScope) {
 	
 	// Page name
 	$rootScope.pageName = '';
 	$rootScope.getPageName = function() {
 		return $rootScope.pageName;
 	}
 	$rootScope.setPageName = function(name) {
 		$rootScope.pageName = name;
 	}

 	// Logged In
 	$rootScope.loggedIn = false;
 	$rootScope.toggleLogIn = function(bool) {
 		$rootScope.loggedIn = bool;
 	}

 	// User
 	$rootScope.user = {};
 	$rootScope.user.name = 'Cool User';
 	$rootScope.user.imgsrc = 'http://placehold.it/100X100';
});

//*****************************************************************************
//  HOME CTRL
//*****************************************************************************
function HomeCtrl($scope, $routeParams, $location) {

	$scope.setPageName('home');
}

//*****************************************************************************
//  GAMES CTRL
//*****************************************************************************
function GamesCtrl($scope, $routeParams, $location) {

	$scope.setPageName('games');
}

//*****************************************************************************
//  ABOUT CTRL
//*****************************************************************************
function AboutCtrl($scope, $routeParams, $location) {

	$scope.setPageName('about');
}

//*****************************************************************************
//  REGISTER CTRL
//*****************************************************************************
function RegisterCtrl($scope, $routeParams, $location) {

	$scope.setPageName('register');

	// Set up tooltip
	$('#gravatar-tip').tooltip();
}