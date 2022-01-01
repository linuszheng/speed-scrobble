class Tile {
    constructor(id, content){
        this.id = id;
        this.content = content;
        this.x = Math.random()*400;
        this.y = Math.random()*400;
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
        this.tiles = [];

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
        this.curTileIndex++;
    }
    
}

module.exports = {
    Board: Board
}