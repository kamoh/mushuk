
function IntervalController(room){
	this.room = room;
	this.intervalObject;
}

IntervalController.prototype.SetInterval = function(time){
	this.intervalObject = setInterval(this.OnIntervalComplete,time);
}

IntervalController.prototype.ClearInterval = function(){
	clearInterval(this.intervalObject);
}

IntervalController.prototype.OnIntervalComplete = function(){
	this.room.OnSongEndOrSkip();
}

module.exports = IntervalController;