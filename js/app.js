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
  	  when('/signin', {templateUrl: 'html/signin.html', controller: SigninCtrl}).
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
 	$rootScope.photourl = 'http://placehold.it/100X100';

 	$rootScope.setUser = function(user) {
 		$rootScope.user = user;
 		if ($rootScope.user.attributes.gravatar) {
 			// Set image for gravatar
 			var hash = hex_md5($rootScope.user.attributes.email);
			$rootScope.photourl = 'http://www.gravatar.com/avatar/' + hash + '?s=100';
 		}
 	}

 	// Check for saved login
 	var currentUser = Parse.User.current();
 	if (currentUser) {
 		$rootScope.setUser(currentUser);
 		$rootScope.toggleLogIn(true);
 	}

 	// Sign out
 	$rootScope.signout = function() {

 		Parse.User.logOut();
 		$rootScope.user = {};
 		$rootScope.toggleLogIn(false);
 	}

 	// Sign in
 	$rootScope.loginUser = function(user) {

		$rootScope.setUser(user);
		$rootScope.toggleLogIn(true);
		window.location = '#/';
	}
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
	$('#email-info-tip').tooltip();
	$scope.alert = false;
	$scope.error = false;

	// sign up
	$scope.signup = function() {

		// Make sure passwords match
		if ($scope.newuser.password != $scope.newuser.passwordverify) {
			$scope.alert = true;
		}
		else {

			// Passwords match
			console.log('signing up');
			$scope.alert = false;
			var puser = new Parse.User();
			puser.set({'username': $scope.newuser.username});
			puser.set({'password': $scope.newuser.password});
			puser.set({'gravatar': $scope.newuser.gravatar});
			puser.set({'email': $scope.newuser.email});

			// use parse signup
			puser.signUp(null, {
				success: function(user) {
					// Hooray! Let them use the app now.
					$scope.loginUser(user);
				},
				error: function(user, error) {
					// Show the error message somewhere and let the user try again.
					$scope.error = true;
					$scope.$digest();
				}
			});
		}
	}
}

//*****************************************************************************
//  SIGNIN CTRL
//*****************************************************************************
function SigninCtrl($scope, $routeParams, $location) {

	$scope.setPageName('signin');
	$scope.error = false;

	$scope.signin = function() {

		Parse.User.logIn($scope.username, $scope.password, {
		  success: function(user) {
		    // Do stuff after successful login.
		    $scope.loginUser(user);
		  },
		  error: function(user, error) {
		    // The login failed. Check error to see why.
		    $scope.error = true;
		    $scope.$digest();
		  }
		});
	}
}
