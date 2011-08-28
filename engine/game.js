var util = require('util'),
	levelGen = require('./levels'),
	levels = levelGen.getLevels();

exports.createNew = function (id, destroy){
	return new Game(id, destroy);
};

function Game(id, destroy) {
	this.id = id;
	this.generation 	= 0;	
	this.active 		= false;	
	
	this.worldWidth		= 40;
	this.worldHeight	= 30;
	this.startingLength	= 3;
	this.fruitGenRate	= 6;
	this.maxFruit		= 10;
	this.engineInterval = 175;
	this.snakeIncrease 	= 3;
	
	this.innerWalls 	= [];
	this.snakes			= [];
	this.fruit			= [];
	
	this.level = levels[Math.floor(Math.random() * 3)];
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
	
	if(this.snakes.length === 4){
		for (var i=0; i < this.snakes.length; i++) {
			this.snakes[i].socket.emit('ready');
		};
	}
};

Game.prototype.killSnake = function (snake, reason){
	snake.dead = true;
	snake.socket.emit('death', this.generation);
	console.log('	snake ' + snake.playerNumber + ' died (' + reason + ')');
	
	// single snake
	if(this.snakes.length === 1) {
		this.snakes[0].socket.emit('gameOver', 'nobody');
		this.stop();
		return;
	}
	
	// figure out who the real winner is
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
	
	// Update snake locations
	for (var i=0; i < this.snakes.length; i++) {
		var snake = this.snakes[i];
		
		if(snake.dead === true){
			console.log('	dead snake - ' + snake.playerNumber);
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
	} //end main snake loop
		
	// Collision check loop	
	for (var i=0; i < this.snakes.length; i++) {
		var snake = this.snakes[i],
			newSegments = 0;
					
		if(snake.dead === true) {
			continue;
		}
					
		//Check for fruit
		var fruitHitIndex = this.checkHitIndex(this.fruit, snake);
		//console.log('fruitHitIndex:' + fruitHitIndex);
		if(fruitHitIndex !== null){
			//console.log('fruit hit!!!!!!!' + fruitHitIndex);
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
		};
		
		// Check for interior wall collision
		if(this.checkHit(this.innerWalls, snake)){
			this.killSnake(snake, 'inner walls');
		};
		
		//Check for collisions with other snakes and segments
		for(var x=0; x<this.snakes.length; x++){
			var otherSnake = this.snakes[x];
			
			// Check against all segments, including your own
			if(this.checkHit(otherSnake.segments, snake)){
				this.killSnake(snake, 'hit segments');
			}
			
			// Don't let the heads touch
			if(snake.playerNumber !== otherSnake.playerNumber) {
				if(snake.x === otherSnake.x && snake.y === otherSnake.y){
					this.killSnake(snake, 'hit other snake');
				}
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
	} // snake collision loop
		
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
		this.fruit.push(newFruit);
	}

	// Copy fruit information into game update
	gameState.fruit = this.fruit;
	
	// debug : write game state
	console.log(util.inspect(gameState, true, null));
		
	// Broadcast game state to all snakes/players
	for (var i=0; i < this.snakes.length; i++) {
		this.snakes[i].socket.volatile.emit('gameState', gameState);
	};
};

// will return index of the array that was hit
Game.prototype.checkHitIndex = function(array, coord) {
	var compCoord;
	var index = null;
	for (var i=0; i < array.length; i++) {
			compCoord = array[i];
			//console.log('x: ' + coord.x + ' y:' + coord.y + ', x:' + compCoord.x + ' y:' + compCoord.y);
			if((coord.x === compCoord.x) && (coord.y === compCoord.y)){
				//console.log('hit at index ' + i);
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
