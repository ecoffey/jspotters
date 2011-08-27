window.onload = function () {
	var tileSize = 16,
		worldWidth = 25,
		worldHeight = 21,
		movers = [];
	
    //start crafty
    Crafty.init(worldWidth * tileSize, worldHeight * tileSize);
    Crafty.canvas.init();

	Crafty.c('wall', {
		init: function() {
			this.addComponent('2D, Canvas, Color, Collision, solid');
			
			this.w = tileSize;
			this.h = tileSize;
			
			this.color('blue')
				.collision();
		}
	});
	
	Crafty.c('SnakeSegment', {
		init: function() {
			this.addComponent('2D, Canvas, Color, solid, Collision');
			
			this.h = tileSize;
			this.w = tileSize;
			
			this.color('green');
		}
	});
	
	Crafty.c('Snake', {
		_segments: [],
		_direction: 'right',
		_drawn: false,
		_keys: {},
		
		init: function() {
			this.addComponent('SnakeSegment');
			this.h = tileSize;
			this.w = tileSize;
			
			movers.push(this);
		},
		_snake: function(length, direction) {
			this._direction = direction;

			// The "head" is its own segment
			for (var i=0; i < length - 1; i++) {
				this._segments.push(
					Crafty.e('SnakeSegment')
						.attr({
							x: this.x,
							y: this.y,
							z: this.z
						}));
			};
			

			this.bind("EnterFrame",function() {
				if(this.disableControls) return;
				if(this._drawn) return;

				var prevX = this.x,
					prevY = this.y,
					tail = this._segments.pop();
				
				tail.attr({
						x: this.x,
						y: this.y
					});
				
				this._segments.unshift(tail);
				
				switch(this._direction) {
					case 'up':
						this.y -= tileSize;
						break;
						
					case 'down':
						this.y += tileSize;
						break;
						
					case 'left':
						this.x -= tileSize;
						break;
						
					case 'right':
						this.x += tileSize;
						break;
				}
				
				this._drawn = true;
				this.trigger('Moved', {x: prevX, y: prevY});
			});

			this.bind('Moved', function(from) {
					if(this.hit('solid'))
						this.attr({ x: from.x, y: from.y });
				});
		},
		Snake: function(length, direction) {
			this._snake(length, direction);
			
			return this;
		}
	});
	
	Crafty.c('Player', {
		init: function() {
			this.addComponent('Snake');
			this.h = tileSize;
			this.w = tileSize;
			
			movers.push(this);
		},
		Player: function(length, direction, keys) {
			this._keys = keys;
			
			this._snake(length, direction);
						
			this.bind("KeyDown", function(e) {
				if(this._keys[e.key]) {
					this._direction = this._keys[e.key];
				}
			})
			.bind("KeyUp", function(e) {
				if(this._keys[e.key]) {
					this._direction = this._keys[e.key];
				}
			});
		}
	});

    //method to generate the map
    function generateWorld() {
        //loop through all tiles
        for (var i = 0; i < worldWidth; i++) {
            for (var j = 0; j < worldHeight; j++) {
				// Outer walls
                if(i === 0 || i === 24 || j === 0 || j === 20) {
                    Crafty.e('wall')
                    	.attr({ 
							x: i * tileSize, 
							y: j * tileSize, 
							z:2
						});
				}
            }
        }

		setInterval(function() {
			for (var i = movers.length - 1; i >= 0; i--){
				movers[i]._drawn = false;
			};
		}, 250);
    }

    //the loading screen that will display while our assets load
    Crafty.scene("loading", function () {
	
        Crafty.e("2D, DOM, Text").attr({ w: tileSize * worldWidth, h: 20 })
			.text("Loading")
			.css({ 
				"text-align": "center", 
				"top": "120px",
				"color": "White" });

		Crafty.scene("main"); //when everything is loaded, run the main scene
    });

    Crafty.scene("main", function () {
		Crafty.background("black");

		generateWorld();

		Crafty.e('Player')
			.attr({ 
				x: tileSize * 3, 
				y: tileSize, 
				z: 1
			}).Player(3, 'right', { 38: 'up', 40: 'down', 39: 'right', 37: 'left'});
    });

	
	Crafty.scene("loading");
	Crafty.background("#000");
};