const playerModule = require('./player');
const dictModule = require('./dict');
const boardModule = require('./board');


class Game {
    constructor(roomName, emitters){
        this.roomName = roomName;
        this.emitters = emitters;
        this.dict = new dictModule.Dictionary();
        this.board = new boardModule.Board();
        this.players = {};
    }

    emitBoard(){
        this.emitters.emitBoard({
            board: this.board,
            players: this.players
        });
    }

    handleConnect(socket){
        this.players[socket.id] = new playerModule.Player(socket.id);
        socket.join(this.roomName);
        console.log('player ' + socket.id + ' connected');
        this.emitBoard();
    }

    handleDisconnect(socket){
        socket.leave(this.roomName);
    }

    handleFlip(socket, data){
        this.board.flipTile();
        this.emitBoard();
    }

    handleSayWord(socket, data){
        const word = data.word;
        this.players[socket.id].addWord(word);

        this.emitters.emitAnnounceWord({
            socketId: socket.id,
            word: word
        });
    }


}

module.exports = {
    Game: Game
}