// Snake Controller and all code needed for game
function snakeController($scope, $rootScope) {

	// Angular ng-models
	$scope.playing = false;
	$scope.gameover = true;
	$scope.score = 0;

	/////////////////
	// Game values //
	/////////////////
	var c; 			// DOM element for canvas
	var canvas;		// canvas context for drawing
	var timer;		// game animation timer

	// Pause/Start gameplay
	$scope.togglePlay = function() {

		$scope.playing = !$scope.playing;

		// Start or clearTimeout
	}

	// Init Canvas
	$scope.initCanvas = function() {
		
		c = $('#snakecanvas')[0];
		canvas = c.getContext('2d');
	}

	// Ready the game
	$scope.initCanvas();
}