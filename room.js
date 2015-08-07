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

Room.prototype.AddPerson = function(personID) {  
	if (this.status === "available") {
		this.users.push(personID);
	}
};

Room.prototype.OnSongEndOrSkip = function(){
	this.isPlaying = false;
	clearInterval(this.songTimerInterval);

	this.queue.shift();
	io.sockets.in(this).emit('queue_update', { queue: this.queue });
	if(this.queue.length>0){
		StartSong();
	}
};

Room.prototype.StartSong = function(){
	this.isPlaying = true;
	var time = this.queue[0].duration;
	time += 5000; // # Milisecond delay before starting a new song. (In case people are offset by a little)

	this.songTimerInterval = setInterval(OnSongEndOrSkip,time);
	this.lastSongStartTime = moment();
};

//Should probably be by id. idk.
Room.prototype.UserLeft = function(name) {
    for (var i = 0; i < this.users.length; i++) {
      if (name === this.users[i]) {
        console.log("Removing from room: " + name);
        this.users.splice(i, 1);
      }
    }
};

module.exports = Room; 