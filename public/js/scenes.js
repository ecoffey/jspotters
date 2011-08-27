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
	
	// Outer walls
    for (var i = 0; i < Snakes.worldWidth; i++) {
        for (var j = 0; j < Snakes.worldHeight; j++) {
            if(i === 0 || i === 24 || j === 0 || j === 20) {
                Crafty.e('wall')
                	.attr({ 
						x: i * Snakes.tileSize, 
						y: j * Snakes.tileSize, 
						z:2
					});
			}
			
        }
    }

	// Inner walls
	for (var i=0; i < Crafty.innerWalls.length; i++) {
		var coords = Crafty.innerWalls[i];
		
		Crafty.e('wall')
			.attr({
				x: coords.x * Snakes.tileSize,
				y: coords.y * Snakes.tileSize,
				z: 2
			});
	};

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
	
	setInterval(function() {
		for (var i = Snakes.movers.length - 1; i >= 0; i--){
			Snakes.movers[i]._drawn = false;
		};
	}, 250);
});
