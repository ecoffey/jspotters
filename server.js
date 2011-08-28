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
io.configure(function() {
	io.set('log level', 1);
});

// Routes
server.get('/', function(req, res) {
	res.sendfile('views/index.html');
});

server.get('/join', function(req, res) {
	var game;

	if(games.length === 0) {
		games.push(game = gameModule.createNew(++gameId, function() {
			removeGame(this.id);
		}));
	} else {
		var index = games.length - 1;
		
		if (games[index].snakes.length === 4 || games[index].active) {
			games.push(game = gameModule.createNew(++gameId, function() {
				removeGame(this.id);
			}));
		} else {
			game = games[index];
		}
	}
	
	res.redirect('/' + game.id);
});

server.get('/:gameId', function(req, res) {
	io.of('/' + req.params.gameId).on('connection', onConnection);
	res.sendfile('views/game.html');
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

//io.sockets.on('connection', onConnection);
// once the client has connected
function onConnection(sock) {
	console.log('client connected');

	sock.on('join', function(gameId) {

		for (var i=0; i < games.length; i++) {
			var game = games[i];
			
			if(game.id == gameId) {
				if(!game.active && game.snakes.length < 4) {
					game.join(sock);
				} else {
					sock.emit('rejoin');
				}
				
				return;
			}
		};
		
		sock.emit('rejoin');
	});
}
