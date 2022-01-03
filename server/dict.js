const https = require('https');
const API_KEY = process.env.DICT_KEY;             // set this to merriam webster api key; limit = 1000 req per day

class Dictionary {

  constructor(){
    this.curDef = [];
  }

  async loadWord(word){
    const url = 'https://www.dictionaryapi.com/api/v3/references/collegiate/json/'+word+'?key='+API_KEY;
    console.log(url);
    return new Promise(resolve => {
      const req = https.request(url, (res) => {
        let text = '';
        res.on('data', (data)=>{
          text += data;
        });
        res.on('end', ()=>{
          this.curDef = JSON.parse(text);
          resolve(true);
        });
      });
      req.on('error', (error)=>console.log(error.message));
      req.end();
    });
  }

  isWord(){
    return (this.curDef.length !== 0) && (typeof this.curDef[0]['shortdef'] !== 'undefined');
  }

  shortDef(){
    if(this.isWord()) return (this.curDef[0]['shortdef']);
    else return [];
  }

}


module.exports = {
  Dictionary: Dictionary
}