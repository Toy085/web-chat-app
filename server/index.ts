const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { DatabaseSync } = require('node:sqlite');
const { createServer } = require('node:http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);

const db = new DatabaseSync('app.db');
db.exec('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT NOT NULL, token TEXT)');
db.exec('CREATE TABLE IF NOT EXISTS messages (username TEXT NOT NULL, message TEXT NOT NULL, channel TEXT NOT NULL, expire_date DATE)');

const add_user = db.prepare('INSERT INTO users (username, token) VALUES (?, ?)');
const get_user_by_token = db.prepare('SELECT id, username FROM users WHERE token = ?');

const add_msg = db.prepare('INSERT INTO messages (username, message, channel, expire_date) VALUES (?, ?, ?, ?)');
const get_msg = db.prepare('SELECT username, message, channel FROM messages');
const del_old_msg = db.prepare('DELETE FROM messages WHERE expire_date < ?');

dotenv.config();

let PORT = process.env.PORT || 3000;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173"]
  }
});

function validateToken(token: string) {
  let jwtSecretKey = process.env.JWT_SECRET_KEY;

  try {
    const verified = jwt.verify(token, jwtSecretKey);
    if (verified) {
      return 200;
    } else {
      return 401;
    }
    } catch (error) {
      console.log(error)
      return 401;
    }
}

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
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    let data = {
        time: Date(),
        userId: socket.id,
    }

    console.log(username, 'connected at', Date());
    const token = jwt.sign(data, jwtSecretKey);

    add_user.run(username, token);

    callback({
      status: "ok",
      token: token
    })
  })
  socket.on('joinchannel', (channelID) => {
    socket.rooms.forEach(room => {
    if (room !== socket.id) { socket.leave(room); }
    });

    socket.join(channelID);
    console.log(socket.id, "joined", channelID);
  })
  socket.on('msg', (token: string, message: string, channelID: string) => {
    if (token === null) {return;}
    if (validateToken(token) != 200) { return; }

    let username = get_user_by_token.get(token)?.username;
    
    var expire_date = new Date(Date.now());
    expire_date.setDate(expire_date.getDate() + 90);
    const expireDateValue = expire_date instanceof Date ? expire_date.toISOString() : expire_date;
    add_msg.run(username, message, channelID, expireDateValue);
    io.to(channelID).emit('new_msg', username, message, Date());
  })
  socket.on('cmd', (token: string, command: string, channelID: string) => {
    if (token === null) {return;}
    if (validateToken(token) != 200) { return; }

    let username = get_user_by_token.get(token)?.username;

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

httpServer.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});