const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
import Game from './game.js';

const PORT = 3030;

const MSG_USER_JOIN = "user:join";
const MSG_USER_FLIP = "user:flip";
const MSG_USER_SAY_WORD = "user:say-word";


const MSG_GAME_BOARD = "game:board";
const MSG_GAME_ANNOUNCE_WORD = "game:announce-word";


const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: true,
  origins:["localhost:3000"]
});

app.use(cors());


// ------------------------------------------------------------------------------------

const game = new Game("fun-game-room");

io.on("connection", (socket) => {

  game.connect(socket);

  // socket.on(NEW_MESSAGE_EVENT, (data) => {
  //   io.in(room).emit(NEW_MESSAGE_EVENT, data);
  // });

  // socket.on("disconnect", () => {
  //   socket.leave(room);
  // });
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
