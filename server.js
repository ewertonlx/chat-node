const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

server.listen(4421, () => {
  console.log('Server is running on http://localhost:4421');
});

app.use(express.static(path.join(__dirname, 'public')));

let connectedUsers = [];

io.on('connection', (socket) => {
  console.log('[INFO] Conexão detectada');
  socket.on('join-request', (username) => {
    socket.username = username;
    connectedUsers.push(username);
    console.log(`[INFO] Usuário ${username} conectado`);
    console.log(`[INFO] Usuários conectados:`, connectedUsers);

    socket.emit('user-ok', connectedUsers);
    socket.broadcast.emit('list-update', {
      joined: username,
      list: connectedUsers
    });
  })

  socket.on('disconnect', () => {
    console.log(`[INFO] Usuário ${socket.username} desconectado`);
    connectedUsers = connectedUsers.filter(user => user !== socket.username);
    socket.broadcast.emit('list-update', {
      left: socket.username,
      list: connectedUsers
    });
  });

  socket.on('send-msg', (message) => {
    let obj = {
      username: socket.username,
      message
    }
    //socket.emit('show-msg', obj);
    socket.broadcast.emit('show-msg', obj);
  });
})