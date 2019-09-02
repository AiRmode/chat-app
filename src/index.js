//socket.emit(), io.emit(), socket.broadcast.emit()
//               io.emit(), socket.broadcast.to.emit()
const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generateMessage, generateLocationMessage} = require('./utils/messages');
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users');

const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirPath = path.join(__dirname, '../public');

app.use(express.static(publicDirPath));

io.on('connection', (socket) => {
    console.log('New websocket connection');

    socket.on('join', (options, callback) => {
        const {error, user} = addUser({id: socket.id, ...options});
        if (error) {
            return callback(error);
        }
        socket.join(user.room);
        //send message to a particular client socket
        socket.emit('message', generateMessage('Admin', 'Hello chat'));
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });
        callback();
    });

    socket.on('sendMessage', (data, callback) => { //add processing event: 'sendMessage'
        const user = getUser(socket.id);
        const filter = new Filter();
        if (filter.isProfane(data)) {
            socket.emit('message', generateMessage(user.username, 'Bad words detected. Please remove and try again'));
            return callback('Profanity is not allowed');
        }
        io.to(user.room).emit('message', generateMessage(user.username, data));    //if (event) - send message to all connected client.
        // Who listens - that processes the event
        callback();
    });

    socket.on('sendLocation', (data, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${data.latitude},${data.longitude}`));
        callback('detected');
    });

    socket.on('disconnect', () => {
        const removedUser = removeUser(socket.id);
        if (removedUser) {
            io.to(removedUser.room).emit('message', generateMessage('Admin', `${removedUser.username} has left the chat`));
            io.to(removedUser.room).emit('roomData', {
                room: removedUser.room,
                users: getUsersInRoom(removedUser.room)
            });
        }
    });
});

app.get('/', async (req, res) => {
    res.render('index');
});

server.listen(port, () => {
    console.log('Server listens port: ' + port);
});