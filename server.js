var http = require('http'); 
var express = require('express');
var nko = require('nko')('kXMcKF9DfRvjNGzS');

// Server initialization
var server = express.createServer();
var io = require('socket.io').listen(server);

server.configure(function() {
	server.use(express.static(__dirname + '/public'));
});

server.get('/', function(req, res) {
	res.sendfile('views/index.html');
});

server.get('/:gameId', function(req, res) {
	res.send('game #:' + req.params.gameId);
});

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

// initialize
var gameModule = require('./engine/game');
var game = gameModule.createNew(1);

// once the client has connected
io.sockets.on('connection', function(sock) {
	console.log('client connected');

	game.join(sock);
	
	// start the game!
	game.start();
	
	//setTimeout(function() { game.stop(); }, 3000);
});





