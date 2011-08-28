var levels = [];

exports.getLevels = function() {
	return levels;
};

function range(start, end) {
	var arr = [];
	
	if(start.x != end.x) {
		for (var i=start.x; i <= end.x; i++) {
			arr.push({ x: i, y: start.y });
		};
	} else {
		for (var i=start.y; i <= end.y; i++) {
			arr.push({ x: start.x, y: i });
		};
	}
	
	return arr;
};

// First Level: The Cross
levels.push(
	{
		innerWalls: 
			[].concat(
				// Top left
				range({ x:1, y: 1 }, { x: 9, y: 1}),
				range({ x:1, y: 1 }, { x: 1, y: 9}),
				
				// Top right
				range({ x:30, y: 1 }, { x: 38, y: 1}),
				range({ x:38, y: 1 }, { x: 38, y: 9}),
				
				// Bottom left
				range({ x:1, y: 28 }, { x: 9, y: 28}),
				range({ x:1, y: 20 }, { x: 1, y: 28}),
				
				// Bottom right
				range({ x:30, y: 28 }, { x: 38, y: 28}),
				range({ x:38, y: 20 }, { x: 38, y: 28}),
				
				// Cross horizontal
				range({ x:10, y: 14 }, { x: 29, y: 14}),
				range({ x:10, y: 15 }, { x: 29, y: 15}),
				
				// Cross vertical
				range({ x:19, y: 6 }, { x: 19, y: 23}),
				range({ x:20, y: 6 }, { x: 20, y: 23})
			),
		startingLocations: [
			// If these are negative, it will be starting from bottom-right
			{x: 3, y: 3, direction: 'right', color: 'green'},
			{x: -4, y: -4, direction: 'left', color: '#990'},
			{x: -4, y: 3, direction: 'down', color: '#099'},
			{x: 3, y: -4, direction: 'up', color: '#f3f'}
		]
	});

// Second Level: Kinda like teeth?
levels.push(
	{
		innerWalls: 
			[].concat(
				// Top left wall
				range({ x:14,	y: 1 }, { x: 14,	y: 5}),
				range({ x:13,	y: 1 }, { x: 13,	y: 5}),

				// Top right wall
				range({ x:25,	y: 1 }, { x: 25,	y: 5}),
				range({ x:26,	y: 1 }, { x: 26,	y: 5}),

				// Bottom left wall
				range({ x:14,	y: 24 }, { x: 14,	y: 29}),
				range({ x:13,	y: 24 }, { x: 13,	y: 29}),

				// Bottom right wall
				range({ x:25,	y: 24 }, { x: 25,	y: 29}),
				range({ x:26,	y: 24 }, { x: 26,	y: 29}),

				// Center block
				range({ x:13,	y: 13 }, { x: 26,	y: 13}),
				range({ x:13,	y: 14 }, { x: 26,	y: 14}),
				range({ x:13,	y: 15 }, { x: 26,	y: 15}),
				range({ x:13,	y: 16 }, { x: 26,	y: 16})
			),
		startingLocations: [
			// If these are negative, it will be starting from bottom-right
			{x: 14, y: 9, direction: 'left', color: 'green'},
			{x: 25, y: 20, direction: 'right', color: '#990'},
			{x: 25, y: 9, direction: 'right', color: '#099'},
			{x: 14, y: 20, direction: 'left', color: '#f3f'}
		]
	});

// Third Level: SSSS AAAA FFFF EEEE TTTT YYYY
levels.push(
	{
		innerWalls:
			[].concat(
				// Top
				range({ x:10,	y: 6 }, { x: 29,	y: 6}),

				// Left
				range({ x:9,	y: 7 }, { x: 9,		y: 13}),

				// Middle
				range({ x:10,	y: 14 }, { x: 29,	y: 14}),

				// Right
				range({ x:30,	y: 15 }, { x: 30,	y: 21}),

				// Bottom
				range({ x:9,	y: 22 }, { x: 29,	y: 22})
			),
		startingLocations: [
			// If these are negative, it will be starting from bottom-right
			{x: 24, y: 10, direction: 'right', color: 'green'},
			{x: 14, y: 18, direction: 'left', color: '#990'},
			{x: 4, y: 3, direction: 'down', color: '#099'},
			{x: -5, y: -4, direction: 'up', color: '#f3f'}
		]
	});