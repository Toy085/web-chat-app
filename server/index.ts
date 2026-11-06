const express = require('express');
const { DatabaseSync } = require('node:sqlite');
const { createServer } = require('node:http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);

const db = new DatabaseSync('app.db');
db.exec('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT NOT NULL)');
db.exec('CREATE TABLE IF NOT EXISTS messages (username TEXT NOT NULL, message TEXT NOT NULL, expire_date DATE)');
const add_msg = db.prepare('INSERT INTO messages (username, message, expire_date) VALUES (?, ?, ?)');

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
  socket.on('msg', (username: string, message: string) => {
    var expire_date = new Date(Date.now());
    expire_date.setDate(expire_date.getDate() + 90);
    const expireDateValue = expire_date instanceof Date ? expire_date.toISOString() : expire_date;
    add_msg.run(username, message, expireDateValue);
    socket.emit('new_msg', username, message, Date());
  })
  socket.on('getChannels', (callback) => {
    callback({
      channels: ["General", "minecraft", "t-matte", "p-matte", "Kasane Teto Fan Club"],
      status: "ok"
    })
  })
});

httpServer.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});