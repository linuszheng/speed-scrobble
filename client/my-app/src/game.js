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
        for(const i in this.props.tiles){
            tileComponents.push(this.renderTile(this.props.tiles[i]));
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
            <button id="wordSubmit" onClick={ e => {this.handleSubmit()} }>Submit</button>
        </div>);
    }
}

class Game extends React.Component {

    constructor(props){
        super(props);
        props.listeners.setBoardListener( (data)=>{this.handleBoard(data)} );
        props.listeners.setAnnounceWordListener( (data)=>{this.handleAnnounceWord(data)} );
        this.state = {
            tiles: []
        }
    }

    handleBoard(data){
        this.setState({
            tiles: data.board.tiles
        });
    }

    handleAnnounceWord(data){
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

    render(){
        return (
            <div id="container">
                <div id="titleBar">
                    <div id="idLabel">{this.props.id}</div>
                </div>
                <Board tiles={this.state.tiles} handleTileClick={ (tileId)=>{this.handleTileClick(tileId)} }/>
                <div id="playerBoardContainer">

                </div>
                <WordInput handleWordInputSubmit={ (word)=>{this.handleWordInputSubmit(word)} } />
            </div>
        );
    }
}


export default Game;