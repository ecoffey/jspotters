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
			{x: -5, y: -3, direction: 'left', color: 'yellow'},
			{x: -3, y: 1, direction: 'down', color: 'white'},
			{x: 3, y: -3, direction: 'up', color: 'pink'}
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
	this.fruitGenRate	= 10;
	this.engineInterval = 250;
	this.snakeIncrease 	= 3;
	
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
			length: this.startingLength,
			direction: startingLocation.direction,
			color: startingLocation.color,
			playerNumber: playerNumber,
			socket: socket
		};
	
	console.log(this.id + ': new player ' + playerNumber + ' ' + snake);
	
	socket.on('disconnect', function() {
		console.log('disconnect ' + playerNumber);
		
		for (var i=0; i < this.snakes.length; i++) {
			if(this.snakes[i].playerNumber === playerNumber) {
				this.snakes.slice(i, i+1);
				break;
			}
		};
		
		if(this.snakes.length === 0) {
			this.stop();
		}
	}.bind(this));
	
	socket.on('direction', function(dir) {
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

Game.prototype.updateGameState = function () {
	this.generation++;
	// console.log('game state update ' + this.generation);

	var gameState = {
		snakes: [],
		fruit: []
	};
	
	// Check for fruit spawn!
	if(this.generation % this.fruitGenRate === 0) {
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
		var snake = this.snakes[i];
		
		if(snake.dead === true){
			console.log('dead snake - ' + snake.playerNumber);
			continue;
		}
		
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
		function killSnake(snake, reason){
			snake.dead = true;
			snake.socket.emit('death', this.generation);
			console.log('snake ' + snake.playerNumber + ' died (' + reason + ')');
		}
		
		//Check for fruit
		if(this.checkHit(this.fruit, snake)){
			snake.length += this.snakeIncrease;
			// TODO remove fruit
		};
		// Check for interior wall collision
		if(this.checkHit(this.innerWalls, snake)){
			killSnake(snake, 'inner walls');
		};
		//Check for other snakes
		if(this.checkHit(this.snakes, snake)){
			// TODO needs to not kill itself
			//killSnake(snake, 'hit other snake');
		};
		//Check for outer walls
		if((snake.x > this.gameWidth) || (snake.x < 0)
			|| (snake.y > this.gameHeight) || (snake.y < 0)){
			killSnake(snake, 'outer walls');
		}
		
		// Also update game state object
		gameState.snakes.push({
			playerNumber:snake.playerNumber,
			x: snake.x,
			y: snake.y
		});
	}
		
	// Broadcast game state to all snakes/players
	for (var i=0; i < this.snakes.length; i++) {
		this.snakes[i].socket.emit('gameState', gameState);
	};
};

Game.prototype.checkHit = function(array, coord) {
	var compCoord;
	
	for (var i=0; i < array.length; i++) {
			compCoord = array[i];

			if(coord.x === compCoord.x && coord.y === compCoord.y)
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
	this.intervalId = setInterval(this.updateGameState.bind(this), this.engineInterval);
	this.active = true;
	console.log('game ' + this.id + ' started, interval id:' + this.intervalId);
};

Game.prototype.stop = function (){
	if(this.intervalId) {
		console.log('game stopped');
		clearTimeout(this.intervalId);	
		this.active = false;
	}
	
	this.destroy();
};
