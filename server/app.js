const app = require('express');
const http = require('http').createServer(app);
var io = require('socket.io')(http, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
	},
});

io.on('connection', (socket) => {
	/* socket object may be used to send specific messages to the new connected client */

	console.log('new client connected');
	socket.emit('connection', null);
	socket.on('user_join', ({ name, room }) => {
		this.username = name;
		this.room = room;
		console.log(name);
		console.log(room);
		socket.join(room);
		socket.to(room).emit('user_join', name);
	});

	socket.on('room_join', (room) => {
		socket.join(room);
	})

	socket.on('message', ({ name, message, room }) => {
		console.log(name, message);
		io.in(room).emit('message', { name, message });
	});

	socket.on('disconnect', () => {
		console.log('Disconnect Fired');
		//socket.broadcast.emit('user_leave', `${this.username} has left`);
	});
});

io.of("/").adapter.on("create-room", (room) => {
	console.log(`room ${room} was created`);
});

io.of("/").adapter.on("join-room", (room, id) => {
	console.log(`socket ${id} has joined room ${room}`);
});

http.listen(4000, () => {
	console.log(`listening on *:${4000}`);
});
