const express = require("express")
const app = express()
const bodyparser = require('body-parser')
const cors = require("cors")
const http = require('http').Server(app);
const PORT = process.env.PORT || 4000;
const io = require('socket.io')(http, {
  cors: {
      origin: process.env.CLIENT_URL ||  "http://localhost:3000"
  }
});

const { addUser, removeUser, getRoomUsers, getCurrentUser } = require('./routes/User')

app.use(bodyparser.urlencoded({ extended: true }))
app.use(bodyparser.json())
app.use(cors())

io.on('connection', (socket) => {
  socket.on("joinRoom", ({ userName, socketID, room }) => {
    socket.join(room)
    const user = { userName, socketID, room }
    let currentUser = addUser(user)

    //Announcement for user itself
    socket.emit("message", { message: "Welcome to InstaChat", messageType: "announcement", sendBy: 'system', messageID: Math.random() * 10000 })

    socket.broadcast
      .to(currentUser.room)
      .emit("message", { message: currentUser.userName + " has joined the chat", messageType: "announcement", sendBy: 'system', messageID: Math.random() * 10000 })

    io.to(currentUser.room)
      .emit("roomUsers", { room: currentUser.room, userList: getRoomUsers(currentUser.room) })

    socket.on("messageRequest", message => {
      io.to(currentUser.room).emit("message", { message: message, messageType: "message", sendBy: currentUser.userName, messageID: Math.random() * 10000 })
    })

    socket.on('typing', id => {
      const userTyping = getCurrentUser(id);
      io.to(userTyping.room).emit("typingResponse", userTyping)
    })

    socket.on('leftchat', (id) => {
      const user = removeUser(id);
      if (user) {
        socket.leave(user.room)
        io.to(user.room).emit("message", { message: user.userName + " left the chat", messageType: "announcement", sendBy: 'system', messageID: Math.random() * 10000 })
        io.to(user.room).emit("roomUsers", { room: user.room, userList: getRoomUsers(user.room) })
        socket.disconnect(true);
      }
    });
  });

  socket.on('disconnect',()=>{
    const user = removeUser(socket.id);
      if (user) {
        socket.leave(user.room)
        io.to(user.room).emit("message", { message: user.userName + " left the chat", messageType: "announcement", sendBy: 'system', messageID: Math.random() * 10000 })
        io.to(user.room).emit("roomUsers", { room: user.room, userList: getRoomUsers(user.room) })
        socket.disconnect(true);
      };
  })

});

app.get("/api", (req, res) => {
  res.json({ CreatedBy: "Piyush Kesharwani" })
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});