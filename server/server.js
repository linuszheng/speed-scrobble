const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require('path');
const socketIO = require("socket.io");
const gameModule = require('./game');

// ------------------------------------------------------------------------------------

const BACKEND_SERVER_PORT = 3030;
const SITE_SERVER_PORT = 9000;
const SINGLE_SERVER_PORT = 3030;
const PATH_TO_SITE = '/Users/linuszheng/Desktop/Code/projects/speed-scrobble/client/my-app';

// ------------------------------------------------------------------------------------


const MSG_USER_FLIP = "user:flip";
const MSG_USER_SAY_WORD = "user:say-word";
const MSG_USER_RESTART = "user:restart";
const MSG_USER_CHALLENGE = "user:challenge";

const MSG_GAME_BOARD = "game:board";
const MSG_GAME_ANNOUNCE_WORD = "game:announce-word";
const MSG_GAME_RESTART_TIMER = "game:restart-timer";


// ------------------------------------------------------------------------------------
// Serving on two different ports

// const siteApp = express();
// siteApp.use(cors());
// siteApp.use(express.static(path.join(PATH_TO_SITE, 'build')));

// siteApp.get('/', (req, res) => {
//   res.sendFile(path.join(PATH_TO_SITE, 'build', 'index.html'));
// });

// const siteServer = http.createServer(siteApp);
// siteServer.listen(SITE_SERVER_PORT, () => {
//   console.log(`web server listening on *:${SITE_SERVER_PORT}`)
// });

// // ----------------------------------------

// const backendApp = express();

// const backendServer = http.createServer(backendApp);
// backendServer.listen(BACKEND_SERVER_PORT, () => {
//   console.log(`backend server listening on *:${BACKEND_SERVER_PORT}`);
// });

// // ----------------------------------------

// const io = socketIO(backendServer, {
//   cors: true,
//   pingTimeout: 5000,
//   pingInterval: 1000
// });

// ------------------------------------------------------------------------------------
// // Serving on single port (can use with ngrok or localtunnel)

const app = express();
app.use(cors());
app.use(express.static(path.join(PATH_TO_SITE, 'build')));

app.get('/', (req, res) => {
  res.sendFile(path.join(PATH_TO_SITE, 'build', 'index.html'));
});

const server = http.createServer(app);
server.listen(SINGLE_SERVER_PORT, () => {
  console.log(`server listening on *:${SINGLE_SERVER_PORT}`)
});

const io = socketIO(server, {
  cors: true,
  pingTimeout: 5000,
  pingInterval: 1000
});

// ------------------------------------------------------------------------------------
// Serving only the backend

// const app = express();

// const server = http.createServer(app);
// server.listen(SINGLE_SERVER_PORT, () => {
//   console.log(`server listening on *:${SINGLE_SERVER_PORT}`)
// });

// const io = socketIO(server, {
//   cors: true,
//   pingTimeout: 5000,
//   pingInterval: 1000
// });


// ------------------------------------------------------------------------------------


io.on("connection", (socket) => {

  console.log('player ' + socket.id + ' connected');
  game.handleConnect(socket);

  socket.on(MSG_USER_FLIP, (data) => {
    console.log('letter flipped');
    game.handleFlip(socket, data);
  });

  socket.on(MSG_USER_SAY_WORD, (data) => {
    console.log('word spoken');
    game.handleSayWord(socket, data);
  });

  socket.on(MSG_USER_RESTART, (data) => {
    console.log('game restarted');
    game.handleRestart(socket, data);
  });

  socket.on(MSG_USER_CHALLENGE, (data) => {
    console.log('challenge action taken');
    game.handleChallenge(socket, data);
  });

  socket.once("disconnect", ()=>{
    console.log('player ' + socket.id + ' disconnected');
    game.handleDisconnect(socket);
  });
});

// ------------------------------------------------------------------------------------


const emitters = {
  emitBoard: (room, data) => {
    console.log('emitting board');
    io.in(room).emit(MSG_GAME_BOARD, data);
  },
  emitAnnounceWord: (room, data) => {
    console.log('emitting word');
    io.in(room).emit(MSG_GAME_ANNOUNCE_WORD, data);
  },
  emitRestartTimer: (room, data) => {
    console.log('emitting restart timer');
    io.in(room).emit(MSG_GAME_RESTART_TIMER, data);
  },
}

const game = new gameModule.Game("fun-game-room", emitters);

// ------------------------------------------------------------------------------------

// programatically serve through localtunnel
// tried ngrok (which is faster) and it does NOT work

const localtunnel = require('localtunnel');
(async () => {
  const tunnel = await localtunnel({
    port: 3030,
    subdomain: 'speed-scrobble'
  });
  console.log('establishing localtunnel connection');
  console.log(tunnel.url);

  tunnel.on('close', () => {
    // tunnels are closed
  });
})();


// ------------------------------------------------------------------------------------
