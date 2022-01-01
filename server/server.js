const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
const gameModule = require('./game');

// ------------------------------------------------------------------------------------

const PORT = 3030;

const MSG_USER_FLIP = "user:flip";
const MSG_USER_SAY_WORD = "user:say-word";


const MSG_GAME_BOARD = "game:board";
const MSG_GAME_ANNOUNCE_WORD = "game:announce-word";

// ------------------------------------------------------------------------------------


const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: true,
  origins:["localhost:3000"]
});

app.use(cors());

const emitters = {
  emitBoard: (room, data) => {
    io.in(room).emit(MSG_GAME_BOARD, data);
  },
  emitAnnounceWord: (room, data) => {
    io.in(room).emit(MSG_GAME_ANNOUNCE_WORD, data);
  }
}

const game = new gameModule.Game("fun-game-room", emitters);

// ------------------------------------------------------------------------------------


io.on("connection", (socket) => {

  game.handleConnect(socket);

  socket.on(MSG_USER_FLIP, (data) => {
    game.handleFlip(socket, data);
  });

  socket.on(MSG_USER_SAY_WORD, (data) => {
    game.handleSayWord(socket, data);
  });

  socket.on("disconnect", ()=>{
    game.handleDisconnect(socket);
  });
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
