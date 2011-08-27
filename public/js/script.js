window.onload = function () {
	Crafty.c('wall', {
		init: function() {
			this.addComponent('2D, Canvas, Color, Collision, solid');
			
			this.w = Snakes.tileSize;
			this.h = Snakes.tileSize;
			
			this.color('blue')
				.collision();
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
			this._direction	= 'right';
			this._drawn		= false;
			this._keys		= {};
			
			Snakes.movers.push(this);
		},
		Snake: function(length, direction, color) {
			this._direction = direction;

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
						this.y -= Snakes.tileSize;
						break;

					case 'down':
						this.y += Snakes.tileSize;
						break;

					case 'left':
						this.x -= Snakes.tileSize;
						break;

					case 'right':
						this.x += Snakes.tileSize;
						break;
				}

				this._drawn = true;
				this.trigger('Moved', {x: prevX, y: prevY});
			});

			this.bind('Moved', function(from) {
					if(this.hit('solid')) {
						// TODO: Add death rattle
						for(var i = 0; i < this._segments.length; i++) {
							this._segments[i].destroy();
						}
						
						this.destroy();
					}
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
		Player: function(length, direction, color, keys) {
			this._keys = keys;
			
			this.Snake(length, direction, color);
						
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
	
    //start crafty
    Crafty.init(Snakes.worldWidth * Snakes.tileSize, Snakes.worldHeight * Snakes.tileSize);
    Crafty.canvas.init();

	Crafty.background("#000");
	Crafty.scene("loading");
};