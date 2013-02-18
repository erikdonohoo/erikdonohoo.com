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
  	  when('/snake', {templateUrl: 'html/snake.html', controller: SnakeCtrl}).
  	  when('/mario', {templateUrl: 'html/mario.html', controller: MarioCtrl}).
      otherwise({redirectTo: '/'});
}]);

//*****************************************************************************
//  ROOTSCOPE SETUP
//*****************************************************************************
app.run(function($rootScope, $route) {

 	
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
 		$('#profile-img').tooltip('destroy');
 		if ($rootScope.user.get('gravatar')) {
 			// Set image for gravatar
 			var hash = hex_md5($rootScope.user.get('email'));
			$rootScope.photourl = 'http://www.gravatar.com/avatar/' + hash + '?s=100';
			$rootScope.profile = 'http://www.gravatar.com/' + hash;
			$('#profile-img').tooltip({'placement': 'right'});
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
 	$rootScope.signingOut = false;
 	$rootScope.setSigningOut = function(b) {
 		$rootScope.signingOut = b;
 	}
 	$rootScope.getSigningOut = function() {
 		return $rootScope.signingOut;
 	}
 	$rootScope.signout = function(wantsToLeave) {

 		$rootScope.signingOut = true;
 		if (!$rootScope.stillPlaying) {

 			Parse.User.logOut();
	 		$rootScope.user = {};
	 		$rootScope.toggleLogIn(false);
	 		$rootScope.signingOut = false;
	 		window.location = '#/';
 		}
 		else if ($rootScope.stillPlaying && wantsToLeave) {
	 
	 		$('#pageLeave').on('hidden', function(){
	 			Parse.User.logOut();
		 		$rootScope.user = {};
		 		$rootScope.toggleLogIn(false);
		 		$rootScope.signingOut = false;
		 		var wasPlaying = $rootScope.stillPlaying;
		 		$rootScope.stillPlaying = false;
	 			window.location = '#/';
	 		});
	 		$('#pageLeave').modal('hide');

	 	} else {
	 		$('#pageLeave').modal('show');
	 		$('#pageLeave').on('hidden', function(){
	 			$rootScope.signingOut = false;
	 		});
	 	}
 	}

 	// Sign in
 	$rootScope.loginUser = function(user) {

		$rootScope.setUser(user);
		$rootScope.toggleLogIn(true);
		window.location = $rootScope.lastPage;
	}

	// Score Saved (Any game)
	$rootScope.stillPlaying = false;
	$rootScope.getStillPlaying = function() {
		return $rootScope.stillPlaying;
	}
	$rootScope.setStillPlaying = function(playing) {
		$rootScope.stillPlaying = playing;
	}

	// Snake Scores
	$rootScope.snakeScores = [];
	$rootScope.snakeBest = 0;
	$rootScope.getSnakeScores = function() {
		return $rootScope.snakeScores;
	}
	$rootScope.setSnakeScores = function(scores) {
		$rootScope.snakeScores = scores;
	}
	$rootScope.getSnakeBest = function() {
		return $rootScope.snakeBest;
	}
	$rootScope.setSnakeBest = function(best) {
		$rootScope.snakeBest = best;
	}

	// Mario Scores
	$rootScope.marioScores = [];
	$rootScope.marioBest = 0;
	$rootScope.getMarioScores = function() {
		return $rootScope.marioScores;
	}
	$rootScope.setMarioScores = function(scores) {
		$rootScope.marioScores = scores;
	}
	$rootScope.getMarioBest = function() {
		return $rootScope.marioBest;
	}
	$rootScope.setMarioBest = function(best) {
		$rootScope.marioBest = best;
	}

	// Keep track of last page
	$rootScope.lastPage = ''
	$rootScope.getLastPage = function() {
		return $rootScope.lastPage;
	}
	$rootScope.$on('$locationChangeStart', function(event, next, current){
		$rootScope.lastPage = '#' + current.substring(current.indexOf('#') + 1);
	});

});


//*****************************************************************************
//  HOME CTRL
//*****************************************************************************
function HomeCtrl($scope, $routeParams, $location, $route) {

	$scope.setPageName('home');
}

//*****************************************************************************
//  GAMES CTRL
//*****************************************************************************
function GamesCtrl($scope, $routeParams, $location) {

	$scope.setPageName('games');

	$('.game-popover').popover({ placement: 'bottom', html: true});
}

//*****************************************************************************
//  MARIO CTRL
//*****************************************************************************
function MarioCtrl($scope, $routeParams, $location) {

	$scope.setPageName('mario');

	$scope.personalBest = 0;
	$scope.scores = [];
	$scope.loading = false;
	$scope.setStillPlaying(false);

	var MarioScore = Parse.Object.extend('MarioScore'); // For game scores

	// Get high scores
	$scope.pullScores = function(refresh) {

		if (refresh || $scope.getMarioScores().length == 0) {

			$scope.loading = true;
			var query = new Parse.Query(MarioScore);
			query.descending('score');
			query.include('user');
			query.limit(10);
			query.find({
				success:function(results) {
					// Got top scores
					$scope.loading = false;
					if (results.length != 0) {
						$scope.scores = results;
						$scope.setMarioScores($scope.scores);
					}
					$scope.$apply();
				},
				error:function(error) {
					// Error getting scores
					$scope.loading = false;
					$scope.marioerror = true;
					$scope.errormessage = error.message;
					$scope.$apply();
				}
			});
			var pquery = new Parse.Query(MarioScore);
			query.equalTo('user', $scope.getUser());
			query.descending('score');
			query.first({
				success:function(result) {
					// Got personal best
					if (result) {
						$scope.personalBest = result.attributes.score;
						$scope.setMarioBest($scope.personalBest);
						$scope.$apply();
					}
				},
				error:function(error) {
					// Error
					$scope.marioerror = true;
					$scope.errormessage = error.message;
					$scope.$apply();
				}
			});

		} else {

			$scope.scores = $scope.getMarioScores();
			$scope.personalBest = $scope.getMarioBest();
		}
	}

	if ($scope.getLoggedInStatus()) {
		$scope.pullScores(false);
	}

	// THIS CODE PREVENTS A PAGE CHANGE
	$scope.readytoleave = false;
	$scope.gotonext = '';

	$scope.$on('$locationChangeStart', function(event, next, current){
		if(!$scope.readytoleave && $scope.getLoggedInStatus() && $scope.getStillPlaying()) {
		    event.preventDefault();
		    $scope.gotonext = '#' + next.substring(next.indexOf('#') + 1);
		    $('#pageLeave').modal('show');
		}
	});

	$scope.leave = function() {
		$('#pageLeave').on('hidden', function() {
			window.location = $scope.gotonext;
		});
		$('#pageLeave').modal('hide');
		$scope.readytoleave = true;
		$scope.setStillPlaying(false);
	}

	// Angular ng-models
	$scope.started = false;
	$scope.gameover = false;
	$scope.paused = false;
	$scope.score = 0;
	$scope.scoreToSave = false;

	// Pause/Start gameplay
	$scope.togglePlay = function() {

		if ($scope.started) {

			// Pause or unpause game
			$scope.paused = !$scope.paused;

			if ($scope.paused) {

				clearTimeout(timer);
				document.getElementById('theme').pause();

			} else {

				timer = setTimeout(gameLoop, GAME_SPEED);

				// Reset save button
				$('#savescorebutton').button('reset');
			}

		} else {

			// Kick off initial start
			// Reset save button
			$('#savescorebutton').button('reset');
			$scope.started = true;
			$scope.gameover = false;
			$scope.setStillPlaying(true);
			$scope.score = 0;
			startGame();
		}
	}

	// Init Canvas
	$scope.initCanvas = function() {
		
		// Set up canvas context
		c = $('#mariocanvas')[0];
		canvas = c.getContext('2d');

		// Add event listeners
		$(document).unbind('keydown');
		$(document).bind('keydown',function(e){
			if (e.which == KEYBOARD_DOWN) {
				e.preventDefault();
				
				if (!mario.crouching) {
					mario.y = mario.y + (mario.normalHeight - mario.crouchHeight);
					mario.height = mario.crouchHeight;
					mario.crouching = true;
				}
			}
			else if (e.which == KEYBOARD_UP) {
				e.preventDefault();
				if (!mario.inAir) {
					mario.movingUp = true;
					mario.inAir = true;
					document.getElementById('boing').load();
					document.getElementById('boing').play();
				}
				if (mario.inAir && !mario.doubleJumping && mario.canDoubleJump) {
					mario.doubleJumping = true;
					mario.canDoubleJump = false;
					mario.upVelocity = mario.jumpSpeed;
					document.getElementById('boing').load();
					document.getElementById('boing').play();
				}
			}
		});
		$(document).bind('keyup', function(e){
			if (e.which == KEYBOARD_DOWN) {
				e.preventDefault();
				mario.crouching = false;
				mario.y = mario.y - (mario.normalHeight - mario.crouchHeight);
				mario.height = mario.normalHeight;
			}
			else if (e.which == KEYBOARD_UP) {
				e.preventDefault();
				mario.movingUp = false;
				if (mario.upVelocity > mario.fallSpeed)
					mario.upVelocity = mario.fallSpeed;
				if (!mario.doubleJumping) {
					mario.canDoubleJump = true;
				}
			}
		});

		// Draw initial game screen
		// TODO
		background = new Background();
		mario = new Mario();
		$scope.gameover = false;
	}

	// Save score
	$scope.saveScore = function() {

		// Make sure there is a score to save
		if ($scope.scoreToSave) {

			var marioscore = new MarioScore();
			marioscore.set('score', $scope.score);
			marioscore.set('user', $scope.getUser());

			$('#savescorebutton').button('loading');
			marioscore.save(null,{
				success: function(score) {
					// Saved
					$('#savescorebutton').button('complete');
					$scope.scoreToSave = false;
					$scope.setStillPlaying(false);
					$scope.pullScores(true);
					$scope.$apply();
				},
				error: function(score, error) {
					// Error
					$('#savescorebutton').button('complete');
					$scope.scoreToSave = false;
					$scope.$apply();
				}
			});
		}
	}

	/////////////////
	// Game values //
	/////////////////
	var c; 	//......................................// DOM element for canvas
	var canvas;	//..................................// canvas context for drawing
	var timer; //...................................// game timer
	var KEYBOARD_UP = 38;	//......................// Define up key
	var KEYBOARD_DOWN = 40;	//......................// Define down key
	var GROUND_HEIGHT = 25; //......................// Define ground height
	var BOARD_SIZE = 400; //........................// Define board size
	var GAME_SPEED = 1000/60; //....................// 48 FPS

	// Objects
	var background;
	var mario;
	var enemies = [];
	var coins = [];

	// Define background, and all its movement
	function Background() {

		// Ground
		var self = this;
		var ground = new Image();
		ground.src = '../img/mario/marioground.png';
		var groundwidth = 150;
		var groundspeed = 1.5;
		var groundcurposition = 0;
		var groundminposition = -groundwidth;

		// World
		var world = new Image();
		world.src = '../img/mario/marioworld.png';
		var worldwidth = 3000;
		var worldspeed = 0.5;
		var worldcurposition = 0;
		var worldminposition = -worldwidth;
		var worldyclip = 100;

		world.onload = function() { self.draw(); }
		ground.onload = function() { self.draw(); }

		this.draw = function() {

			// temp light blue
			canvas.fillStyle = '#bfeeff';
			canvas.fillRect(0,0,BOARD_SIZE,BOARD_SIZE);

			// world
			canvas.drawImage(world, 0, worldyclip, worldwidth, BOARD_SIZE, worldcurposition, 0, worldwidth, BOARD_SIZE);
			canvas.drawImage(world, 0, worldyclip, worldwidth, BOARD_SIZE, worldcurposition + worldwidth, 0, worldwidth, BOARD_SIZE);

			// ground
			canvas.drawImage(ground, groundcurposition, BOARD_SIZE - GROUND_HEIGHT, groundwidth, GROUND_HEIGHT);
			canvas.drawImage(ground, groundcurposition + groundwidth, BOARD_SIZE - GROUND_HEIGHT, groundwidth, GROUND_HEIGHT);
			canvas.drawImage(ground, groundcurposition + (groundwidth * 2), BOARD_SIZE - GROUND_HEIGHT, groundwidth, GROUND_HEIGHT);
			canvas.drawImage(ground, groundcurposition + (groundwidth * 3), BOARD_SIZE - GROUND_HEIGHT, groundwidth, GROUND_HEIGHT);
		}

		this.move = function() {

			groundcurposition -= groundspeed;
			if (groundcurposition <= groundminposition) {
				groundcurposition = 0;
			}
			worldcurposition -= worldspeed;
			if (worldcurposition <= worldminposition) {
				worldcurposition = 0;
			}
		}
	}

	// Mario character

	function Mario() {

		var self = this;
		var marioWalkXCrop = 197;
		var marioWalkX2Crop = 214;
		var curWalkXCrop = marioWalkXCrop;
		var marioYCrop = 48;
		var marioJumpXCrop = 271;
		var marioCrouchXCrop = 379;
		var marioPushXCrop = 252;
		var marioDieXCrop = 679;
		var marioCrouchYCrop = 57;
		var marioImgWidth = 16;
		var marioImgHeight = 27;
		var marioCrouchImgHeight = 18;
		var marioCrouchHeight = 18 * (3/2);
		var marioWidth = marioImgWidth * (3/2);
		var marioHeight = marioImgHeight * (3/2);
		var MARIO_START_X = BOARD_SIZE / 3;
		var MARIO_START_Y = BOARD_SIZE - (GROUND_HEIGHT + marioHeight);
		var jumpSpeed = 6.5;
		var walkFrames = 13;
		var walkCount = 0;

		var marioImg = new Image();
		marioImg.src = '../img/mario/mariogood.png';
		marioImg.onload = function() { self.draw(); };

		this.y = MARIO_START_Y;
		this.x = MARIO_START_X;
		this.jumpSpeed = jumpSpeed;
		this.movingUp = false;
		this.doubleJumping = false;
		this.inAir = false;
		this.dying = false;
		this.upVelocity = jumpSpeed;
		this.decceleration = 0.18;
		this.bounce = 2.5;
		this.fallSpeed = 3;
		this.normalHeight = marioHeight;
		this.crouchHeight = marioCrouchHeight;
		this.dieWidth = 26;
		this.height = marioHeight;
		this.width = marioWidth;

		this.draw = function() {

			if (this.crouching) {
				canvas.drawImage(marioImg, marioCrouchXCrop, marioCrouchYCrop, marioImgWidth, marioCrouchImgHeight, this.x, this.y, this.width, this.height);
			}
			else if (this.dying) {
				canvas.drawImage(marioImg, marioDieXCrop, marioYCrop, this.dieWidth, marioImgHeight, this.x, this.y, this.dieWidth, this.height);
			} else if (this.inAir) {
				canvas.drawImage(marioImg, marioJumpXCrop, marioYCrop, marioImgWidth, marioImgHeight, this.x, this.y, this.width, this.height);
			} else {
				walkCount++;
				if (walkCount == walkFrames) {
					walkCount = 0;
					curWalkXCrop = (curWalkXCrop == marioWalkXCrop) ? marioWalkX2Crop : marioWalkXCrop;
				}

				canvas.drawImage(marioImg, curWalkXCrop, marioYCrop, marioImgWidth, marioImgHeight, this.x, this.y, this.width, this.height);
			}
		}

		this.move = function() {

			if (this.inAir || this.dying) {
				this.y -= this.upVelocity;
				this.upVelocity -= this.decceleration;
			}

			if (this.y > MARIO_START_Y && !this.crouching && !this.dying) {
				this.y = MARIO_START_Y;
				this.upVelocity = jumpSpeed;
				this.movingUp = false;
				this.inAir = false;
				this.doubleJumping = false;
				this.canDoubleJump = false;
				mario.removeTouches();
			} else if (this.y > MARIO_START_Y + (marioHeight - marioCrouchHeight) && !this.dying) {
				this.y = MARIO_START_Y + (marioHeight - marioCrouchHeight);
				this.upVelocity = jumpSpeed;
				this.movingUp = false;
				this.inAir = false;
				this.doubleJumping = false;
				this.canDoubleJump = false;
				mario.removeTouches();
			}
		}

		this.removeTouches = function() {

			for (var i = enemies.length - 1; i >= 0; i--) {
				if (enemies[i].marioTouched)
					enemies[i].marioTouched = false;
			};
		}
	}

	// Define coin
	var coin = new Image();
	coin.src = '../img/mario/coin.png';
	function Coin() {

		var self = this;
		this.width = 70 * (2/5);
		this.height = 70 * (2/5);
		this.x = BOARD_SIZE + this.width;
		var notTooHigh = 125;
		this.y = Math.floor(Math.random() * (BOARD_SIZE - GROUND_HEIGHT - this.height - notTooHigh)) + notTooHigh;
		var speed = 1.5;

		this.offScreen = false;

		this.draw = function() {

			canvas.drawImage(coin, this.x, this.y, this.width, this.height);
		}

		this.move = function() {

			this.x -= speed;
			if (this.x + this.width < 0)
				this.offScreen = true;
		}
	}

	// Define bullet bill enemies
	var bill = new Image();
	bill.src = '../img/mario/bulletbill.png';
	function BulletBill() {

		var self = this;
		this.width = 70 * (3/4);
		this.height = 50 * (3/4);
		this.x = BOARD_SIZE + this.width;
		var notTooHigh = 100;
		this.y = Math.floor(Math.random() * (BOARD_SIZE - GROUND_HEIGHT - this.height - notTooHigh)) + notTooHigh;
		var speed = 3;
		

		this.offScreen = false;
		this.dying = false;
		this.canBeKilled = true;
		this.worth = 2;
		this.fallSpeed = 4.3;

		this.draw = function() {

			if(this.dying) {
				canvas.save();
				canvas.translate(this.x, this.y + this.height);
				canvas.scale(1,-1);
				var oldx = this.x; var oldy = this.y;
				this.x = 0;
				this.y = 0;
			}

			canvas.drawImage(bill, this.x, this.y, this.width, this.height);

			if (this.dying) {
				canvas.restore();
				this.x = oldx; this.y = oldy;
			}
		}

		this.move = function() {

			this.x -= speed;
			if (this.x + this.width < 0)
				this.offScreen = true;

			if (this.dying) {
				this.y += this.fallSpeed;
				if (this.y > BOARD_SIZE)
					this.offScreen = true;
			}
		}
	}

	// Shell
	var shell = new Image();
	shell.src = '../img/mario/shell.png';
	function Shell() {

		var speed = 4;
		this.width = 28;
		this.height = 22;
		this.x = BOARD_SIZE;
		this.y = BOARD_SIZE - (GROUND_HEIGHT + this.height);

		this.offScreen = false;
		this.dying = false;
		this.canBeKilled = true;
		this.worth = 3;
		this.fallSpeed = 4.3;

		this.draw = function() {

			if(this.dying) {
				canvas.save();
				canvas.translate(this.x, this.y + this.height);
				canvas.scale(1,-1);
				var oldx = this.x; var oldy = this.y;
				this.x = 0;
				this.y = 0;
			}

			canvas.drawImage(shell, this.x, this.y, this.width, this.height);

			if (this.dying) {
				canvas.restore();
				this.x = oldx; this.y = oldy;
			}
		}

		this.move = function() {

			this.x -= speed;
			if (this.x + this.width < 0)
				this.offScreen = true;

			if (this.dying) {
				this.y += this.fallSpeed;
				if (this.y > BOARD_SIZE)
					this.offScreen = true;
			}
		}
	}

	// Pencils
	var pencil = new Image();
	pencil.src = '../img/mario/pencil.png';
	function Pencil() {

		var speed = 1.5;
		this.height = 30;
		this.width = 150;
		this.x = BOARD_SIZE;
		var tooHigh = 160;
		this.y = Math.floor(Math.random() * (BOARD_SIZE - GROUND_HEIGHT - (this.height * 2) - tooHigh)) + tooHigh;
		this.marioOn = false;

		this.canWalkOn = true;
		this.marioTouched = false;

		this.draw = function() {
			canvas.drawImage(pencil, this.x, this.y, this.width, this.height);
		}

		this.move = function() {

			this.x -= speed;
			if (this.x + this.width < 0)
				this.offScreen = true;

			if (this.marioOn && !mario.inAir) {
				// See if mario needs to fall off the end
				var rightEdge = this.x + this.width;
				if (rightEdge < mario.x) {
					// Make mario fall
					mario.inAir = true;
					mario.doubleJumping = true; // Forces fall
					this.marioOn = false;
					mario.upVelocity = 0;
				}
			}
			else if (this.marioOn && mario.inAir) {
				// mario jumped off
				this.marioOn = false;
			}
		}
	}
	// Spikes
	var spike = new Image();
	spike.src = '../img/mario/spikes.png';
	function Spikes() {

		// Long medium or short (1,2,3)
		var MAX_LENGTH = 3;
		var length = Math.floor(Math.random() * MAX_LENGTH) + 1;
		length = (length > MAX_LENGTH) ? 2 : length;
		var singleSpike = 55;
		var speed = 1.5;
		this.width = singleSpike * length;
		this.length = singleSpike;
		this.height = 10;
		this.x = BOARD_SIZE;
		this.y = BOARD_SIZE - (GROUND_HEIGHT + this.height);

		this.offScreen = false;

		this.draw = function() {

			for (var i = 0; i < length; i++) {
				canvas.drawImage(spike, this.x + (singleSpike * i), this.y, this.length, this.height);
			}
		}

		this.move = function() {

			this.x -= speed;
			if (this.x + this.width < 0)
				this.offScreen = true;
		}
	}

	// Setup game objects, start loop
	function startGame() {

		background = new Background();
		mario = new Mario();
		coins = [];
		enemies = [];
		document.getElementById('theme').load();
		document.getElementById('theme').play();
		gameLoop();
	}

	// Create enemies at random intervals
	var maxEnemyTime = 450;
	var minEnemyTime = 100;
	var MINMIN = 30;
	var MINMAX = 120;
	var speedUpMax = 2;
	var speedUpMin = 1;
	var curTime = Math.floor(Math.random() * (maxEnemyTime - minEnemyTime)) + minEnemyTime;
	var enemyCounter = 0;
	var totalKindsOfEnemy = 11;
	function createStuff() {

		if (enemyCounter < curTime) {
			enemyCounter++;
		} else {
			// Create enemy
			var which = Math.floor(Math.random() * totalKindsOfEnemy);
			which = (which == totalKindsOfEnemy) ? 1 : which;
			var enemy = null;
			var coin = null;
			switch (which) {

				case 0:
					enemy = new BulletBill();
					break;
				case 1:
					coin = new Coin();
					break;
				case 2:
					coin = new Coin();
					break;
				case 3:
					enemy = new Shell();
					break;
				case 4:
					enemy = new Spikes();
					break;
				case 5:
					coin = new Coin();
					break;
				case 6:
					enemy = new BulletBill();
					break;
				case 7:
					enemy = new Shell();
					break;
				case 8:
					enemy = new Pencil();
					break;
				case 9:
					enemy = new Pencil();
					break;
				case 10:
					coin = new Coin();
					break;
				default:
					enemy = new Spikes();
			}

			if (enemy)
				enemies.push(enemy);
			if (coin)
				coins.push(coin);

			curTime = Math.floor(Math.random() * (maxEnemyTime - minEnemyTime)) + minEnemyTime;
			enemyCounter = 0;

			if (maxEnemyTime > MINMAX)
				maxEnemyTime -= speedUpMax;
			if (minEnemyTime > MINMIN)
				minEnemyTime -= speedUpMin;
		}
	}

	// Handle collisions with mario
	var accuracy = 4;
	function detectCollisions() {

		// Go through each enemy, see if mario collides
		// Go through each coin, see if mario collects
		for (var i = enemies.length - 1; i >= 0; i--) {

			var cur = enemies[i];

			// Check x collisions
			if (withinX(cur,mario)) {

				if (withinY(cur,mario)) {

					// Collision
					// Determine if mario killed it
					if (cur.canBeKilled  || cur.canWalkOn) {

						var bottom = mario.y + mario.height;
						var curbottom = cur.y + cur.height;
						if (bottom - cur.y <= Math.abs(mario.upVelocity) || bottom - cur.y <= accuracy) { // Use moving speed for accuracy tolerance

							if (cur.canBeKilled) {
								mario.upVelocity = mario.bounce;
								cur.dying = true;
								$scope.score += cur.worth;
								$scope.$apply();
							}
							else {
								// Mario walks on it
								if (!cur.marioOn) {
									cur.marioOn = true;
									mario.inAir = false;
									mario.y = cur.y - mario.height;
									mario.upVelocity = mario.jumpSpeed;
									mario.movingUp = false;
									mario.doubleJumping = false;
									mario.canDoubleJump = false;
								}
							}

						} else if (mario.y - curbottom <= Math.abs(mario.upVelocity) && cur.canWalkOn) { // hit bottom of pencil
							if (!cur.marioTouched) {
								cur.marioTouched = true;
								mario.upVelocity = 0;
								mario.doubleJumping = true;
								mario.inAir = true;
							}
						}else {

							$scope.gameover = true;
							$scope.$apply();
						}

					} else {

						if (cur.canPushMario) {
							// pipes ? maybe
						}
						else {

							$scope.gameover = true;
							$scope.$apply();
						}
					}
				}
			}
		};

		for (var i = coins.length - 1; i >= 0; i--) {
			var coin = coins[i];

			if (withinX(coin,mario)) {
				if (withinY(coin,mario)) {

					// Collect coin
					coin.offScreen = true;
					document.getElementById('chime').load();
					document.getElementById('chime').play();
					// Play sound
					$scope.score++;
					$scope.$apply();
				}
			}
		};

	}

	// Check two objects with x and width properties and see if they meet
	function withinX(one, two) {

		if (one.x >= two.x && one.x <= two.x + two.width) {
			return true;
		}
		if (two.x >= one.x && two.x <= one.x + one.width) {
			return true;
		}

		return false;
	}
	function withinY(one, two) {

		if (one.y <= two.y + two.height && one.y >= two.y) {
			return true;
		}
		if (two.y <= one.y + one.height && two.y >= one.y) {
			return true;
		}

		return false;
	}

	// Game loop
	function gameLoop() {

		background.move();
		background.draw();
		mario.draw();
		mario.move();
		detectCollisions();
		createStuff();
		var tempEnemies = [];
		for (var i = enemies.length - 1; i >= 0; i--) {
			enemies[i].move();
			if (!enemies[i].offScreen)
				tempEnemies.splice(0,0,enemies[i]);
		};
		enemies = tempEnemies;
		for (var i = enemies.length - 1; i >= 0; i--) {
			enemies[i].draw();
		};
		var tempCoins = [];
		for (var i = coins.length - 1; i >= 0; i--) {
			coins[i].move();
			if (!coins[i].offScreen)
				tempCoins.splice(0,0,coins[i]);
		};
		coins = tempCoins;
		for (var i = coins.length - 1; i >= 0; i--) {
			coins[i].draw();
		};

		if (!$scope.gameover)
			timer = setTimeout(gameLoop, GAME_SPEED);
		else
			gameOver();
	}

	// mario die animation
	function marioDie() {

		background.draw();
		for (var i = enemies.length - 1; i >= 0; i--) {
			enemies[i].draw();
		};
		for (var i = coins.length - 1; i >= 0; i--) {
			coins[i].draw();
		};
		mario.move();
		mario.draw();

		if (mario.y < BOARD_SIZE) {
			timer = setTimeout(marioDie, GAME_SPEED);
		}
		else {
			$scope.started = false;
			$scope.paused = false;
			$scope.scoreToSave = true;
			canvas.font = "32px Arial";
			canvas.textAlign = 'center';
			canvas.fillText("Game Over", 200,200);
			canvas.font = "17px Arial";
			$scope.$apply();
		}
	}

	// End game
	function gameOver() {

		// Do something with Mario
		// Draw Mario dying
		mario.dying = true;
		mario.upVelocity = mario.fallSpeed;
		document.getElementById('theme').pause();
		marioDie();
	}

	// init the canvas
	setTimeout(function() { $scope.initCanvas(); }, 60);
}

//*****************************************************************************
//  SNAKE CTRL
//*****************************************************************************
function SnakeCtrl($scope, $routeParams, $location) {

	$scope.setPageName('snake');

	$scope.personalBest = 0;
	$scope.scores = [];
	$scope.loading = false;
	$scope.setStillPlaying(false);

	// Get high scores
	$scope.pullScores = function(refresh) {

		if (refresh || $scope.getSnakeScores().length == 0) {

			$scope.loading = true;
			var SnakeScore = Parse.Object.extend('SnakeScore');
			var query = new Parse.Query(SnakeScore);
			query.descending('score');
			query.include('user');
			query.limit(10);
			query.find({
				success:function(results) {
					// Got top scores
					$scope.loading = false;
					if (results.length != 0) {
						$scope.scores = results;
						$scope.setSnakeScores($scope.scores);
					}
					$scope.$apply();
				},
				error:function(error) {
					// Error getting scores
					$scope.snakeerror = true;
					$scope.errormessage = error.message;
					$scope.$apply();
				}
			});
			var pquery = new Parse.Query(SnakeScore);
			query.equalTo('user', $scope.getUser());
			query.descending('score');
			query.first({
				success:function(result) {
					// Got personal best
					if (result) {
						$scope.personalBest = result.attributes.score;
						$scope.setSnakeBest($scope.personalBest);
						$scope.$apply();
					}
				},
				error:function(error) {
					// Error
					$scope.snakeerror = true;
					$scope.errormessage = error.message;
					$scope.$apply();
				}
			});

		} else {

			$scope.scores = $scope.getSnakeScores();
			$scope.personalBest = $scope.getSnakeBest();
		}
	}

	if ($scope.getLoggedInStatus()) {
		$scope.pullScores(false);
	}

	// THIS CODE PREVENTS A PAGE CHANGE
	$scope.readytoleave = false;
	$scope.gotonext = '';

	$scope.$on('$locationChangeStart', function(event, next, current){
		if(!$scope.readytoleave && $scope.getLoggedInStatus() && $scope.getStillPlaying()) {
		    event.preventDefault();
		    $scope.gotonext = '#' + next.substring(next.indexOf('#') + 1);
		    $('#pageLeave').modal('show');
		}
	});

	$scope.leave = function() {
		$('#pageLeave').on('hidden', function() {
			window.location = $scope.gotonext;
		});
		$('#pageLeave').modal('hide');
		$scope.readytoleave = true;
		$scope.setStillPlaying(false);
	}

	// Angular ng-models
	$scope.started = false;
	$scope.gameover = false;
	$scope.paused = false;
	$scope.score = 0;
	$scope.scoreToSave = false;

	// Position Struct
	function Position(x,y) {
		this.x = x;
		this.y = y;
	}

	/////////////////
	// Game values //
	/////////////////
	var c; 	//......................................// DOM element for canvas
	var canvas;	//..................................// canvas context for drawing
	var timer;	//..................................// game animation timer
	var BOARD_SIZE = 24;  //........................// Points on the board (x,y) MUST be even
	var LEFT = new Position(-1,0);	//..............// Define LEFT
	var RIGHT = new Position(1,0);	//..............// Define RIGHT
	var UP = new Position(0,-1);	//..............// Define UP
	var DOWN = new Position(0,1);	//..............// Define DOWN
	var KEYBOARD_UP = 38;	//......................// Define I key
	var KEYBOARD_DOWN = 40;	//......................// Define K key
	var KEYBOARD_LEFT = 37;	//......................// Define J key
	var KEYBOARD_RIGHT = 39;	//..................// Define L key
	var SNAKE_PIECE_SIZE = 10;	//..................// Size of snake Pieces (pixels)
	var GAP_SIZE = 3;	//..........................// Gap between spaces on board
	var SQUARE_SIZE = 16;	//......................// Size of squares in pixels
	var STARTING_CENTER = (BOARD_SIZE / 2) - 1;	//..// Starting point for snake
	var GAME_SPEED;	//..............................// Current Game Speed for snake
	var MAX_SPEED = 50;	//..........................// Max snake speed
	var SPEED_CHANGE_INTERVAL = 10;	//..............// How quickly the game speeds up
	var CUR_FOOD;	//..............................// The current food on screen
	var snake; //...................................// *** THE ACTUAL SNAKE ***
	var NEXT_DIRECTION; //..........................// snakes next direction
	var canGoThroughWalls = true;	//..............// whether snake can go through walls or not
	var SNAKE_HEAD_COLOR = '#adce18';	//..........// color of snake head
	var SNAKE_DEFAULT_COLOR = '#2bff47';	//......// color of snake body
	var visible_pieces = [];	//..................// pieces on screen to move and draw

	// Pause/Start gameplay
	$scope.togglePlay = function() {

		if ($scope.started) {

			// Pause or unpause game
			$scope.paused = !$scope.paused;

			if ($scope.paused) {
				clearTimeout(timer);
			} else {
				setTimeout(snakeMove, GAME_SPEED);

				// Reset save button
				$('#savescorebutton').button('reset');
			}

		} else {

			// Kick off initial start
			$scope.started = true;
			$scope.setStillPlaying(true);
			startGame();
		}
	}

	// Init Canvas
	$scope.initCanvas = function() {
		
		// Set up canvas context
		c = $('#snakecanvas')[0];
		canvas = c.getContext('2d');

		// Init a snake to avoid errors
		snake = new Snake();

		// Add event listeners
		$(document).unbind('keydown');
		$(document).bind('keydown', function(e){
			if (e.which == KEYBOARD_RIGHT && snake.direction != LEFT) {
				NEXT_DIRECTION = RIGHT;
				e.preventDefault();
			}
			else if (e.which == KEYBOARD_LEFT && snake.direction != RIGHT) {
				NEXT_DIRECTION = LEFT;
				e.preventDefault();
			}
			else if (e.which == KEYBOARD_DOWN && snake.direction != UP) {
				NEXT_DIRECTION = DOWN;
				e.preventDefault();
			}
			else if (e.which == KEYBOARD_UP && snake.direction != DOWN) {
				NEXT_DIRECTION = UP;
				e.preventDefault();
			}
		});

		// Draw initial game screen
		// TODO
		snake = new Snake();
		NEXT_DIRECTION = RIGHT;
		GAME_SPEED = 300;
		visible_pieces = new Array();
		visible_pieces.push(snake);
		$scope.gameover = false;
		$scope.score = 0;
		redraw();
	}

	// Save score
	$scope.saveScore = function() {

		// Make sure there is a score to save
		if ($scope.scoreToSave) {

			var SnakeScore = Parse.Object.extend('SnakeScore');
			var snakescore = new SnakeScore();
			snakescore.set('score', $scope.score);
			snakescore.set('user', $scope.getUser());

			$('#savescorebutton').button('loading');
			snakescore.save(null,{
				success: function(score) {
					// Saved
					$('#savescorebutton').button('complete');
					$scope.scoreToSave = false;
					$scope.setStillPlaying(false);
					$scope.pullScores(true);
					$scope.$apply();
				},
				error: function(score, error) {
					// Error
					$('#savescorebutton').button('complete');
					$scope.scoreToSave = false;
					$scope.$apply();
				}
			});
		}
	}

	////////////////////////////////////
	////  *** GAME MODELS *** //////////
	////////////////////////////////////

	// Define Food that snake eats
	function Food(x,y) {

		this.position = new Position(x,y);
		var colorPick = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];
		var c1 = Math.floor(Math.random() * colorPick.length);
		var col1 = (c1 == colorPick.length) ? 'f' : colorPick[c1];
		var c2 = Math.floor(Math.random() * colorPick.length);
		var col2 = (c2 == colorPick.length) ? 'f' : colorPick[c2];
		var c3 = Math.floor(Math.random() * colorPick.length);
		var col3 = (c3 == colorPick.length) ? 'f' : colorPick[c3];
		var c4 = Math.floor(Math.random() * colorPick.length);
		var col4 = (c4 == colorPick.length) ? 'f' : colorPick[c4];
		var c5 = Math.floor(Math.random() * colorPick.length);
		var col5 = (c5 == colorPick.length) ? 'f' : colorPick[c5];
		var c6 = Math.floor(Math.random() * colorPick.length);
		var col6 = (c6 == colorPick.length) ? 'f' : colorPick[c6];
		this.style = '#' + col1 + col2 + col3 + col4 + col5 + col6;

		// Draw food
		this.draw = function() {

			
			canvas.fillStyle = this.style;
			canvas.fillRect((SQUARE_SIZE * this.position.x) + GAP_SIZE, (SQUARE_SIZE * this.position.y) + GAP_SIZE, SNAKE_PIECE_SIZE, SNAKE_PIECE_SIZE);
			canvas.strokeStyle = '#eeeeee';
			canvas.strokeRect((SQUARE_SIZE * this.position.x) + GAP_SIZE, (SQUARE_SIZE * this.position.y) + GAP_SIZE, SNAKE_PIECE_SIZE, SNAKE_PIECE_SIZE);
		}
	}

	// Define SnakePiece
	function SnakePiece(x,y) {

		this.position = new Position(x,y);
		this.color = SNAKE_DEFAULT_COLOR;

		// Draw an individual snake piece
		this.draw = function() {

			canvas.fillStyle = this.color;
			canvas.fillRect((SQUARE_SIZE * this.position.x) + GAP_SIZE, (SQUARE_SIZE * this.position.y) + GAP_SIZE, SNAKE_PIECE_SIZE, SNAKE_PIECE_SIZE);
			canvas.strokeStyle = '#eee';
			canvas.strokeRect((SQUARE_SIZE * this.position.x) + GAP_SIZE, (SQUARE_SIZE * this.position.y) + GAP_SIZE, SNAKE_PIECE_SIZE, SNAKE_PIECE_SIZE);
		}
	}

	// Reset snake color
	// This ensures that head stays at the front!
	function resetColor(pieces) {

		for (var i = 0; i < pieces.length; i++) {
			pieces[i].color = SNAKE_DEFAULT_COLOR;
		}
	}

	// Define the snake
	// This is the meat
	function Snake() {

		this.direction = RIGHT;
		this.snakePieces = new Array();

		// End of Array, is actually beginning of snake
		this.snakePieces.push(new SnakePiece(STARTING_CENTER - 2,STARTING_CENTER));
		this.snakePieces.push(new SnakePiece(STARTING_CENTER - 1,STARTING_CENTER));
		var head = new SnakePiece(STARTING_CENTER,STARTING_CENTER);
		head.color = SNAKE_HEAD_COLOR;
		this.snakePieces.push(head);

		// Draws the snake to the board
		this.draw = function(){
			
			for (var i = 0; i < this.snakePieces.length; i++) {
				this.snakePieces[i].draw();
			}
		}

		this.move = function(){

			// Get the piece at the beginning, push it on the front of the array
			// Change its position based on direction
			var back = new SnakePiece(this.snakePieces[0].position.x, this.snakePieces[0].position.y);
			back.position.x = this.snakePieces[this.snakePieces.length - 1].position.x;
			back.position.y = this.snakePieces[this.snakePieces.length - 1].position.y;
			back.position.x += this.direction.x;
			back.position.y += this.direction.y;

			if (canGoThroughWalls) {
				canGoThroughWalls = false;
				if (this.hitsWall(back.position.x,back.position.y)) {
					if (back.position.x > BOARD_SIZE - 1) { // Hit right side
						back.position.x = 0;
					}
					if (back.position.x < 0) { // Hit left side
						back.position.x = BOARD_SIZE - 1;
					}
					if (back.position.y > BOARD_SIZE - 1) { // Hit bottom
						back.position.y = 0;
					}
					if (back.position.y < 0) {
						back.position.y = BOARD_SIZE - 1;
					}
				}
				canGoThroughWalls = true;
			}

			resetColor(this.snakePieces);
			back.color = SNAKE_HEAD_COLOR;
			this.snakePieces.push(back);

			// Check if I eat a food
			if (CUR_FOOD.position.x == back.position.x && CUR_FOOD.position.y == back.position.y) {

				// We need to create a new food
				// We don't remove first piece, so snake grows longer
				visible_pieces.splice(visible_pieces.indexOf(CUR_FOOD));
				CUR_FOOD = generateRandomFood();
				visible_pieces.push(CUR_FOOD);
				$scope.score++;
				$scope.$apply();

				// Speed up
				if (GAME_SPEED > MAX_SPEED)
					GAME_SPEED -= SPEED_CHANGE_INTERVAL;

			} else {

				// Remove first piece
				this.snakePieces.shift();
			}

			// Check if hits wall or hits itself
			var newx = back.position.x;
			var newy = back.position.y;
			if (this.hitsWall(newx,newy) || this.hitsSelf(newx,newy)) {

				$scope.gameover = true;
				$scope.$apply();
				// POSSIBLE MORE CODE FOR GAMEOVER
			}
			
		}

		this.hitsWall = function(x,y) {

			if (canGoThroughWalls)
				return false;

			return (x < 0 || x > BOARD_SIZE - 1 || y > BOARD_SIZE - 1 || y < 0);
		}

		this.hitsSelf = function(x,y) {

			for (var i = this.snakePieces.length - 2; i >= 0; i--) {

				if (this.snakePieces[i].position.x == x && this.snakePieces[i].position.y == y)
					return true;
			}

			return false;
		}
	}

	function drawBoard() {

		// Background
		canvas.fillStyle = '#222222';
		canvas.fillRect(0,0,BOARD_SIZE * SQUARE_SIZE, BOARD_SIZE * SQUARE_SIZE);

		// Square pieces
		for (var i = 0; i < BOARD_SIZE; i++) {

			for (var j = 0; j < BOARD_SIZE; j++) {

				var x = i * SQUARE_SIZE;
				var y = j * SQUARE_SIZE;

				// Draw 4 triangles per spot
				canvas.beginPath();
				canvas.moveTo(x + GAP_SIZE,y);
				canvas.lineTo(x,y);
				canvas.lineTo(x, y + GAP_SIZE);
				canvas.closePath();
				canvas.fillStyle = '#ffffff';
				canvas.fill();

				canvas.beginPath();
				canvas.moveTo(x + GAP_SIZE, y + SQUARE_SIZE);
				canvas.lineTo(x, y + SQUARE_SIZE);
				canvas.lineTo(x, y + SQUARE_SIZE - GAP_SIZE);
				canvas.closePath();
				canvas.fillStyle = '#ffffff';
				canvas.fill();

				canvas.beginPath();
				canvas.moveTo(x + SQUARE_SIZE, y + GAP_SIZE);
				canvas.lineTo(x + SQUARE_SIZE, y);
				canvas.lineTo(x + SQUARE_SIZE - GAP_SIZE, y);
				canvas.closePath();
				canvas.fillStyle = '#ffffff';
				canvas.fill();

				canvas.beginPath();
				canvas.moveTo(x + SQUARE_SIZE, y + SQUARE_SIZE - GAP_SIZE);
				canvas.lineTo(x + SQUARE_SIZE, y + SQUARE_SIZE);
				canvas.lineTo(x + SQUARE_SIZE - GAP_SIZE, y + SQUARE_SIZE);
				canvas.closePath();
				canvas.fillStyle = '#ffffff';
				canvas.fill();

				canvas.lineWidth = '1';
				canvas.beginPath();
				canvas.moveTo(x + GAP_SIZE,y);
				canvas.lineTo(x,y);
				canvas.lineTo(x, y + GAP_SIZE);
				canvas.closePath();
				canvas.strokeStyle = '#000000';
				canvas.stroke();

				canvas.beginPath();
				canvas.moveTo(x + GAP_SIZE, y + SQUARE_SIZE);
				canvas.lineTo(x, y + SQUARE_SIZE);
				canvas.lineTo(x, y + SQUARE_SIZE - GAP_SIZE);
				canvas.closePath();
				canvas.strokeStyle = '#000000';
				canvas.stroke();

				canvas.beginPath();
				canvas.moveTo(x + SQUARE_SIZE, y + GAP_SIZE);
				canvas.lineTo(x + SQUARE_SIZE, y);
				canvas.lineTo(x + SQUARE_SIZE - GAP_SIZE, y);
				canvas.closePath();
				canvas.strokeStyle = '#000000';
				canvas.stroke();

				canvas.beginPath();
				canvas.moveTo(x + SQUARE_SIZE, y + SQUARE_SIZE - GAP_SIZE);
				canvas.lineTo(x + SQUARE_SIZE, y + SQUARE_SIZE);
				canvas.lineTo(x + SQUARE_SIZE - GAP_SIZE, y + SQUARE_SIZE);
				canvas.closePath();
				canvas.strokeStyle = '#000000';
				canvas.stroke();
			}
		}
	}

	// Redraw everything on screen
	function redraw() {

		// Draw Board
		drawBoard();
		for (var i = 0; i < visible_pieces.length; i++) {
			visible_pieces[i].draw();
		}
	}

	// MAIN GAME LOOP
	// Move the snake
	// Restart timer OR gameover
	function snakeMove() {
		
		if (snake.direction.x == UP.x && snake.direction.y == UP.y && NEXT_DIRECTION.x != DOWN.x && NEXT_DIRECTION.y != DOWN.y)
			snake.direction = NEXT_DIRECTION;

		if (snake.direction.x == DOWN.x && snake.direction.y == DOWN.y && NEXT_DIRECTION.x != UP.x && NEXT_DIRECTION.y != UP.y)
			snake.direction = NEXT_DIRECTION;

		if (snake.direction.x == LEFT.x && snake.direction.y == LEFT.y && NEXT_DIRECTION.x != RIGHT.x && NEXT_DIRECTION.y != RIGHT.y)
			snake.direction = NEXT_DIRECTION;

		if (snake.direction.x == RIGHT.x && snake.direction.y == RIGHT.y && NEXT_DIRECTION.x != LEFT.x && NEXT_DIRECTION.y != LEFT.y)
			snake.direction = NEXT_DIRECTION;

		snake.move();

		if (!$scope.gameover) {
			redraw();
			timer = setTimeout(function() { snakeMove(); } , GAME_SPEED);
		} else {

			gameOver();
		}
	}

	// Find out where the snake is for adding food that doesn't land on him
	function snakeAtPosition(pos) {

		var conflict = false;

		for (var i = 0; i < snake.snakePieces.length; i++) {

			if (snake.snakePieces[i].position.x == pos.x && snake.snakePieces[i].position.y == pos.y) {
				conflict = true;
				break;
			}
		}

		return conflict;
	}

	// Generate a random food somewhere the snake isn't
	function generateRandomFood() {

		var x = Math.floor((Math.random() * BOARD_SIZE));
		x = (x == BOARD_SIZE) ? 0 : x;
		var y = Math.floor((Math.random() * BOARD_SIZE));
		y = (y == BOARD_SIZE) ? 0 : y;

		var pos = new Position(x,y);

		while(snakeAtPosition(pos)) {

			x = Math.floor((Math.random() * BOARD_SIZE));
			y = Math.floor((Math.random() * BOARD_SIZE));
			pos = new Position(x,y);
		}

		return new Food(pos.x, pos.y);
	}

	// handle end of game
	function gameOver() {

		drawBoard();
		canvas.font = "26px Arial";
		canvas.textAlign = 'center';
		canvas.fillText("Game Over", 192,192);
		canvas.font = "17px Arial";
		//newHighScore();
		$scope.started = false;
		$scope.paused = false;
		$scope.scoreToSave = true;
		$scope.$apply();
	}

	// Start the game up
	function startGame() {

		snake = new Snake();
		CUR_FOOD = generateRandomFood();
		NEXT_DIRECTION = RIGHT;
		GAME_SPEED = 300;
		visible_pieces = new Array();
		visible_pieces.push(snake);
		visible_pieces.push(CUR_FOOD);
		$scope.gameover = false;
		$scope.score = 0;
		redraw();
		timer = setTimeout(function() { snakeMove(); } , 1000);
	}

	// Ready the game
	$scope.initCanvas();

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

		// Don't come to account when you aren't signed in
		if($location.path() == '/account')
			$location.path('/');

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
	$scope.info = false;

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

			$scope.loading = true;
			$scope.alert = false;
			var puser = $scope.getUser();
			var oldemail = puser.get('email');
			var oldgrav = puser.get('gravatar');
			puser.set('email', $scope.newuser.email);
			puser.set('gravatar', $scope.newuser.gravatar);
			var savename = puser.get('username');

			// save parse user
			puser.save(null, {
				success: function(user) {
					
					$scope.loading = false;
					var u = $scope.getUser();
					u.set('email', user.get('email'));
					u.set('gravatar', user.get('gravatar'));
					u.set('username', savename);
					$scope.setUser(u);
					$scope.info = true;
					$scope.infomessage = 'Account was successfully updated';
					$scope.$digest();
				},
				error: function(user, error) {

					var u = $scope.getUser();
					u.set('email', oldemail);
					u.set('gravatar', oldgrav);
					u.set('username', savename);
					$scope.newuser.email = oldemail;
					$scope.newuser.gravatar = oldgrav;
					$scope.loading = false;
					$scope.updateerror = true;
					$scope.updatemessage = error.message;
					$scope.$digest();
				}
			})
		}
	}

	$scope.resetPassword = function(event) {

		event.preventDefault();

		// start loading spinner
		$scope.updateloading = true;
		Parse.User.requestPasswordReset($scope.getUser().get('email'), {
			success: function() {
				// Password reset request was sent successfully
				$scope.info = true;
				$scope.infomessage = 'Email was successfully sent';
				$scope.updateloading = false;
				$scope.$digest();
			},
			error: function(error) {
				// Show the error message somewhere
				$scope.updateloading = false;
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
	$scope.mainmessage = 'Sign in';

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
