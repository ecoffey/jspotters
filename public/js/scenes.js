Crafty.scene("loading", function () {
    Crafty.e("2D, DOM, Text").attr({ w: Snakes.tileSize * Snakes.worldWidth, h: 20 })
		.text("Loading")
		.css({ 
			"text-align": "center", 
			"top": "120px",
			"color": "White" });
});

Crafty.scene("main", function () {
	Crafty.background("black");
	
	Crafty.e('Level').Level();
});