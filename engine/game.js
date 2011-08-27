exports.createNew = function (id){
	return new Game(id);
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
			{x: 3, y: 1},
			{x: -5, y: -3}
		]
	}
];


function Game(id) {
	this.id = id;

	this.worldWidth		= 25;
	this.worldHeight	= 21;
	this.startingLength	= 3;
	this.fruitGenRate	= 3;
	this.generation 	= 0;
	
	this.innerWalls 	= [];
	this.snakes			= [];
	this.fruit			= [];
	
	//TODO: select or random
	this.level = levels[0];
	console.log('game ' + this.id + 'created');
};

Game.prototype.join = function(socket) {
	var playerNumber = this.snakes.length + 1,
		startingLocation = this.level.startingLocations[playerNumber],
		snake = { 
			x: startingLocation.x >= 0 ? startingLocation.x : this.worldWidth + startingLocation.x, 
			y: startingLocation.y >= 0 ? startingLocation.y : this.worldHeight + startingLocation.y,
			length: this.startingLength,
			direction: 'right',
			color: 'green',
			playerNumber: playerNumber,
			socket: socket
		};
	
	this.snakes.push(snake);
	
	socket.on('direction', function(dir) {
		snake.direction = dir;
	});
	
	socket.emit('joined', { playerNumber: playerNumber });
};

Game.prototype.updateGameState = function () {
	this.generation++;
	console.log('game state update ' + this.generation);

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
		} while(this.collision({ x:x, y:y}));
		
		console.log('new fruit x y : ' + x  + ' ' + y);
		
		var newFruit = {
			x: x,
			y: y
		}
		
		// update game engine and update object
		this.fruit.push(newFruit);
	}

	// Copy fruit information into game update
	gameState.fruit = this.fruit;

	// Update snake locations
	for (var i=0; i < this.snakes.length; i++) {
		var snake = this.snakes[i];
		
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
		
		// Also update game update object
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

Game.prototype.collision = function(coord){
	var compCoord,
		arrays = [this.innerWalls, this.fruit, this.snakes];

	//console.log(this.innerWalls);
	//console.log(this.fruit);
	//console.log(this.snakes);
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
	// Create level
	this.innerWalls = this.level.innerWalls;
	this.intervalId = setInterval(this.updateGameState.bind(this), 250);
	
	console.log('game ' + this.id + ' started, interval id:' + this.intervalId);
};

Game.prototype.stop = function (){
	if(this.intervalId) {
		console.log('game stopped');
		
		clearTimeout(this.intervalId);	
	}
};
