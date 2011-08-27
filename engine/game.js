var exports = module.exports;

function Game(id) {
	this.id = id;
};

exports.newGame = function(id) {
	return new Game(id);
}

