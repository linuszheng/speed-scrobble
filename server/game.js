const playerModule = require('./player');
const dictModule = require('./dict');
const boardModule = require('./board');

class Game {
    constructor(roomName){
        this.roomName = roomName;
        const dict = new dictModule.Dictionary();
        const board = new boardModule.Board();
        this.players = [];
    }

    connect(socket){
        this.players.push(new playerModule.Player(socket.id));
        socket.join(this.roomName);
        console.log('player ' + socket.id + ' connected');
    }
}

module.exports = {
    Game: Game
}