window.onload = function () {
	var sock = io.connect();

	sock.on('connect', function() {
		console.log('oh hai');
	});

	var tileSize = 16,
		worldWidth = 25,
		worldHeight = 21,
		movers = [];
	
    //start crafty
    Crafty.init(worldWidth * tileSize, worldHeight * tileSize);
    Crafty.canvas.init();

	Crafty.c('wall', {
		init: function() {
			this.addComponent('2D, DOM, Color, Collision, solid');
			
			this.w = tileSize;
			this.h = tileSize;
			
			this.color('blue');
			
			this.collision();
		}
	});
	
	Crafty.c('SnakeSegment', {
		init: function() {
			this.addComponent('2D, DOM, Color, solid, Collision');
			
			this.h = tileSize;
			this.w = tileSize;
			
			this.color('green');
		}
	});
	
	Crafty.c('Snake', {
		_segments: [],
		_direction: 'right',
		_drawn: false,
		_keys: { 38: 'up', 40: 'down', 39: 'right', 37: 'left'},
		init: function() {
			this.addComponent('SnakeSegment');
			this.h = tileSize;
			this.w = tileSize;
			
			movers.push(this);
		},
		Snake: function(length, direction) {
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
			
			var s = this;
			sock.on('direction', function(dir) {
				s._direction = dir;
			});

			this.bind("KeyDown", function(e) {
				if(this._keys[e.key]) {
				}
			})
			.bind("KeyUp", function(e) {
				if(this._keys[e.key]) {
					sock.emit('direction', this._keys[e.key]);
				}
			})
			.bind("EnterFrame",function() {
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
			
			return this;
		}
	});

    //method to generate the map
    function generateWorld() {
        //loop through all tiles
        for (var i = 0; i < worldWidth; i++) {
            for (var j = 0; j < worldHeight; j++) {

				// Outer walls
                if(i === 0 || i === 24 || j === 0 || j === 20)
                    Crafty.e('wall')
                    	.attr({ x: i * 16, y: j * 16, z: 2 });
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
        //black background with some loading text
        Crafty.e("2D, DOM, Text").attr({ w: 100, h: 20, x: 150, y: 120 })
                .text("Loading")
                .css({ "text-align": "center" });

		Crafty.scene("main"); //when everything is loaded, run the main scene
    });

    Crafty.scene("main", function () {
		Crafty.background("black");

		generateWorld();

		Crafty.e('Snake')
			.attr({ 
				x: tileSize * 3, 
				y: tileSize, 
				z: 1
			}).Snake(3, 'right');
    });

	
    Crafty.scene("loading");
        Crafty.background("#000");
};
