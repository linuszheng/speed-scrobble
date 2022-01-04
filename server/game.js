const playerModule = require('./player');
const dictModule = require('./dict');
const boardModule = require('./board');

class TurnCounter {
    constructor(){
        this.curTurn = 0;
        this.playerIds = [];
    }

    reset(){
        this.curTurn = 0;
    }

    addPlayerId(id){
        this.playerIds.push(id);
    }

    increment(){
        this.curTurn++;
        if(this.curTurn == this.playerIds.length) this.curTurn = 0;
    }

    setPlayerId(id){
        for(const i in this.playerIds){
            const isTurn = (this.playerIds[i] == id);
            if (isTurn) this.curTurn = i;
        }
    }

    removePlayerId(id){
        let indexRemoved;
        for(const i in this.playerIds){
            const match = (this.playerIds[i] == id);
            if (match) {
                this.playerIds.splice(i, 1);
                indexRemoved = i;
            }
        }
        if(indexRemoved < this.curTurn) {this.curTurn--}
        if(this.curTurn === this.playerIds.length) {this.reset()}
    }

    getCurPlayerId(){
        return this.playerIds[this.curTurn];
    }
}

class Game {
    constructor(roomName, emitters){
        this.roomName = roomName;
        this.emitters = emitters;
        this.dict = new dictModule.Dictionary();
        this.board = new boardModule.Board();
        this.turnCounter = new TurnCounter();
        this.players = {};
    }

    emitBoard(){
        const playersInfo = {};
        for(const key in this.players){
            const player = this.players[key];
            playersInfo[key] = {
                socketId: player.socketId,
                words: player.words,
                wordStatus: player.wordStatus,
                connectionStatus: player.connectionStatus
            }
        }
        this.emitters.emitBoard(this.roomName, {
            board: this.board,
            players: playersInfo,
            playerTurn: this.turnCounter.getCurPlayerId()
        });
    }

    handleConnect(socket){
        this.players[socket.id] = new playerModule.Player(socket.id, ()=>{this.emitBoard()});
        this.turnCounter.addPlayerId(socket.id);
        socket.join(this.roomName);
        this.emitBoard();
    }

    handleDisconnect(socket){
        this.turnCounter.removePlayerId(socket.id);
        this.players[socket.id].connectionStatus = false;
        socket.leave(this.roomName);
        this.emitBoard();
    }

    handleFlip(socket, data){
        const index = data.index;
        if(socket.id == this.turnCounter.getCurPlayerId() && this.board.tilesAll[index].hidden) {
            this.board.flipTile(index);
            this.turnCounter.increment();
            this.emitBoard();
        }
    }

    handleRestart(socket, data){
        this.board = new boardModule.Board();
        let newPlayers = {};
        for(const id in this.players){
            if(this.players[id].connectionStatus) newPlayers[id] = new playerModule.Player(id, ()=>{this.emitBoard()});
        }
        this.players = newPlayers;
        this.turnCounter.reset();
        this.emitBoard();
    }

    async handleSayWord(socket, data){
        const word = data.word;
        const player = this.players[socket.id];
        await this.dict.loadWord(word);
        const valid = (word.length >= 3 && this.dict.isWord(word) && this.removeAndReturnTrueIfExists(word));
        if(valid) {
            player.addWord(word);
            this.turnCounter.setPlayerId(socket.id);
        }
        player.setWordStatus(valid);
        const shortDef = this.dict.shortDef();
        this.emitBoard();
        this.emitters.emitAnnounceWord(this.roomName, {
            socketId: socket.id,
            word: word,
            valid: valid,
            shortDef: shortDef
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