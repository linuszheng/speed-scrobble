import React from 'react';


class Board extends React.Component {

    renderTile(tileInfo){
        const style = {
            top: (tileInfo.y)+'px',
            left: (tileInfo.x)+'px'
        }
        let className = "tile letter";
        if(!tileInfo.hidden) {
            className += " shown";
            const h = (tileInfo.y + tileInfo.x)/570/2*240;
            style.backgroundColor = 'hsl('+h.toString()+',100%,80%)';
        }
        return (
            <div 
                key={tileInfo.id}
                className={className}
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
        if(e.key === 'Enter'){
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
        let className = 'playerBoard';
        let text = player.socketId;
        if (this.props.meStatus) {className += ' myBoard'; text += ' (YOU)'}
        if (this.props.turnStatus) {className += ' curTurn'; text += ' <<--------------------'}
        if (!player.connectionStatus) {className += ' disconnected'}
        if (player.wordStatus === 'valid') className += ' gaveValidWord';
        else if (player.wordStatus === 'invalid') className += ' gaveInvalidWord';
        return (
            <div className={className}>
                <div className="playerBoardLabel">{text}</div>
                {wordComponents}
            </div>
        );
    }

}

function DefBoard(props){
    if(props.word === '') return (<div id="defBoard"></div>);
    const defComponents = [];
    for(const i in props.shortDef){
        defComponents.push(<li key={i}>{props.shortDef[i]}</li>);
    }
    let playersChallenging = [];
    let actionButton;
    for(const i in props.players){
        const player = props.players[i];
        if(player.challengeStatus === 'challenged') playersChallenging.push(i);
    }
    const selfChallengeStatus = props.players[props.selfId].challengeStatus;
    if(selfChallengeStatus === 'canChallenge'){
        actionButton = (<div id='canChallenge' onClick={props.handleChallengeClicked}>Challenge</div>);
    } else if(selfChallengeStatus === 'challenged'){
        actionButton = (<div id='challenged'>Challenged</div>);
    } else if(selfChallengeStatus === 'canDiscard'){
        actionButton = (<div id='canDiscard' onClick={props.handleChallengeClicked}>Discard</div>);
    } else if(selfChallengeStatus === 'discarded'){
        actionButton = (<div id='discarded'>Discarded</div>);
    }
    let playersChallengingComponent = null;
    if(playersChallenging.length > 0){
        const playersChallengingText = 'Players challenging: ' + playersChallenging.join(', ');
        playersChallengingComponent = (<p id='playersChallengingText'>{playersChallengingText}</p>);
    }
    return(<div id="defBoard">
        <div id='headword'>{props.word}</div>
        <ul id="shortDefList">{defComponents}</ul>
        {actionButton}
        {playersChallengingComponent}
    </div>);
}

class Game extends React.Component {

    constructor(props){
        super(props);
        props.listeners.setBoardListener( (data)=>{this.handleBoard(data)} );
        props.listeners.setAnnounceWordListener( (data)=>{this.handleAnnounceWord(data)} );
        props.listeners.setRestartTimerListener( (data)=>{this.handleRestartTimer(data)} );
        this.state = {
            tiles: [],
            players: {},
            word: '',
            shortDef: '',
            turnTime: 0,
        }
    }

    handleBoard(data){
        this.setState({
            tiles: data.board.tilesRemaining,
            players: data.players,
            playerTurn: data.playerTurn
        });
    }

    handleAnnounceWord(data){
        this.speakWord(data.word);
        if(data.valid){
            this.setState({
                word: data.word,
                shortDef: data.shortDef
            });
        }
    }

    handleRestartTimer(data){           // this could've been on either client or server but since it's not key to the game (the server has its own timer), i just put it here to lighten the server load
        this.setState({
            turnTime: data.startTime / 1000
        });
        if(typeof this.turnTimerInterval !== 'undefined') clearTimeout(this.turnTimerInterval);
        this.turnTimerInterval = setInterval(()=>{
            const prevTurnTime = this.state.turnTime;
            if(prevTurnTime > 0){
                this.setState({
                    turnTime: prevTurnTime-1
                });
            } else {
                clearTimeout(this.turnTimerInterval);
                this.turnTimerInterval = undefined;
            }
        }, 1000);
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

    handleChallengeClicked(){
        this.props.emitters.emitChallenge({});
    }

    speakWord(text){
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
        synth.speak(utterance);
    }

    render(){
        const playerBoardComponents = [];
        let challengeStatuses = [];
        for(const i in this.state.players){
            const player = this.state.players[i];
            const turnStatus = (player.socketId === this.state.playerTurn);
            const meStatus = (player.socketId === this.props.id);
            playerBoardComponents.push(<PlayerBoard key={player.socketId} player={player} turnStatus={turnStatus} meStatus={meStatus}/>);
            challengeStatuses.push(player.challengeStatus);
        }
        return (
            <div id="container" onClick={ () => { document.getElementById('wordInput').focus(); } }>
                <div id="titleBar">
                    <div id="idLabel">{this.props.id}</div>
                    <div id="turnTime">{this.state.turnTime}</div>
                </div>
                <div id="allBoardContainer">
                    <Board
                        tiles={this.state.tiles}
                        handleTileClick={ (tileId)=>{this.handleTileClick(tileId)} }
                    />
                    <div id="playerBoardContainer">
                        {playerBoardComponents}
                    </div>
                    <DefBoard
                        word={this.state.word}
                        shortDef={this.state.shortDef}
                        players={this.state.players}
                        selfId={this.props.id}
                        handleChallengeClicked={ ()=>{this.handleChallengeClicked()} }
                    />
                </div>
                <WordInput handleWordInputSubmit={ (word)=>{this.handleWordInputSubmit(word)} } />
                <button id="restartButton" onClick={ ()=>{this.props.emitters.emitUserRestart()} }>Restart</button>
            </div>
        );
    }
}


export default Game;