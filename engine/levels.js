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

// First Level
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
			{x: -3, y: -3, direction: 'left', color: '#990'},
			{x: -3, y: 3, direction: 'down', color: '#099'},
			{x: 3, y: -3, direction: 'up', color: '#f3f'}
		]
	});

// Second Level
levels.push(
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
			{x: -5, y: -3, direction: 'left', color: '#990'},
			{x: -3, y: 1, direction: 'down', color: '#099'},
			{x: 3, y: -3, direction: 'up', color: '#f3f'}
		]
	});