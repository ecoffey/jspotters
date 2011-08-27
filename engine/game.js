exports.createNew = createNew;

function Game(id) {
	this.id = id;
};

function createNew(id){
	return new Game(id);
};
