import React from 'react';


class Board extends React.Component {
    constructor(props){
        super(props);
    }

    renderTile(tileInfo){
        const style = {
            top: tileInfo.y+'px',
            left: tileInfo.x+'px'
        }
        return (
            <div 
                key={tileInfo.id}
                className="tile letter"
                style={style} 
                onClick={ ()=>{this.props.handleTileClick(tileInfo.id);} }>
                {tileInfo.hidden ? ' ' : tileInfo.content}
            </div>
        );
    }

    render(){
        let tileComponents = [];
        for(const tileInfo of this.props.tiles){
            tileComponents.push(this.renderTile(tileInfo));
        }
        return (
            <div id="letterBoard">
                {tileComponents}
            </div>
        );
    }
}

class WordInput extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            text: ''
        }
    }

    handleKeyPress(e){
        if(!e) e = window.event;
        if(e.key == 'Enter'){
            this.handleSubmit();
        }
    }

    handleSubmit(){
        this.props.handleWordInputSubmit(this.state.text);
        this.setState({text: ''});
    }

    handleInputChange(e){
        this.setState({text: e.target.value});
    }

    render(){
        return (<div>
            <input type="text" id="wordInput"
                value={this.state.text}
                onKeyPress={ e => {this.handleKeyPress(e)} }
                onChange={ e => {this.handleInputChange(e)} }>
            </input>
            <button id="wordSubmitButton" onClick={ e => {this.handleSubmit()} }>Submit</button>
        </div>);
    }
}

class PlayerBoard extends React.Component {
    constructor(props){
        super(props);
        this.props.player.setHandlePbs( (data) => {this.handlePbs(data)} );
        this.state = {
            turnStatus: '',
            validityStatus: ''
        }
    }

    handlePbs(data){
        this.setState(data);
        console.log(this.state);
    }

    renderWordComponent(word, index){
        const letterComponents = [];
        for(const i in word){
            letterComponents.push(<div key={i} className='tile'>{word[i]}</div>);
        }
        return (<div key={index} className="wordComponent">{letterComponents}</div>);
    }


    render(){
        const player = this.props.player;
        const wordComponents = [];
        for(const i in player.words){
            wordComponents.push(this.renderWordComponent(player.words[i], i));
        }
        let className = 'playerBoard ' + this.state.turnStatus + ' ' + this.state.validityStatus;
        console.log(className);
        return (
            <div className={className}>
                <div className="playerBoardLabel">{player.socketId}</div>
                {wordComponents}
            </div>
        );
    }

}

class Game extends React.Component {

    constructor(props){
        super(props);
        props.listeners.setBoardListener( (data)=>{this.handleBoard(data)} );
        props.listeners.setAnnounceWordListener( (data)=>{this.handleAnnounceWord(data)} );
        props.listeners.setNewPlayerListener( (data)=>{this.handleNewPlayer(data)} );
        this.state = {
            tiles: [],
            players: {}
        }
    }

    handleBoard(data){
        const players = {};
        for(const [id, info] of Object.entries(data.players)){
            const player = {
                ...this.state.players[id],
                socketId: info.socketId,
                words: info.words
            };
            players[id] = player;
        }
        this.setState({
            tiles: data.board.tilesRemaining,
            players: players,
        }, ()=>{
            for(const [id, info] of Object.entries(this.state.players)){
                const turnStatus = (id == data.playerTurn) ? 'curTurn' : '';
                this.state.players[id].handlePbs(turnStatus);
            }
        });
    }

    handleNewPlayer(data){
        const players = {...this.state.players};
        const player = players[data.id];
        player.setHandlePbs = (handlePbs)=>{player.handlePbs = handlePbs};                  // pbs = player board status
        this.setState({ players: players });
    }

    handleAnnounceWord(data){
        this.speakWord(data.word);
        const validityStatus = data.valid ? 'gaveValidWord' : 'gaveInvalidWord';
        this.state.players[data.socketId].handlePbs(validityStatus);
    }

    handleTileClick(tileId){
        this.props.emitters.emitFlip({
            index: tileId
        });
    }

    handleWordInputSubmit(word){
        this.props.emitters.emitSayWord({
            word: word
        });
    }

    speakWord(text){
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
        synth.speak(utterance);
    }

    render(){
        const playerBoardComponents = [];
        for(const i in this.state.players){
            const player = this.state.players[i];
            playerBoardComponents.push(<PlayerBoard key={player.socketId} player={player} />);
        }
        return (
            <div id="container" onClick={ () => { document.getElementById('wordInput').focus(); } }>
                <div id="titleBar">
                    <div id="idLabel">{this.props.id}</div>
                </div>
                <div id="allBoardContainer">
                    <Board tiles={this.state.tiles} handleTileClick={ (tileId)=>{this.handleTileClick(tileId)} }/>
                    <div id="playerBoardContainer">
                        {playerBoardComponents}
                    </div>
                </div>
                <WordInput handleWordInputSubmit={ (word)=>{this.handleWordInputSubmit(word)} } />
                <button id="restartButton" onClick={ ()=>{this.props.emitters.emitUserRestart()} }>Restart</button>
            </div>
        );
    }
}


export default Game;