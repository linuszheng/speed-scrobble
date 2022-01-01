import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import socketIOClient from 'socket.io-client';
import Game from './game';

// ------------------------------------------------------------------------------------

const PORT = 3030;
const SOCKET_SERVER_URL = "http://localhost:"+PORT;


const MSG_USER_FLIP = "user:flip";
const MSG_USER_SAY_WORD = "user:say-word";
const MSG_USER_RESTART = "user:restart";


const MSG_GAME_BOARD = "game:board";
const MSG_GAME_ANNOUNCE_WORD = "game:announce-word";

// ------------------------------------------------------------------------------------


const socketRef = socketIOClient(SOCKET_SERVER_URL);
let id;

socketRef.on('connect', () => {
  id = socketRef.id;
  console.log('connected');
  console.log('socket id: ' + id);
  startGame();
});


// ------------------------------------------------------------------------------------


const emitters = {
  emitFlip: (data) => {
    console.log('emitting flip');
    socketRef.emit(MSG_USER_FLIP, data);
  },
  emitSayWord: (data) => {
    console.log('emitting say word');
    socketRef.emit(MSG_USER_SAY_WORD, data);
  },
  emitUserRestart: (data) => {
    console.log('emitting restart');
    socketRef.emit(MSG_USER_RESTART, data);
  }
}

const listeners = {
  setBoardListener: (handleBoard) => {
    socketRef.on(MSG_GAME_BOARD, (data) => {
      console.log('received board');
      console.log(data);
      handleBoard(data);
    });
  },
  setAnnounceWordListener: (handleAnnounceWord) => {
    socketRef.on(MSG_GAME_ANNOUNCE_WORD, (data) => {
      console.log('received announce word');
      console.log(data);
      handleAnnounceWord(data);
    });
  }
}

// ------------------------------------------------------------------------------------


function startGame(){
  ReactDOM.render(<Game id={id} emitters={emitters} listeners={listeners}/>, document.getElementById('root'));
}