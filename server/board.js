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
        this.freq = {
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
        this.tiles = [];
        this.curShownLetters = [];

        let id=0;
        for(const [letter, n] of Object.entries(freq)){
            for(let i=0; i<n; i++){
                this.tiles.push(new Tile(id, letter));
                id++;
            }
        }

        console.log(this.tiles);
    }

    flipTile(i) {
        this.tiles[i].hidden = false;
        this.curShownLetters.push(this.tiles[i].content);
    }

    

    removeTile(letter){
        for(const tile of tiles){
            if(tile.content === letter && !tile.hidden){
                this.tiles.splice(i, 1);
                break;
            }
        }
    }
    
}

module.exports = {
    Board: Board
}