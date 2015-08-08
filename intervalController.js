
function IntervalController(room){
	this.room = room;
	this.intervalObject;
}

IntervalController.prototype.SetInterval = function(time){
	this.intervalObject = setInterval(function(){
		this.OnIntervalComplete(this);
	},time);
}

IntervalController.prototype.ClearInterval = function(){
	clearInterval(this.intervalObject);
}

IntervalController.prototype.OnIntervalComplete = function(room){
	room.OnSongEndOrSkip();
}

module.exports = IntervalController;