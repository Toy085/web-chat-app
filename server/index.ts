const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173"]
  }
});

io.on('connection', (socket) => {
  socket.on("disconnect", () => {
    console.log('a user disconnected at', Date());
  });
  socket.on('join', (username: string, displayname: string, callback) => {
    if (username.length === 0 || displayname.length === 0) {
      callback({
        status: 400
      })
    }
    console.log(username, 'connected at', Date());
    callback({
      status: "ok"
    })
  })
  socket.on('getChannels', (callback) => {
    callback({
      channels: ["minecraft", "t-matte"],
      status: "ok"
    })
  })
});

httpServer.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});