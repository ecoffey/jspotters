exports.createNew = createNew;

function Game(id) {
	this.id = id;
	this.test = 'hmm';
	
	this.snakes = new Array(0);
	this.apples = new Array(0);
	
	this.xWidth = 25;
	this.yWith = 21;
	
	console.log('game ' + this.id + 'created');
};

function createNew(id){
	return new Game(id);
};

function updateGameState() {
	//this.test += 'm';
	//console.log(this.test);
	
	// TODO
};
Game.prototype.updateGameState = updateGameState;

function start(){

	this.intervalId = setInterval(updateGameState, 250); // need args?
	console.log('game ' + this.id + ' started, interval id:' + this.intervalId);
}
Game.prototype.start = start;

function stop(){
	if(this.intervalId) {
		console.log('game stopped');
		clearTimeout(this.intervalId);	
	}
};
Game.prototype.stop = stop;
