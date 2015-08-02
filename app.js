var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(80);

var roomData = {
	title: "A Room",
	description: "A room for things",
	users: [],
	queue: []
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/socket.html');
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
		console.log(socket.name + ' disconnected!');
	});

	socket.on('add_to_queue', function (data) {
		queue.push(data);
		io.emit('queue_update', { queue: roomData.queue })
	});
});

function userLeft(name) {
    for (var i = 0; i < roomData.users.length; i++) {
      if (name === clientList[i]) {
        console.log("name is: " + name);
        roomData.users.splice(i, 1);
      };
    }

    //Maybe should have client remove locally but just passing list for easiness.
   	io.emit('user_left', {name:name, list: roomData.users})
    updateClientUserList(roomData.users);
    console.log('New Client List: ' + roomData.users);
 };