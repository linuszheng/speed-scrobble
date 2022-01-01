export default class Player {
    constructor(name){
        this.name = name;
        this.words = [];
    }

    addWord(w){
        this.words.push(w);
    }

    removeWord(w){
        this.words.splice(this.words.indexOf(w), 1);
    }
    
}