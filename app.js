var express = require('express')
, app 		= express()
, server 	= require('http').Server(app)
, io 		= require('socket.io')(server)
, moment 	= require('moment')
, uuid 		= require('node-uuid')
, Room 		= require('./room.js');


//EXPRESS+SERVER INIT/////////////////////////

var http = require("http");
setInterval(function() {
    // For production
    // http.get("http://mushuk-dev.herokuapp.com");
    // For testing
    http.get("localhost:5000");
}, 600000);

app.use(express.static(__dirname + '/public'));
server.listen(process.env.PORT || 5000);

console.log("Listening on port " + process.env.PORT + "!");

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

//////////////////////////////////////////////

//SOCKET STUFF////////////////////////////////
var serverData = {
	users: [],
	rooms: []
}

var testRoom1 = {
	name: "Muzak Room",
	description: "The best fucking room get on my fucking level."
}

var testRoom2 = {
	name: "DUBSTEP",
	description: "WUBWUBWUBWUBWUBW wAAAAAAAAH ERRRNN DDDRRRR WUBWUB."
}

var testRoom3 = {
	name: "Bird: A retrospective",
	description: "In this enthralling biopic, the bird details his life as the word."
}

CreateRoom (testRoom1);
CreateRoom (testRoom2);
CreateRoom (testRoom3);

io.on('connection', function (socket) {
	socket.on('disconnect', function(){
		UserLeft(socket.name);
		console.log(socket.name + ' disconnected!');
	});

	// Send chat message
	socket.on('chat message', function(msg){
    io.emit('chat message', msg);
    console.log('message: ' + msg);
  });

	socket.on('set_name', function (data) {
		socket.name = data.name;
		serverData.users.push(socket.name);

		socket.emit('update_room_list', {rooms:serverData.rooms});

		socket.on('create_room', function (roomInfo) {
			CreateRoom(roomInfo,socket);
		});

		socket.on('join_room', function (id) {
			var room = serverData.rooms[id];
			room.AddPerson(socket.name);
			socket.room = room;
			socket.join(socket.room);
			io.sockets.in(socket.room).emit('user_joined', {name: socket.name, list: socket.room.users});
			OnJoinRoom(socket);
		});

	});

});

function CreateRoom(roomInfo,socket){
	var id = uuid.v4();
    var room = new Room(roomInfo.name, id, roomInfo.description);
    serverData.rooms[id] = room;
    if(socket){
    	socket.room = name; //name the room
	    socket.join(socket.room); //auto-join the creator to the room
	    room.addPerson(socket.name); //also add the person to the room object
	    OnJoinRoom(socket);
    }
}

//These handlers should be defined in room.
function OnJoinRoom(socket){

	var currentPosition;
	if(socket.room.isPlaying){
		currentPosition = moment()-socket.room.lastSongStartTime;
	}
	else{
		currentPosition = 0;
	}
	io.to(socket.id).emit('connect_success', {room: socket.room, pos: currentPosition});

	socket.on('add_to_queue', function (data) {
		socket.room.queue.push(data.track);
		console.log(data.track.title);
		io.emit('queue_update', { queue: socket.room.queue });
		if(socket.room.queue.length==1){
			StartSong();
		}
	});

	socket.on('request_next_track', function () {
		socket.room.OnSongEndOrSkip();
	});

	socket.on('disconnect', function (){
		socket.room.UserLeft(socket.name);
		UserLeft(socket.name);
	});
}

function UserLeft(name){
    for (var i = 0; i < this.users.length; i++) {
      if (name === this.users[i]) {
        console.log("Removing from server: " + name);
        this.users.splice(i, 1);
      }
    }

    console.log('New Client List: ' + this.users);
}
//////////////////////////////////////////////

// Update client-side user list

function updateClientUserList(clientList){
  io.sockets.emit('sync user list', clientList);
  console.log('current users: ' + clientList.toString());
}

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

  var leftMsg = userLeftMessage();

  io.emit('user_left', {name:name, list: roomData.users, msg: leftMsg})
  console.log('New Client List: ' + roomData.users);
  io.emit('update_user_list', roomData.users);
};

function userLeftMessage() {
  var leftMessages = ['ran out screaming','exploded nicely','evaporated into sierra mist','left to go poop','peaced out','was terminated','kicked the computer and it burst into flames and is now gone forever','went to eat five burritos','went to walk the parrot','left to buy a shoe','left like a doophead','left the room','left the room','left the room','left the room','left the room','left the room','left the room','left the room','left the room','left the room','left the room','left the room','left the room','left the room','left the room','left the room','left the room','left the room'],
    leftMsg = leftMessages[Math.floor(Math.random() * leftMessages.length)];

  console.log("msg is "+leftMsg);
  return leftMsg;
};
