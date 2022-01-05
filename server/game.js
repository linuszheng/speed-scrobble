const playerModule = require('./player');
const dictModule = require('./dict');
const boardModule = require('./board');

const TURN_TIME = 10000;

class TurnCounter {
    constructor(forceFlip, emitRestartTimer){
        this.curTurn = 0;
        this.playerIds = [];
        this.forceFlip = forceFlip;
        this.emitRestartTimer = emitRestartTimer;
    }

    restartTimer(){
        if(typeof this.forceFlipTimeout !== 'undefined') clearTimeout(this.forceFlipTimeout);
        this.forceFlipTimeout = setTimeout(()=>{
            if(this.playerIds.length > 0) this.forceFlip();
        }, TURN_TIME);
        this.emitRestartTimer();
    }

    addPlayerId(id){
        this.playerIds.push(id);
    }

    increment(){
        this.curTurn++;
        if(this.curTurn >= this.playerIds.length) this.curTurn = 0;
        this.restartTimer();
    }

    setPlayerId(id){
        for(const i in this.playerIds){
            const isTurn = (this.playerIds[i] == id);
            if (isTurn) this.curTurn = i;
        }
        this.restartTimer();
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
        if(this.curTurn === this.playerIds.length) {this.curTurn = 0}
    }

    getCurPlayerId(){
        return this.playerIds[this.curTurn];
    }
}

class Move {
    constructor(boardTiles, id, word){
        this.boardTiles = boardTiles;
        this.id = id;
        this.word = word;
    }
}

class Game {
    constructor(roomName, emitters){
        this.roomName = roomName;
        this.emitters = emitters;
        this.dict = new dictModule.Dictionary();
        this.board = new boardModule.Board();
        this.turnCounter = new TurnCounter(
            ()=>{this.flipRandom()},
            ()=>{this.emitters.emitRestartTimer(this.roomName, {startTime: TURN_TIME})
        });
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
                challengeStatus: player.challengeStatus,
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
            this.flip(index);
        }
    }

    handleRestart(socket, data){
        this.board = new boardModule.Board();
        let newPlayers = {};
        for(const id in this.players){
            if(this.players[id].connectionStatus) newPlayers[id] = new playerModule.Player(id, ()=>{this.emitBoard()});
        }
        this.players = newPlayers;
        this.turnCounter.curTurn = 0;
        this.clearChallengeStatuses('none');
        this.emitBoard();
    }

    handleChallenge(socket, data){
        const player = this.players[socket.id];
        if(player.challengeStatus === 'canChallenge') {
            player.challengeStatus = 'challenged';
            this.emitBoard();
        }
        else if(player.challengeStatus === 'canDiscard') {
            this.discardLastMove(player);
            this.clearChallengeStatuses('discarded');
            this.emitBoard();
        }
    }

    async handleSayWord(socket, data){
        const word = data.word.toLowerCase();
        const player = this.players[socket.id];
        await this.dict.loadWord(word);
        let valid = (word.length >= 3 && this.dict.isWord(word));
        if(valid){
            const res = this.removeAndReturnMoveIfExists(word);
            if(res === false){
                valid = false;
            } else {
                this.prevMove = res;
                player.addWord(word);
                this.turnCounter.setPlayerId(socket.id);
                this.setChallengeStatuses(socket.id);
            }
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

    discardLastMove(player){
        player.words.pop();     // warning: depends on order of players words in list
        for(const tile of this.prevMove.boardTiles){
            this.board.restoreTile(tile);
        }
        if(this.prevMove.id !== '') this.players[this.prevMove.id].addWord(this.prevMove.word);
        this.prevMove = null;
    }

    clearChallengeStatuses(newStatus){
        for(const id in this.players){
            this.players[id].challengeStatus = newStatus;
        }
    }

    setChallengeStatuses(targetId){
        for(const id in this.players){
            if(id === targetId) this.players[id].challengeStatus = 'canDiscard';
            else this.players[id].challengeStatus = 'canChallenge';
        }
    }

    flip(index){
        this.board.flipTile(index);
        this.turnCounter.increment();
        this.emitBoard();
    }

    flipRandom(){
        const didFlip = this.board.flipRandomTile();
        if(didFlip) {
            this.turnCounter.increment();
            this.emitBoard();
        }
    }

    removeAndReturnMoveIfExists(x){
        const res = this.worksWithBoard(x);
        if(res !== false) return new Move(res, '', '');
        for(const [id, player] of Object.entries(this.players)){
            for(const i in player.words){
                const w = player.words[i];
                const res = this.removeIfWorksWithPlayerWord(x, w);
                if(res !== false){
                    player.words.splice(i, 1);
                    return new Move(res, player.socketId, w);
                }
            }
        }
        return false;
    }

    removeIfWorksWithPlayerWord(x, w){
        console.log(w);
        const dif1 = this.difIfSupersetElseFalse(Array.from(x), Array.from(w));
        if(dif1 === false || dif1.length == 0) return false;
        const dif2 = this.difIfSupersetElseFalse(this.board.curShownLetters, dif1);
        if(dif2 === false) return false;
        let tiles = [];
        for(const letter of dif1){
            tiles.push(this.board.removeTile(letter));
        }
        return tiles;
    }

    worksWithBoard(x){
        let dif = this.difIfSupersetElseFalse(this.board.curShownLetters, Array.from(x));
        if(dif === false) return false;
        let tiles = [];
        for(const letter of Array.from(x)){
            tiles.push(this.board.removeTile(letter));
        }
        return tiles;
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