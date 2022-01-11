class Tile {
    // constructor(id, content){
    //     this.id = id;
    //     this.content = content;
    //     this.x = Math.random()*570;
    //     this.y = Math.random()*570;
    //     this.hidden = true;
    // }

    constructor(id, content, x, y){
        this.id = id;
        this.content = content;
        this.x = x;
        this.y = y;
        this.hidden = true;
    }
}

class PosGenerator {
    constructor(){
        this.pos = [];

        for(let i=0; i<600; i+=30){
            for(let j=0; j<600; j+=30){
                this.pos.push([i, j]);
            }
        }
    }

    getPos(){
        const index = Math.floor(Math.random()*this.pos.length);
        const res = this.pos[index];
        this.pos.splice(index, 1);
        return res;
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

        const posGenerator = new PosGenerator();

        let id=0;
        for(const [letter, n] of Object.entries(freq)){
            for(let i=0; i<n; i++){
                const pos = posGenerator.getPos();
                const tile = new Tile(id, letter, pos[0], pos[1]);
                this.tilesAll.push(tile);
                this.tilesRemaining.push(tile);
                id++;
            }
        }
    }

    flipTile(i) {
        this.tilesAll[i].hidden = false;
        this.curShownLetters.push(this.tilesAll[i].content);
    }

    flipRandomTile(){
        let tilesRemainingHidden = [];
        for(const tile of this.tilesRemaining){
            if(tile.hidden) tilesRemainingHidden.push(tile);
        }
        if(tilesRemainingHidden.length === 0) return false;
        const i = Math.floor(Math.random()*tilesRemainingHidden.length);
        tilesRemainingHidden[i].hidden = false;
        this.curShownLetters.push(tilesRemainingHidden[i].content);
        return true;
    }


    removeTile(letter){
        let tileRemoved;
        for(const i in this.tilesRemaining){
            const tile = this.tilesRemaining[i];
            if(tile.content == letter && !tile.hidden){
                tileRemoved = this.tilesRemaining[i];
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
        return tileRemoved;
    }

    restoreTile(tile){
        this.tilesRemaining.push(tile);
        this.curShownLetters.push(tile.content);
    }
    
}

module.exports = {
    Board: Board
}