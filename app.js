var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// New call to compress content
//app.use(express.compress());

app.use(express.static(__dirname + '/public'));

server.listen(3333);

console.log("Listening on port 3333!");

var roomData = {
	title: "A Room",
	description: "A room for things",
	users: [],
	queue: []
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
	io.to(socket.id).emit('connect_success', roomData);

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
		io.emit('queue_update', { queue: roomData.queue })
	});
});

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