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
        console.log('player ' + socket.id + ' connected');
        this.players[socket.id] = new playerModule.Player(socket.id);
        socket.join(this.roomName);
        this.emitBoard();
    }

    handleDisconnect(socket){
        console.log('player ' + socket.id + 'disconnected');
        socket.leave(this.roomName);
    }

    handleFlip(socket, data){
        console.log('letter flipped');
        const index = data.index;
        this.board.flipTile(index);                  // TODO: handle if tile already flipped, index is valid, make sure it is that user's turn
        this.emitBoard();
    }

    handleSayWord(socket, data){
        console.log('word spoken');
        const word = data.word;

        const valid = this.dict.isWord(word);
        if(valid) {
            this.players[socket.id].addWord(word);
            this.emitBoard();
        }

        this.emitters.emitAnnounceWord({
            socketId: socket.id,
            word: word,
            valid: valid
        });
    }

    handleRestart(socket, data){
        console.log('game restarted');
        this.emitBoard();
    }


}

module.exports = {
    Game: Game
}