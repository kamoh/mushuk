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
    http.get("http://mushuk-dev.herokuapp.com");
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
	rooms: [],
	roomsInfo: []
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
	socket.on('set_name', function (data) {

		socket.name = data.name;
		serverData.users.push(socket.id);
		console.log(serverData.roomsInfo);
		socket.emit('update_room_list', {rooms:serverData.roomsInfo});

		socket.on('disconnect', function(){
			UserLeft(socket.name);
			console.log(socket.name + ' disconnected!');
		});

		socket.on('create_room', function (roomInfo) {
			CreateRoom(roomInfo,socket);
		});

		socket.on('join_room', function (id) {
			var room = serverData.rooms[id];
			room.AddPerson(socket.id);
			socket.room = room;
			socket.join(socket.room);
			io.sockets.in(socket.room).emit('user_joined', {name: socket.name, list: socket.room.users});
			OnJoinRoom(socket);
		});

	});
	
});

function CreateRoom(roomInfo,socket){
	var id = uuid.v4();
    var room = new Room(roomInfo.name, id, roomInfo.description,io);
    serverData.rooms[id] = room;
    serverData.roomsInfo.push({name: room.name, id: room.id, description: room.description});
    console.log(room);
    if(socket){
    	socket.room = name; //name the room
	    socket.join(socket.room); //auto-join the creator to the room
	    room.AddPerson(socket.id); //also add the person to the room object
	    OnJoinRoom(socket);
    }
}

//These handlers should be defined in room.
function OnJoinRoom(socket){

	//We should just send the last start time and have the client figure out the position of the song.
	var currentPosition;
	if(socket.room.isPlaying){
		currentPosition = moment()-socket.room.lastSongStartTime;
	}
	else{
		currentPosition = 0;
	}

	console.log(socket.name + " has joined a room!");

	io.to(socket.id).emit('connect_success', {room: socket.room.GetData(), pos: currentPosition});

	socket.on('add_to_queue', function (data) {
		socket.room.queue.push(data.track);
		console.log(data.track.title);
		io.sockets.in(socket.room).emit('queue_update', { queue: socket.room.queue });
		if(socket.room.queue.length==1){
			socket.room.StartSong();
			io.sockets.in(socket.room).emit('start_next_song');
		}
	});

	socket.on('request_next_track', function () {
		socket.room.OnSongEndOrSkip();
	});

	socket.on('disconnect', function (){
		socket.room.UserLeft(socket.id);
		UserLeft(socket.id);
		io.sockets.in(socket.room).emit('user_left', {name:socket.name, list: socket.room.users});
	});
}

function UserLeft(id){
    var personIndex = serverData.users.indexOf(id);
 	console.log(serverData.users[personIndex] + " left the server!");
	serverData.users.splice(personIndex, 1);

    //console.log('New Client List: ' + serverData.users);
}
//////////////////////////////////////////////