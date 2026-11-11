const express = require('express');
const { DatabaseSync } = require('node:sqlite');
const { createServer } = require('node:http');
const { Server } = require('socket.io');

const app = express();
//const server = createServer(app);

const db = new DatabaseSync('app.db');
db.exec('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT NOT NULL)');
db.exec('CREATE TABLE IF NOT EXISTS messages (username TEXT NOT NULL, message TEXT NOT NULL, channel TEXT NOT NULL, expire_date DATE)');

const add_msg = db.prepare('INSERT INTO messages (username, message, channel, expire_date) VALUES (?, ?, ?, ?)');
const get_msg = db.prepare('SELECT username, message, channel FROM messages');
const del_old_msg = db.prepare('DELETE FROM messages WHERE expire_date < ?');

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173"]
  }
});

io.on('connection', (socket) => {
  socket.on("disconnect", (reason) => {
    console.log(socket.id, 'disconnected at', Date(), "Reason:", reason);
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
  socket.on('joinchannel', (channelID) => {
    socket.join(channelID);
    console.log(socket.id, "joined", channelID);
  })
  socket.on('msg', (username: string, message: string, channelID: string) => {
    if (username === null) {return;}
    var expire_date = new Date(Date.now());
    expire_date.setDate(expire_date.getDate() + 90);
    const expireDateValue = expire_date instanceof Date ? expire_date.toISOString() : expire_date;
    add_msg.run(username, message, channelID, expireDateValue);
    io.to(channelID).emit('new_msg', username, message, Date());
  })
  socket.on('cmd', (username: string, command: string, channelID: string) => {
    if (command.includes("/music")) { 
      if (command.includes("stop")) {
        io.to(channelID).emit('stopmusic', username);
        return;
      } else if (command.includes("play")) {
        io.to(channelID).emit('playmusic', username, 0);
        return;
      }
    } else {
      console.log("User", username, "tried to use command:", command, "in", channelID);
    }
  })
  socket.on('getChannels', (callback) => {
    callback({
      channels: ["General", "minecraft", "t-matte", "p-matte", "Kasane Teto Fan Club", "Hatsune Miku Fan Club"],
      status: "ok"
    })
  })
  socket.on('getMessageHistory', (callback) => {
    del_old_msg.run(new Date().toISOString());
    callback({
      usernames: get_msg.all().map(row => row.username),
      messages: get_msg.all().map(row => row.message),
      channels: get_msg.all().map(row => row.channel),
      status: "ok"
    })
  })
});

httpServer.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});