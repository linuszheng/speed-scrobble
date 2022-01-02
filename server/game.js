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

    handleRestart(socket, data){
        this.board = new boardModule.Board();
        let newPlayers = {};
        for(const id in this.players){
            newPlayers[id] = new playerModule.Player(id);
        }
        this.players = newPlayers;
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

    removeAndReturnTrueIfExists(x){
        if(this.worksWithBoard(x)) return true;
        for(const [id, player] of Object.entries(this.players)){
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

    worksWithPlayerWord(x, w){
        console.log(w);
        const dif1 = this.difIfSupersetElseFalse(Array.from(x), Array.from(w));
        if(dif1 === false || dif1.length == 0) return false;
        const dif2 = this.difIfSupersetElseFalse(this.board.curShownLetters, dif1);
        if(dif2 === false) return false;
        for(const letter of dif1){
            this.board.removeTile(letter);
        }
        return true;
    }

    worksWithBoard(x){
        let dif = this.difIfSupersetElseFalse(this.board.curShownLetters, Array.from(x));
        if(dif === false) return false;
        for(const letter of Array.from(x)){
            this.board.removeTile(letter);
        }
        return true;
    }

    difIfSupersetElseFalse(a, b){
        a.sort();
        b.sort();
        let ai = 0;
        let bi = 0;
        let dif = [];
        while(ai < a.length){
            if(a[ai] == b[bi]) {
                bi++;
            } else {
                dif.push(a[ai]);
            }
            ai++;
        }
        if(bi == b.length) return dif;
        else return false;
    }


}

module.exports = {
    Game: Game
}