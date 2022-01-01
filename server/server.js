const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");

const PORT = 3030;
const MSG_USER_JOIN = "user:join";

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: true,
  origins:["localhost:3000"]
});

app.use(cors());

const room = "game";
const players = [];

io.on("connection", (socket) => {

  players.push(socket.id);
  socket.join(room);

  socket.on(NEW_MESSAGE_EVENT, (data) => {
    io.in(room).emit(NEW_MESSAGE_EVENT, data);
  });

  socket.on(MSG_USER_JOIN);

  socket.on("disconnect", () => {
    socket.leave(room);
  });
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
