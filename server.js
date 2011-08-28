var http	= require('http'),
	express	= require('express'),
 	nko		= require('nko')('kXMcKF9DfRvjNGzS'),

	// Server initialization
	server	= express.createServer(),
	io		= require('socket.io').listen(server);


// Configuration
server.configure(function() {
	server.use(express.static(__dirname + '/public'));
});


// Routes
server.get('/', function(req, res) {
	res.sendfile('views/index.html');
});

server.get('/:gameId', function(req, res) {
	res.send('game #:' + req.params.gameId);
});


// Start the web server
server.listen(process.env.NODE_ENV === 'production' ? 80 : 7777, function() {
	console.log('Ready');

	// if run as root, downgrade to the owner of this file
	if (process.getuid() === 0) {
		require('fs').stat(__filename, function(err, stats) {
			if (err) return console.log(err)
			process.setuid(stats.uid);
		});
	}
});

console.log('Started server on ' + server.address().port);


// Game module junk ///////////////////////////////////////////////////
var gameModule	= require('./engine/game'),
	games		= [],
	gameId		= 0,
	removeGame	= function(id) {
		for (var i=0; i < games.length; i++) {
			if(games[i].id === id) {
				games.splice(i, 1);
				
				return;
			}
		};
	};
	
// once the client has connected
io.sockets.on('connection', function(sock) {
	var game;
	
	console.log('client connected');

	if(games.length === 0) {
		games.push(game = gameModule.createNew(++gameId, function() {
			removeGame(this.id);
		}));
	} else {
		var index = games.length - 1;
		
		if (games[index].snakes.length === 4) {
			games.push(game = gameModule.createNew(++gameId, function() {
				removeGame(this.id);
			}));
		} else {
			game = games[index];
		}
	}

	// add new player
	game.join(sock);
	
	// start game if not
	if(!game.active)
		game.start();
});
