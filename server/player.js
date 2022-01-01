

export default class Player {

    constructor(id){
        this.socketId = id;
        this.words = [];
    }

    addWord(w){
        this.words.push(w);
    }

    removeWord(w){
        this.words.splice(this.words.indexOf(w), 1);
    }
    
}