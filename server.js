var http = require('http'); 
var express = require('express');
var nko = require('nko')('kXMcKF9DfRvjNGzS');

var server = express.createServer();

server.get('/', function(req, res) {
	res.send('hiss-teria landing page!');
});

server.get('/:gameId', function(req, res) {
	res.send('game #:' + req.params.gameId);
});

server.listen(7777); 
console.log('Started server on ' + server.address().port);



// right now, the game engine etcetera
function Game(id) {
	this.id = id;
};

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
