class Player {

    constructor(id, emitBoard){
        this.socketId = id;
        this.emitBoard = emitBoard;
        this.words = [];
        this.wordStatus = 'none';
        this.wordStatusTimeout = undefined;
    }

    addWord(w){
        this.words.push(w);
    }

    removeWord(w){
        this.words.splice(this.words.indexOf(w), 1);
    }


    setWordStatus(status){
        if(typeof this.wordStatusTimeout !== 'undefined') clearTimeout(this.wordStatusTimeout);
        this.wordStatus = status ? 'valid' : 'invalid';
        this.wordStatusTimeout = setTimeout(()=>{
            this.wordStatus = 'none';
            this.emitBoard();
        }, 3000);
    }
    
}

module.exports = {
    Player: Player
}