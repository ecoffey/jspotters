window.onload = function () {
	var sock = io.connect(),
		snakes = [],
		fruits = [],
		playerNumber,
		playerCard;

	sock.on('message', function(msg) {
		alert(msg);
	});
	
	sock.on('rejoin', function() {
		window.location = '/join';
	});

	// Server event handlers
	sock.on('joined', function(data) {
		var startingLocation = data.startingLocation;
		
		playerNumber = data.playerNumber;
		
		Snakes.innerWalls = data.innerWalls;
		
		Crafty.scene('main');
		
		snakes.push(Crafty.e('Player')
			.attr({
				x: startingLocation.x * Snakes.tileSize,
				y: startingLocation.y * Snakes.tileSize,
				z: 1,
				playerNumber: playerNumber 
			})
			.Player(Snakes.startingLength, data.color, { 38: 'up', 40: 'down', 39: 'right', 37: 'left'}));
		
	    playerCard = Crafty.e("2D, DOM, Text")
			.attr({ w: 100, h: 20 })
			.text("Player " + playerNumber)
			.css({ 
				"text-align": "center", 
				"top"	: (startingLocation.y * Snakes.tileSize - 15) + 'px',
				"left"	: (startingLocation.x * Snakes.tileSize - 50) + 'px',
				"color"	: data.color,
				"background-color": "white" 
			});
	});
	
	sock.on('newPlayer', function(player) {
		var startingLocation = player.startingLocation;
		
		snakes.push(Crafty.e('Snake')
			.attr({
				x: startingLocation.x * Snakes.tileSize,
				y: startingLocation.y * Snakes.tileSize,
				z: 1,
				playerNumber: player.playerNumber
			})
			.Snake(Snakes.startingLength, player.color));
	});
	
	sock.on('start', function() {
		$('.Waiting').remove();
		
		playerCard.destroy();
	});
	
	sock.on('gameState', function(gameState) {
		for (var i=0; i < gameState.snakes.length; i++) {
			// x, y, playerNumber
			var state = gameState.snakes[i];
			
			for (var j=0; j < snakes.length; j++) {
				var snake = snakes[j];
				
				if(state.playerNumber === snake.playerNumber) {
					snake.newLocation = {
						x: state.x * Snakes.tileSize,
						y: state.y * Snakes.tileSize
					};
					
					if(state.newSegments) {
						var tail = snake._segments[snake._segments.length - 1];
						
						for (var i=0; i < state.newSegments; i++) {
							snake._segments.push(
								Crafty.e('SnakeSegment')
									.SnakeSegment(snake._color)
									.attr({
										x: tail.x,
										y: tail.y,
										z: tail.z
									}));
						};
					}
															
					break;
				}
			};
		};
		
		for (var i=0; i < gameState.fruit.length; i++) {
			var fruit = gameState.fruit[i];
			
			if(fruits.length <= i) {
				fruits.push(Crafty.e('fruit').attr({
					x: fruit.x * Snakes.tileSize,
					y: fruit.y * Snakes.tileSize
				}));
			} else {
				fruits[i].attr({
					x: fruit.x * Snakes.tileSize,
					y: fruit.y * Snakes.tileSize
				});
			}
		};
	});
	
	
	// Crafty Components
	Crafty.c('wall', {
		init: function() {
			this.addComponent('2D, Canvas, Color, Collision, solid');
			
			this.w = Snakes.tileSize;
			this.h = Snakes.tileSize;
			
			this.color('blue')
				.collision();
		}
	});

	Crafty.c('Level', {
		Level: function() {
			// Outer walls
			for (var i = 0; i < Snakes.worldWidth; i++) {
				for (var j = 0; j < Snakes.worldHeight; j++) {
					if(i === 0 || i === 24 || j === 0 || j === 20) {
						Crafty.e('wall')
							.attr({ 
								x: i * Snakes.tileSize, 
								y: j * Snakes.tileSize, 
								z: 2
							});
					}
				}
			}

			// Inner walls
			for (var i=0; i < Snakes.innerWalls.length; i++) {
				var coords =  Snakes.innerWalls[i];
				
				Crafty.e('wall')
					.attr({
						x: coords.x * Snakes.tileSize,
						y: coords.y * Snakes.tileSize,
						z: 2
					});
			};
		}
	});
	
	Crafty.c('fruit', {
		init: function() {
			this.addComponent('2D, Canvas, Color, Collision');
			
			this.w = Snakes.tileSize;
			this.h = Snakes.tileSize;
			
			this.color('red')
				.collision();
			
			//this.onHit('Snake', function(){
			//	for (var i=0; i < Snakes.fruit.length; i++) {
			//		var target = Snakes.fruit[i];
					
			//		if(target.x === this.x && target.y === this.y)
			//			Snakes.fruit.splice(i, 1);
			//	};
				
			//	this.destroy();
			//});
		}
	});
	
	Crafty.c('SnakeSegment', {
		init: function() {
			this.addComponent('2D, Canvas, Color, solid, Collision');
			
			this.h = Snakes.tileSize;
			this.w = Snakes.tileSize;
		},
		SnakeSegment: function(color) {
			this.color(color);
			
			return this;
		}
	});
	
	Crafty.c('Snake', {
		init: function() {
			this.addComponent('SnakeSegment');
			this.h = Snakes.tileSize;
			this.w = Snakes.tileSize;
			
			this._segments	= [];
			this._keys		= {};
			
			Snakes.movers.push(this);
		},
		Snake: function(length, color) {
			this.color(color);

			// The "head" is its own segment
			for (var i=0; i < length - 1; i++) {
				this._segments.push(
					Crafty.e('SnakeSegment')
						.SnakeSegment(color)
						.attr({
							x: this.x,
							y: this.y,
							z: this.z
						}));
			};

			this.bind("EnterFrame",function() {
				if(!this.newLocation) return;

				var prevX = this.x,
					prevY = this.y,
					tail = this._segments.pop();

				tail.attr({
						x: this.x,
						y: this.y
					});
				
				this.x = this.newLocation.x;
				this.y = this.newLocation.y;

				delete this.newLocation;

				this._segments.unshift(tail);
			});
			
			return this;
		}
	});
	
	Crafty.c('Player', {
		init: function() {
			this.addComponent('Snake');
			this.h = Snakes.tileSize;
			this.w = Snakes.tileSize;
			
			Snakes.movers.push(this);
		},
		Player: function(length, color, keys) {
			this._keys = keys;
			
			this.Snake(length, color);
						
			this.bind("KeyDown", function(e) {
				if(this._keys[e.key]) {
					this._direction = this._keys[e.key];
				}
			})
			.bind("KeyUp", function(e) {
				if(this._keys[e.key]) {
					this._direction = this._keys[e.key];
					
					sock.emit('direction', this._keys[e.key]);
				}
			});
			
			return this;
		}
	});
	
	sock.emit('join', window.location.pathname.substring(1));
	
    Crafty.init(Snakes.worldWidth * Snakes.tileSize, Snakes.worldHeight * Snakes.tileSize);
    Crafty.canvas.init();

	Crafty.background("#000");
	Crafty.scene("loading");
	
	$('.StartAnyway').click(function() {
		sock.emit('start');
	});
};
