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
    // Testing
    http.get("localhost:5000");
    // Production
    // http.get("http://mushuk-dev.herokuapp.com");
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
	description: "In this enthralling biopic, Colin Farrel plays 'The Bird' throughout his life as the word."
}

CreateRoom (testRoom1);
CreateRoom (testRoom2);
CreateRoom (testRoom3);

io.on('connection', function (socket) {
	console.log("Connection!");
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
			socket.room = room.name;
			socket.join(socket.room);
			io.sockets.in(socket.room).emit('user_joined', {name: socket.name, list: room.users});
			OnJoinRoom(socket, id);
		});

	});

});

function CreateRoom(roomInfo,socket){
	var id = uuid.v4();
    var room = new Room(roomInfo.name, id, roomInfo.description);

    room.eventEmitter.on('start_track', function(time){
    	StartTrack(room);
    	room.songTimerInterval = setInterval( function(){room.OnSongEndOrSkip();}, time);
	});

    room.eventEmitter.on('clear_interval', function(){
    	clearInterval(room.songTimerInterval);
    });

    serverData.rooms[id] = room;
    serverData.roomsInfo.push({name: room.name, id: room.id, description: room.description});
    console.log("room data: " + room);
    if(socket){
    	socket.room = roomInfo.name; //name the room
	    socket.join(socket.room); //auto-join the creator to the room
	    room.AddPerson(socket.id); //also add the person to the room object
	    OnJoinRoom(socket,id);
    }
}

//These handlers should be defined in room.
function OnJoinRoom(socket, id){
	room = serverData.rooms[id];

	//We should just send the last start time and have the client figure out the position of the song.
	var currentPosition;
	if(room.isPlaying){
		currentPosition = moment()-room.lastSongStartTime;
	}
	else{
		currentPosition = 0;
	}

	console.log(socket.name + " has joined a room!");

	io.to(socket.id).emit('connect_success', {room: room.GetData(), pos: currentPosition});

	socket.on('add_to_queue', function (data) {
		room.queue.push(data.track);
		console.log(data.track.title);
		io.sockets.in(socket.room).emit('queue_update', { queue: room.queue });
		if(room.queue.length==1){
			room.StartSong();
		}
	});

	  // Send chat message
	  socket.on('chat message', function(msg){
	    console.log('In server side chat message socket event');
	    io.sockets.in(socket.room).emit('chat message', msg);
	    console.log('message: ' + msg);
	  });

	socket.on('request_next_track', function () {
		console.log("Queue before: " + room.queue);
		room.OnSongEndOrSkip();
	});

	socket.on('disconnect', function (){
		room.UserLeft(socket.id);
		UserLeft(socket.id);
		io.sockets.in(socket.room).emit('user_left', {name:socket.name, list: room.users});
	});
}

function StartTrack(room){
	io.sockets.in(room.name).emit('queue_update', { queue: room.queue });
	io.sockets.in(room.name).emit('start_next_song');
}

function UserLeft(id){
    var personIndex = serverData.users.indexOf(id);
 	console.log(serverData.users[personIndex] + " left the server!");
	serverData.users.splice(personIndex, 1);

    //console.log('New Client List: ' + serverData.users);
}
//////////////////////////////////////////////