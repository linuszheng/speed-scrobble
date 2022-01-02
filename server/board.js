class Tile {
    constructor(id, content){
        this.id = id;
        this.content = content;
        this.x = Math.random()*600;
        this.y = Math.random()*600;
        this.hidden = true;
    }
}

class Board {
    constructor(){
        const freq = {
            'a': 13,
            'b': 3,
            'c': 3,
            'd': 6,
            'e': 18,
            'f': 3,
            'g': 4,
            'h': 3,
            'i': 12,
            'j': 2,
            'k': 2,
            'l': 5,
            'm': 3,
            'n': 8,
            'o': 11,
            'p': 3,
            'q': 2,
            'r': 9,
            's': 6,
            't': 9,
            'u': 6,
            'v': 3,
            'w': 3,
            'x': 2,
            'y': 3,
            'z': 2
        }
        this.tilesAll = [];
        this.tilesRemaining = [];
        this.curShownLetters = [];

        let id=0;
        for(const [letter, n] of Object.entries(freq)){
            for(let i=0; i<n; i++){
                const tile = new Tile(id, letter);
                this.tilesAll.push(tile);
                this.tilesRemaining.push(tile);
                id++;
            }
        }

        console.log(this.tilesAll);
    }

    flipTile(i) {
        this.tilesAll[i].hidden = false;
        this.curShownLetters.push(this.tilesAll[i].content);
    }


    removeTile(letter){
        for(const i in this.tilesRemaining){
            const tile = this.tilesRemaining[i];
            if(tile.content == letter && !tile.hidden){
                this.tilesRemaining.splice(i, 1);
                break;
            }
        }
        for(const i in this.curShownLetters){
            if(this.curShownLetters[i] == letter){
                this.curShownLetters.splice(i, 1);
                break;
            }
        }
    }
    
}

module.exports = {
    Board: Board
}