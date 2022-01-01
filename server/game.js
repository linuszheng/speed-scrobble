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
        this.emitters.emitBoard(this.roomName, {
            board: this.board,
            players: this.players
        });
    }

    handleConnect(socket){
        this.players[socket.id] = new playerModule.Player(socket.id);
        socket.join(this.roomName);
        this.emitBoard();
    }

    handleDisconnect(socket){
        socket.leave(this.roomName);
    }

    handleFlip(socket, data){
        const index = data.index;
        this.board.flipTile(index);                  // TODO: handle if tile already flipped, index is valid, make sure it is that user's turn
        this.emitBoard();
    }

    handleSayWord(socket, data){
        const word = data.word;

        const valid = (this.dict.isWord(word) && this.removeAndReturnTrueIfExists(word));
        if(valid) {
            this.players[socket.id].addWord(word);
            this.emitBoard();
        }

        this.emitters.emitAnnounceWord(this.roomName, {
            socketId: socket.id,
            word: word,
            valid: valid
        });
    }

    handleRestart(socket, data){
        this.board = new boardModule.Board();
        let newPlayers = {};
        for(const id in this.players){
            newPlayers[id] = new playerModule.Player(id);
        }
        this.players = newPlayers;
        this.emitBoard();
    }

    worksWithPlayerWord(x, w){
        let dif = this.difIfSupersetElseFalse(Array.from(x), Array.from(w));
        if(dif === false) return false;
        dif = this.difIfSupersetElseFalse(board.curShownLetters, dif);
        if(dif === false) return false;
        for(const letter of dif){
            this.board.removeTile(letter);
        }
        return true;
    }

    removeAndReturnTrueIfExists(x){
        for(const player of this.players){
            for(const i in player.words){
                const w = player.words[i];
                if(this.worksWithPlayerWord(x, w)){
                    player.words.splice(i, 1);
                    return true;
                }
            }
        }
        return false;
    }

    difIfSupersetElseFalse(){

    }


}

module.exports = {
    Game: Game
}