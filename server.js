const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const PORT = process.env.PORT? process.env.PORT : 3000;
usersList = [];
connectedSockets = [];

app.get('/', (req, res) =>{
  res.sendFile(__dirname + '/index.html');
});

//Start Socket Connection
io.on('connection', socket =>{
  connectedSockets.push(socket);
  console.log('Connected => %s socket%s now connected', connectedSockets.length, (connectedSockets.length > 1 ? 's' : ''));

  //On Socket Disconnection
  socket.on('disconnect', () =>{
    usersList.splice(usersList.indexOf(socket.username), 1);
    connectedSockets.splice(connectedSockets.indexOf(socket), 1);
    updateUsernames();
    console.log('Disconnected => %s socket%s now connected', connectedSockets.length, (connectedSockets.length > 1 ? 's' : ''));
  });

  //Send back to connectedSockets incomming message
  socket.on('send message', message =>{
    io.sockets.emit('new message', {content:message, expeditor:socket.username});
  });

  //Register new user
  socket.on('new user', (user_name, callback) =>{
    callback(true);
    socket.username = user_name;
    usersList.push(socket.username);
    updateUsernames();
  })

  function updateUsernames () {
    io.sockets.emit('get users List', usersList);
  }
}); //END

//Runing Server
server.listen(PORT, ()=>{
  console.log('Server Runing on Port => '+ PORT);
});
