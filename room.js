var moment = require('moment');

function Room(name, id, description) { 
	this.name = name;
	this.id = id;
	//this.owner = owner; //Might need this at some point. For non-spamming purposes.
	this.status = "available";
	this.description = description;
	this.users = [];
	this.queue = [];
	this.isPlaying = false;
	this.songTimerInterval = null;
	this.lastSongStartTime = null;
};

Room.prototype.GetData = function() {
	return {
		name: this.name,
		id: this.id,
		description: this.description,
		users: this.users,
		queue: this.queue,
		isPlaying: this.isPlaying
	}
}

Room.prototype.AddPerson = function(personID) {  
	if (this.status === "available") {
		this.users.push(personID);
		console.log(this.users);
	}
};

Room.prototype.OnSongEndOrSkip = function(){
	this.isPlaying = false;

	console.log("Queue During: " + this.queue);
	this.queue.shift();

	clearInterval(this.songTimerInterval);
	//io.sockets.in(this).emit('queue_update', { queue: this.queue });
	if(this.queue.length>0){
		this.StartSong();
	}
};

Room.prototype.StartSong = function(){
	this.isPlaying = true;
	var time = this.queue[0].duration;
	time += 5000; // # Milisecond delay before starting a new song. (In case people are offset by a little)

	this.songTimerInterval = setInterval(this.OnSongEndOrSkip,time);
	this.lastSongStartTime = moment();
};

//Should probably be by id. idk.
Room.prototype.UserLeft = function(id) {
 	var personIndex = this.users.indexOf(id);
 	console.log(this.users[personIndex] + " left " + this.name + "!");
	this.users.splice(personIndex, 1);
};

module.exports = Room; 