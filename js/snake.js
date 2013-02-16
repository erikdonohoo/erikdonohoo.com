// Snake Controller and all code needed for game
function snakeController($scope, $rootScope) {

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
	var KEYBOARD_UP = 73;	//......................// Define I key
	var KEYBOARD_DOWN = 75;	//......................// Define K key
	var KEYBOARD_LEFT = 74;	//......................// Define J key
	var KEYBOARD_RIGHT = 76;	//..................// Define L key
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
	var SNAKE_HEAD_COLOR = '#A80D0D';	//..........// color of snake head
	var SNAKE_DEFAULT_COLOR = '#1D7E25';	//......// color of snake body
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
			}

		} else {

			// Kick off initial start
			$scope.started = true;
			startGame();
		}
	}

	// Save score
	$scope.saveScore = function() {

		// Make sure there is a score to save
		if ($scope.scoreToSave) {

			$scope.scoreToSave = false;
			var SnakeScore = Parse.Object.extend('SnakeScore');
			var snakescore = new SnakeScore();
			snakescore.set('score', $scope.score);
			snakescore.set('user', $rootScope.getUser());
			snakescore.save(null,{
				success: function(score) {
					// Saved
				},
				error: function(score, error) {
					// Error
				}
			});
		}
	}

	// Init Canvas
	$scope.initCanvas = function() {
		
		// Set up canvas context
		c = $('#snakecanvas')[0];
		canvas = c.getContext('2d');

		// Add event listeners
		$(document).keydown(function(e){
			if (e.which == KEYBOARD_RIGHT && snake.direction != LEFT) {
				NEXT_DIRECTION = RIGHT;
			}
			else if (e.which == KEYBOARD_LEFT && snake.direction != RIGHT) {
				NEXT_DIRECTION = LEFT;
			}
			else if (e.which == KEYBOARD_DOWN && snake.direction != UP) {
				NEXT_DIRECTION = DOWN;
			}
			else if (e.which == KEYBOARD_UP && snake.direction != DOWN) {
				NEXT_DIRECTION = UP;
			}
		});

		// Draw initial game screen
		// TODO
	}

	////////////////////////////////////
	////  *** GAME MODELS *** //////////
	////////////////////////////////////

	// Define Food that snake eats
	function Food(x,y) {

		this.position = new Position(x,y);

		// Draw food
		this.draw = function() {

			canvas.fillStyle = '#333333';
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

	// Redraw everything on screen
	function redraw() {

		canvas.clearRect(0,0,BOARD_SIZE * SQUARE_SIZE, BOARD_SIZE * SQUARE_SIZE);
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
				conflict == true;
				break;
			}
		}

		return conflict;
	}

	// Generate a random food somewhere the snake isn't
	function generateRandomFood() {

		var x = Math.floor((Math.random() * BOARD_SIZE));
		var y = Math.floor((Math.random() * BOARD_SIZE));

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

		canvas.clearRect(0,0,BOARD_SIZE * SQUARE_SIZE, BOARD_SIZE * SQUARE_SIZE);
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