Crafty.scene("loading", function () {
    Crafty.e("2D, DOM, Text").attr({ w: Snakes.tileSize * Snakes.worldWidth, h: 20 })
		.text("Loading")
		.css({ 
			"text-align": "center", 
			"top": "120px",
			"color": "White" });

	Crafty.scene("main");
});

Crafty.scene("main", function () {
	Crafty.background("black");
	
	Crafty.e('Level').Level();

	Crafty.e('Player')
		.attr({ 
			x: Snakes.tileSize * 3, 
			y: Snakes.tileSize, 
			z: 1
		}).Player(Snakes.startingLength, 'right', 'green', { 38: 'up', 40: 'down', 39: 'right', 37: 'left'});
	
	Crafty.e('Snake')
		.attr({
			x: Snakes.tileSize * (Snakes.worldWidth - 5),
			y: Snakes.tileSize * (Snakes.worldHeight - 3),
			z: 1
		}).Snake(Snakes.startingLength, 'left', 'yellow');
	
	Snakes.drawHandle = setInterval(
		function() {
			for (var i = Snakes.movers.length - 1; i >= 0; i--){
				Snakes.movers[i]._drawn = false;
			};
		}, 250);
		
	// TODO: this will come from the server
	Snakes.fruitGenHandle = setInterval(
		function() {
			if(Crafty.randRange(1, 3) === 1) {
				var x, y;
				
				var conflict = function(coord) {
					var compCoord,
						arrays = [Snakes.innerWalls, Snakes.fruit, Snakes.movers];
					
					for (var a=0; a < arrays.length; a++) {
						for (var i=0; i < arrays[a].length; i++) {
							compCoord = arrays[a][i];

							if(coord.x === compCoord.x && coord.y === compCoord.y)
								return true;
						};
					};
					
					return false;
				};
				
				do {
					x = Crafty.randRange(1, Snakes.worldWidth - 2);
					y = Crafty.randRange(1, Snakes.worldHeight - 2);
				} while(conflict({ x:x, y:y}));
				
				Snakes.fruit.push(
					Crafty.e('fruit')
						.attr({
							x: x * Snakes.tileSize,
							y: y * Snakes.tileSize,
							z: 2
						})
				);
			}
		}, 1000);
});
