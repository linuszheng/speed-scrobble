import Player from './player.js';
import Board from './board.js';
import Dictionary from './dict.js';

class Game {
    constructor(roomName){
        this.roomName = roomName;
        const dict = new Dictionary();
        const board = new Board();
        let players = [];
    }

    connect(socket){
        players.push(new Player(socket.id));
        socket.join(this.roomName);
        console.log('player ' + socket.id + ' connected');
    }
}