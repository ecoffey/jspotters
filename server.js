var http = require('http'); 
var express = require('express');
var nko = require('nko')('kXMcKF9DfRvjNGzS');
var server = express.createServer();
var io = require('socket.io').listen(server);

var gameModule = require('./engine/game');

var game = gameModule.newGame(1);

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

io.sockets.on('connection', function(sock) {
	sock.on('direction', function(dir) {
		console.log('Dir ' + dir);
		sock.emit('direction', dir);
	});
});

var HandleGameEntry = function(req, res) {
	// the id passed in the url
	var id = req.params.gameId;
	
	// first step:
	//
	// check if the game exists :
	//   if y, see if we can join (not in progress, < 4 players)
	//     if y, add player to game
	//     if n, redirect back to landing page (notify?)
	//   if n, initialize a new game session
};
