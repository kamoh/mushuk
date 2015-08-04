var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var moment = require('moment');


// New call to compress content
//app.use(express.compress());

var http = require("http");
setInterval(function() {
    http.get("http://mushuk-dev.herokuapp.com");
}, 600000);

app.use(express.static(__dirname + '/public'));
server.listen(process.env.PORT || 5000);

console.log("Listening on port " + process.env.PORT + "!");

var roomData = {
	title: "A Room",
	description: "A room for things",
	users: [],
	queue: [],
	isPlaying: false
}

var songTimerInterval;
var lastSongStartTime;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
	var currentPosition;
	if(roomData.isPlaying){
		currentPosition = moment()-lastSongStartTime;
	}
	else{
		currentPosition = 0;
	}
	io.to(socket.id).emit('connect_success', {room: roomData, pos: currentPosition});

	socket.on('set_name', function (data) {
		socket.name = data.name;
		roomData.users.push(socket.name);
		console.log(socket.name + " has joined!");
		io.emit('user_joined', {name: socket.name, list: roomData.users});
	});

	socket.on('disconnect', function(){
		userLeft(socket.name);
		console.log(socket.name + ' disconnected!');
	});

	socket.on('add_to_queue', function (data) {
		roomData.queue.push(data.track);
		console.log(data.track.title);
		io.emit('queue_update', { queue: roomData.queue });
		if(roomData.queue.length==1){
			StartSong();
		}
	});

	socket.on('request_next_track', function () {
		OnSongEndOrSkip();
	});
});

function OnSongEndOrSkip(){
	roomData.isPlaying = false;
	clearInterval(songTimerInterval);

	roomData.queue.shift();
	io.emit('queue_update', { queue: roomData.queue });
	if(roomData.queue.length>0){
		StartSong();
	}
}

function StartSong(){
	roomData.isPlaying = true;
	var time = roomData.queue[0].duration;
	time += 5000; // # Milisecond delay before starting a new song. (In case people are offset by a little)

	songTimerInterval = setInterval(OnSongEndOrSkip,time);
	lastSongStartTime = moment();

	io.emit('start_next_song');
}

function userLeft(name) {
    for (var i = 0; i < roomData.users.length; i++) {
      if (name === roomData.users[i]) {
        console.log("Removing: " + name);
        roomData.users.splice(i, 1);
      };
    }

   	io.emit('user_left', {name:name, list: roomData.users})
    console.log('New Client List: ' + roomData.users);
 };