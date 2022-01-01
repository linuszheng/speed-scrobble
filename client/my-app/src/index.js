import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import socketIOClient from 'socket.io-client';

const NEW_MESSAGE_EVENT = "new-message-event";
const SOCKET_SERVER_URL = "http://localhost:3030";
var socketRef;

function startSockets() {
  socketRef = socketIOClient(SOCKET_SERVER_URL);
}
function sendMessage(squares, xIsNext) {
  socketRef.emit(NEW_MESSAGE_EVENT, {
    squares: squares,
    xIsNext: xIsNext
  });
}

startSockets();