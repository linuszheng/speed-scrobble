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
            <div key={tileInfo.id} className="tile letter" style={style}>{tileInfo.content}</div>
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

class Game extends React.Component {

    constructor(props){
        super(props);
        props.listeners.setBoardListener( (data)=>{this.handleBoard(data)} );
        props.listeners.setAnnounceWordListener(( data)=>{this.handleAnnounceWord(data)} );
        this.state = {
            tiles: []
        }
    }

    handleBoard(data){
        console.log(data);
        this.setState({
            tiles: data.board.tiles
        });
    }

    handleAnnounceWord(data){
        console.log(data);
    }

    render(){
        return (
            <div id="container">
                <div id="titleBar">
                    <div id="idLabel">{this.props.id}</div>
                </div>
                <Board tiles={this.state.tiles}/>
                <div id="playerBoardContainer">

                </div>
            </div>
        );
    }
}


export default Game;