var util = require('util');

exports.createNew = function (id, destroy){
	return new Game(id, destroy);
};

var levels = [
	{
		innerWalls: [
			{ x: 5, y: 5},
			{ x: 5, y: 6},
			{ x: 5, y: 7},
			{ x: 5, y: 8},
			{ x: 5, y: 9},
	
			{ x: 6, y: 7},
	
			{ x: 7, y: 5},
			{ x: 7, y: 6},
			{ x: 7, y: 7},
			{ x: 7, y: 8},
			{ x: 7, y: 9},	
	
			{ x: 11, y: 5},
			{ x: 11, y: 6},
			{ x: 11, y: 7},
			{ x: 11, y: 8},
			{ x: 11, y: 9}
		],
		startingLocations: [
			// If these are negative, it will be starting from bottom-right
			{x: 3, y: 1, direction: 'right', color: 'green'},
			{x: -5, y: -3, direction: 'left', color: '#990'},
			{x: -3, y: 1, direction: 'down', color: '#099'},
			{x: 3, y: -3, direction: 'up', color: '#f3f'}
		]
	}
];

function Game(id, destroy) {
	this.id = id;
	this.generation 	= 0;	
	this.active 		= false;	
	
	this.worldWidth		= 25;
	this.worldHeight	= 21;
	this.startingLength	= 3;
	this.fruitGenRate	= 4;
	this.maxFruit		= 5;
	this.engineInterval = 250;
	this.snakeIncrease 	= 1;
	
	this.innerWalls 	= [];
	this.snakes			= [];
	this.fruit			= [];
	
	//TODO: select or random
	this.level = levels[0];
	this.innerWalls = this.level.innerWalls;
	
	this.destroy = destroy;
	
	console.log('game ' + this.id + 'created');
};

Game.prototype.join = function(socket) {
	var playerNumber = this.snakes.length + 1,
		startingLocation = this.level.startingLocations[playerNumber - 1],
		snake = { 
			x: (startingLocation.x > -1 ? startingLocation.x : this.worldWidth + startingLocation.x), 
			y: (startingLocation.y > -1 ? startingLocation.y : this.worldHeight + startingLocation.y),
			segments: [],
			direction: startingLocation.direction,
			color: startingLocation.color,
			playerNumber: playerNumber,
			socket: socket
		};
	
	console.log(this.id + ': new player ' + playerNumber + ' ' + snake);
	
	for (var i=0; i < this.startingLength; i++) {
		snake.segments.push({
			x: snake.x,
			y: snake.y
		});
	};
	
	socket.on('start', function() {
		if(this.active) return;
		
		this.start();
	}.bind(this));
	
	socket.on('disconnect', function() {
		for (var i=0; i < this.snakes.length; i++) {
			if(this.snakes[i].playerNumber === playerNumber) {
				this.snakes.splice(i, 1);
				break;
			}
		};
		
		if(this.snakes.length === 0) {
			this.stop();
		}
	}.bind(this));
	
	// socket event: update snake direction (if !stupid)
	socket.on('direction', function(dir) {
		var currentDir = snake.direction;
		if((currentDir === 'up' && dir === 'down') ||
			(currentDir === 'down' && dir === 'up') ||
			(currentDir === 'left' && dir === 'right') ||
			(currentDir === 'right' && dir === 'left')) {
			return;
		}
		snake.direction = dir;
	});
	
	var player = {
		playerNumber: playerNumber,
		startingLocation: {
			x: snake.x, 
			y: snake.y
		},
		color: startingLocation.color
	};
	
	// All other sockets get newPlayer
	for (var i=0; i < this.snakes.length; i++) {
		this.snakes[i].socket.emit('newPlayer', player);
	};
	
	player.innerWalls = this.innerWalls;
	
	socket.emit('joined', player);

	for (var i=0; i < this.snakes.length; i++) {
		player = this.snakes[i];
		
		socket.emit('newPlayer', {
			playerNumber: player.playerNumber,
			startingLocation: {
				x: player.x, 
				y: player.y
			},
			color: player.color
		});
	};
		
	this.snakes.push(snake);
};

Game.prototype.killSnake = function (snake, reason){
	snake.dead = true;

	snake.socket.emit('death', this.generation);
	snake.socket.emit('message', 'died:' + reason);

	console.log('snake ' + snake.playerNumber + ' died (' + reason + ')');
	
	var liveOnes = 0,
		winner;
				
	for (var j=0; j < this.snakes.length; j++) {
		if(this.snakes[j].dead) continue;

		liveOnes++;
		
		winner = this.snakes[j].playerNumber;
	};
	
	if(liveOnes === 1) {
		for (var j=0; j < this.snakes.length; j++) {
			this.snakes[j].socket.emit('gameOver', winner);
		}				
		
		this.stop();
	}
};

Game.prototype.updateGameState = function () {
	this.generation++;
	console.log('---------------------------------------------------------------');
	console.log('game state update ' + this.generation);

	var gameState = {
		snakes: [],
		fruit: []
	};
	
	// Check for fruit spawn!
	if((this.fruit.length < this.maxFruit) && (this.generation % this.fruitGenRate === 0)) {
		var x, y;
		
		function randomInt(from, to) {
			return Math.floor(Math.random() * (to - from + 1) + from);
		};
		
		do {
			// zero-based index means '0' is left wall, 'x-2' is right wall
			x = randomInt(1, this.worldWidth - 2);
			y = randomInt(1, this.worldHeight - 2);
		} while(this.occupied({ x:x, y:y}));
		
		var newFruit = {x: x, y: y};
		
		// update game engine and update object
		this.fruit.push(newFruit);
	}

	// Copy fruit information into game update
	gameState.fruit = this.fruit;

	// Update snake locations
	for (var i=0; i < this.snakes.length; i++) {
		var snake = this.snakes[i],
			newSegments = 0;
		
		if(snake.dead === true){
			console.log('dead snake - ' + snake.playerNumber);
			continue;
		}
		
		// Advancing snake segments
		var tail = snake.segments.pop();
		
		tail.x = snake.x;
		tail.y = snake.y;
		
		snake.segments.unshift(tail);
		
		// Advance snake head
		switch(snake.direction) {
			case 'up':
				snake.y -= 1;
				break;
			case 'down':
				snake.y += 1;
				break;
			case 'left':
				snake.x -= 1;
				break;
			case 'right':
				snake.x += 1;
				break;
		}

		// check snake collisions
		// TODO: These detections should probably be done after all movements have been applied
		// so we can ensure all effects are correctly applied
		
		//Check for fruit
		var fruitHitIndex = this.checkHitIndex(this.fruit, snake);
		console.log('fruitHitIndex:' + fruitHitIndex);
		if(fruitHitIndex !== null){
			console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
			console.log('fruit hit!!!!!!!' + fruitHitIndex);
			var previousTail = snake.segments[snake.segments.length - 1];
			
			for (var i=0; i < this.snakeIncrease; i++) {
				snake.segments.push({
					x: previousTail.x,
					y: previousTail.y
				});
				
				newSegments++;
			};
			
			// remove fruit from array
			this.fruit.splice(fruitHitIndex, 1)
			console.log('new fruit count: ' + this.fruit.length);
		};
		
		// Check for interior wall collision
		if(this.checkHit(this.innerWalls, snake)){
			this.killSnake(snake, 'inner walls');
		};
		
		//Check for other snakes
		for(var x=0; x<this.snakes.length; x++){
			var otherSnake = this.snakes[x];
			if(snake.playerNumber !== otherSnake.playerNumber){
				killSnake(snake, 'hit other snake');
			}
		}

		//Check for outer walls
		if((snake.x > this.worldWidth - 2) || (snake.x < 1)
			|| (snake.y > this.worldHeight - 2) || (snake.y < 1)){
			this.killSnake(snake, 'outer walls');
		}
		
		// Also update game state object
		gameState.snakes.push({
			playerNumber:snake.playerNumber,
			x: snake.x,
			y: snake.y,
			newSegments: newSegments
		});
	}
		
	// debug : write game state
	console.log(util.inspect(gameState));
		
	// Broadcast game state to all snakes/players
	for (var i=0; i < this.snakes.length; i++) {
		this.snakes[i].socket.emit('gameState', gameState);
	};
};

// will return index of the array that was hit
Game.prototype.checkHitIndex = function(array, coord) {
	var compCoord;
	var index = null;
	for (var i=0; i < array.length; i++) {
			compCoord = array[i];
			console.log('x: ' + coord.x + ' y:' + coord.y + ', x:' + compCoord.x + ' y:' + compCoord.y);
			if((coord.x === compCoord.x) && (coord.y === compCoord.y)){
				console.log('hit at index ' + i);
				index = i;
				break;
			}
		};
	return index;
};

Game.prototype.checkHit = function(array, coord) {
	var compCoord;
	
	for (var i=0; i < array.length; i++) {
			compCoord = array[i];
			//console.log('x: ' + coord.x + ' y:' + coord.y + ', x:' + compCoord.x + ' y:' + compCoord.y);
			if(coord.x === compCoord.x && coord.y === compCoord.y)
				//console.log('hit at index ' + i);
				return true;
		};
	return false;
};

Game.prototype.occupied = function(coord){
	var compCoord,
		arrays = [this.innerWalls, this.fruit, this.snakes];

	for (var a=0; a < arrays.length; a++) {
		for (var i=0; i < arrays[a].length; i++) {
			compCoord = arrays[a][i];

			if(coord.x === compCoord.x && coord.y === compCoord.y)
				return true;
		};
	};
			
	return false;
};

Game.prototype.start = function () {
	for (var i=0; i < this.snakes.length; i++) {
		this.snakes[i].socket.emit('start');
	};
	
	this.intervalId = setInterval(this.updateGameState.bind(this), this.engineInterval);
	this.active = true;
	console.log('game ' + this.id + ' started, interval id:' + this.intervalId);
};

Game.prototype.stop = function (){
	if(this.intervalId) {
		console.log('game stopped');
		clearTimeout(this.intervalId);
	}	
	
	// Remove from the list, then deactivate
	this.destroy();

	this.active = false;
};
