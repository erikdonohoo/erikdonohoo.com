//*****************************************************************************
//  ANGULAR MODULE SETUP
//*****************************************************************************

var app = angular.module('app', []);
app.config(['$routeProvider', function($routeProvider,$locationProvider) {
  $routeProvider.
  	  when('/', {templateUrl: 'html/home.html', controller: HomeCtrl}).
  	  when('/games', {templateUrl: 'html/games.html', controller: GamesCtrl}).
  	  when('/about', {templateUrl: 'html/about.html', controller: AboutCtrl}).
  	  when('/about/:id', {templateUrl: 'html/about.html', controller: AboutCtrl}).
  	  when('/register', {templateUrl: 'html/register.html', controller: RegisterCtrl}).
  	  when('/signin', {templateUrl: 'html/signin.html', controller: SigninCtrl}).
  	  when('/account', {templateUrl: 'html/register.html', controller: RegisterCtrl}).
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
 	$rootScope.getLoggedInStatus = function() {
 		return $rootScope.loggedIn;
 	}
 	$rootScope.toggleLogIn = function(bool) {
 		$rootScope.loggedIn = bool;
 	}

 	// User
 	$rootScope.user = {};
 	$rootScope.photourl = 'img/default_user_icon.jpg';
 	$rootScope.profile = '';

 	$rootScope.setUser = function(user) {
 		$rootScope.user = user;
 		if ($rootScope.user.get('gravatar')) {
 			// Set image for gravatar
 			var hash = hex_md5($rootScope.user.get('email'));
			$rootScope.photourl = 'http://www.gravatar.com/avatar/' + hash + '?s=100';
			$rootScope.profile = 'http://www.gravatar.com/' + hash;
 		} else {
 			$rootScope.photourl = 'img/default_user_icon.jpg';
 		}
 	}
 	$rootScope.getUser = function() {
 		return $rootScope.user;
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
 		window.location = '#/';
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

	$scope.accounthelp = false;
	if ($routeParams.id) {
		$scope.accounthelp = true;
		$scope.setPageName('about_account');
	}
	else
		$scope.setPageName('about');
}

//*****************************************************************************
//  REGISTER CTRL
//*****************************************************************************
function RegisterCtrl($scope, $routeParams, $location) {

	if ($scope.getLoggedInStatus()) {

		// Don't come to register page if you are loggedIn
		if ($location.path() == '/register')
			$location.path('/');

		$scope.setPageName('account_change');
		$scope.logoMessage = 'Update your';
		$scope.buttonMessage = 'Update';
		var u = $scope.getUser();
		$scope.newuser = {};
		$scope.newuser.username = u.get('username');
		$scope.newuser.gravatar = u.get('gravatar');
		$scope.newuser.email = u.get('email');
	}
	else {
		$scope.setPageName('register');
		$scope.logoMessage = 'Create an';
		$scope.buttonMessage = 'Create';

		// Set gravatar to false
		$scope.newuser = {};
		$scope.newuser.gravatar = false;
	}

	// Set up tooltip
	$('#gravatar-tip').tooltip();
	$('#email-info-tip').tooltip();
	$('#whatsthis').tooltip();
	$scope.alert = false;
	$scope.error = false;
	$scope.updateerror = false;
	$scope.passwordreset = false;
	$scope.passwordreseterror = false;
	$scope.loading = false;
	$scope.updateloading = false;

	// sign up
	$scope.save = function() {

		// If not logged in, we are creating
		if (!$scope.getLoggedInStatus()) {

			// Make sure passwords match
			if ($scope.newuser.password != $scope.newuser.passwordverify) {
				$scope.alert = true;
			}
			else {

				// Passwords match
				$scope.loading = true;
				$scope.alert = false;
				var puser = new Parse.User();
				puser.set('username', $scope.newuser.username);
				puser.set('password', $scope.newuser.password);
				puser.set('gravatar', $scope.newuser.gravatar);
				puser.set('email', $scope.newuser.email);

				// use parse signup
				puser.signUp(null, {
					success: function(user) {
						// Hooray! Let them use the app now.
						$scope.loading = false;
						$scope.loginUser(user);
					},
					error: function(user, error) {
						// Show the error message somewhere and let the user try again.
						$scope.error = true;
						$scope.loading = false;
						$scope.errormessage = error.message;
						$scope.$digest();
					}
				});
			}
		}
		else { // We are updating a user

			$scope.updateloading = true;
			$scope.alert = false;
			var puser = $scope.getUser();
			puser.set('email', $scope.newuser.email);
			puser.set('gravatar', $scope.newuser.gravatar);

			// save parse user
			puser.save(null, {
				success: function(user) {
					
					$scope.updateloading = false;
					var u = $scope.getUser();
					u.set('email', user.get('email'));
					u.set('gravatar', user.get('gravatar'));
					$scope.loginUser(u);
					$scope.$digest();
				},
				error: function(user, error) {

					$scope.updateloading = false;
					$scope.updateerror = true;
					$scope.updatemessage = error.message;
					$scope.$digest();
				}
			})
		}
	}

	$scope.resetPassword = function() {

		// start loading spinner
		$scope.loading = true;
		Parse.User.requestPasswordReset($scope.getUser().attributes.email, {
			success: function() {
				// Password reset request was sent successfully
				$scope.passwordreset = true;
				$scope.loading = false;
				$scope.$digest();
			},
			error: function(error) {
				// Show the error message somewhere
				$scope.loading = false;
				$scope.passwordreseterror = true;
				$scope.$digest();
			}
		});
	}
}

//*****************************************************************************
//  SIGNIN CTRL
//*****************************************************************************
function SigninCtrl($scope, $routeParams, $location) {

	// Go home if you are already loggedIn
	if($scope.getLoggedInStatus())
		$location.path('/');

	$scope.setPageName('signin');
	$scope.error = false;
	$scope.loading = false;

	$scope.signin = function() {

		// start loading gif
		$scope.loading = true;
		Parse.User.logIn($scope.username, $scope.password, {
		  success: function(user) {
		    // Do stuff after successful login.
		    $scope.loading = false;
		    $scope.loginUser(user);
		  },
		  error: function(user, error) {
		    // The login failed. Check error to see why.
		    $scope.error = true;
		    $scope.loading = false;
		    $scope.errormessage = error.message;
		    $scope.$digest();
		  }
		});
	}

	$scope.resetPassword = function() {

		// start loading spinner
		$scope.loading = true;
		Parse.User.requestPasswordReset($scope.passwordresetemail, {
			success: function() {
				// Password reset request was sent successfully
				$scope.passwordreset = true;
				$scope.loading = false;
				$scope.$digest();
			},
			error: function(error) {
				// Show the error message somewhere
				$scope.loading = false;
				$scope.error = true;
				$scope.errormessage = error.message;
				$scope.$digest();
			}
		});
	}
}
