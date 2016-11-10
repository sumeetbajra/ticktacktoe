import React, { Component } from 'react';
import io from 'socket.io-client';

import './App.css';

class App extends Component {

  constructor(props) {
    super(props);
    const size = 3;
    const socket = io.connect('http://192.168.0.112:3001');

    this.state = {
      socket: socket,
      size: size,
      gameNum: 1,
      marks: ['x', 'o'],
      multiplayerMark: null,
      winner: null,
      finished: false,
      players: {
        x: 'Player 1',
        o: 'Player 2'
      },
      counter: 0,
      tickTackGrid: this.initializeGrid(size),
      winningTrack: {
        x: 0,
        o: 0,
        tie: 0
      },
      roomId: null,
      disabled: false,
      multiplayer: this.getParameterByName('room')
    }
  }

  componentDidMount = () => {
    var that = this;
    this.state.socket.on('marked', (data) => {
      let parsed = data;
      that.mark(parsed.i, parsed.j, false, true);
    });

    if(this.getParameterByName('room')) {
      this.state.socket.emit('joinRoom', this.getParameterByName('room'));
       that.setState({
        roomId: this.getParameterByName('room'),
        multiplayerMark: 'o',
        disabled: true
       });
    }

    this.state.socket.on('roomId', (id) => {
      that.setState({
        roomId: id,
        multiplayerMark: 'x',
        disabled: false
      });
    });

    this.state.socket.on('restartGame', () => {
      that.restartGame(true);
    })
  }

  inviteFriend = () => {
    this.state.socket.emit('createRoom');
  }

  getParameterByName(name) {
    let url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

  initializeGrid(size) {
    let arrayGrid = [];
    for (var i = size - 1; i >= 0; i--) {
      arrayGrid[i] = [];
      for (var j = size - 1; j >= 0; j--) {
        arrayGrid[i][j] = 0;
      }
    }
    return arrayGrid;
  }

  mark = (i, j, e, socket) => {
    let target;
    if(!socket && this.state.disabled && this.state.multiplayer) {
      alert('Not your turn');
      return;
    }

    this.setState({
      disabled: true
    });

    if(socket) {
      target = document.querySelector('[data-row="' + i + '"][data-col="' + j + '"]');
      this.setState({
        disabled: false
      });
    }else {
      target = e.target;
    }
    var that = this;
    if(socket || target.innerHTML === '&nbsp;') {

      target.innerHTML = this.state.marks[this.state.counter];
      target.style.color = 'white';
      let tickTackGrid = this.state.tickTackGrid;
      tickTackGrid[i][j] = this.state.marks[this.state.counter];
      this.setState({
        tickTackGrid: tickTackGrid
      });
      if(!socket) {
        this.state.socket.emit('mark', {data: {i: i, j: j}, room: this.state.roomId});
      }
      
      if(this.win()) {
        setTimeout(function() {
          let winner = that.state.players[that.win()];
          let {winningTrack} = that.state;
          winningTrack[that.win()]++;
          that.resetGame();
          that.setState({
            winner: winner,
            winningTrack: winningTrack,
            finished: true
          });
        }, 300)
      }else if(this.tie()) {
        setTimeout(function() {
          that.resetGame();
          let {winningTrack} = that.state;
          winningTrack['tie']++;
          that.setState({
            winningTrack: winningTrack,
            finished: true
          })
        }, 300)
      }else {
        this.setState({
          counter: +!this.state.counter
        });
      }
    }
  }

  resetGame() {
    const cells = document.getElementsByClassName('cell');
    for (var i = cells.length - 1; i >= 0; i--) {
      cells[i].innerHTML = '&nbsp;';
      cells[i].style.color = '#14bdac';
    }
    this.setState({
      counter: +!((this.state.gameNum + 1) % 2),
      gameNum: this.state.gameNum + 1,
      tickTackGrid: this.initializeGrid(this.state.size),
      disabled: !((this.state.gameNum + 1) % 2 && this.state.multiplayerMark == 'x' || +!((this.state.gameNum + 1) % 2) && this.state.multiplayerMark == 'o')
    });
  }

  win = () => {
    let { tickTackGrid } = this.state;

    for (var i = this.state.tickTackGrid.length - 1; i >= 0; i--) {
      if(tickTackGrid[i][0] && tickTackGrid[i][0] === tickTackGrid[i][1] && 
        tickTackGrid[i][0] === tickTackGrid[i][2]) {
        return tickTackGrid[i][0];
      }
    }

    for (i = tickTackGrid.length - 1; i >= 0; i--) {
      if(tickTackGrid[0][i] && tickTackGrid[0][i] === tickTackGrid[1][i] && 
        tickTackGrid[0][i] === tickTackGrid[2][i]) {
        return tickTackGrid[0][i];
      }
    }

    if(tickTackGrid[0][0] && tickTackGrid[0][0] === tickTackGrid[1][1] && 
      tickTackGrid[0][0] === tickTackGrid[2][2]) {
      return tickTackGrid[0][0];
    }

    if(tickTackGrid[0][2] && tickTackGrid[0][2] === tickTackGrid[1][1] && 
      tickTackGrid[0][2] === tickTackGrid[2][0]) {
      return tickTackGrid[0][2];
    }

    return false;
  }

  tie() {
    let { tickTackGrid } = this.state;

    for (var i = tickTackGrid.length - 1; i >= 0; i--) {
      for (var j = tickTackGrid.length - 1; j >= 0; j--) {
        if(!tickTackGrid[i][j]) {
          return false;
        }
      }
    }
    return !this.win();
  }

  restartGame = (socket) => {
    if(!socket) {
      this.state.socket.emit('restartGame', this.state.roomId);
    }
    console.log(this.state.gameNum);
    this.setState({
      finished: false,
      winner: null,
    })
  }

  render() {
    let activePlayer = this.state.marks[this.state.counter];

    let resultMsg = '';

    if(!this.state.multiplayer) {
      if(this.state.winner) {
        resultMsg = this.state.winner + ' has won';
      }else {
        resultMsg = 'The game has tied';
      }
    }else {
      if((this.state.winner == 'Player 1' && this.state.multiplayerMark == 'x') || 
            (this.state.winner == 'Player 2' && this.state.multiplayerMark == 'o')) {
        resultMsg = 'You have won';
      }else if(!this.state.winner) {
        resultMsg = 'The game has tied';
      }else {
        resultMsg = 'You have lost';
      }
    }

    return (
      <div className="App">    
        <button onClick={this.inviteFriend}>Invite</button> {'https://localhost:3000?room=' + this.state.roomId}
        {!this.state.finished ?
          <div className="App-wrapper">
            <Grid size={this.state.size} mark={this.mark}/>
            {!this.state.multiplayer ? 
              <span>
                <div className={"winning-track" + (activePlayer === 'x' ? ' active' : '')}>Player 1 (X)<br /> {this.state.winningTrack.x}</div>
                <div className="winning-track">Tie<br /> {this.state.winningTrack.tie}</div>
                <div className={"winning-track" + (activePlayer === 'o' ? ' active' : '')}>Player 2 (O)<br /> {this.state.winningTrack.o}</div>
              </span>
              :
              <span>
                <div className={"winning-track" + (!this.state.disabled ? ' active' : '')}>You ({this.state.multiplayerMark})<br /> {this.state.winningTrack[this.state.multiplayerMark]}</div>
                <div className="winning-track">Tie<br /> {this.state.winningTrack.tie}</div>
                <div className={"winning-track" + (this.state.disabled ? ' active' : '')}>Opponent ({this.state.multiplayerMark == 'x' ? 'o' : 'x'})<br /> {this.state.winningTrack[this.state.multiplayerMark == 'x' ? 'o' : 'x']}</div>
              </span>
            }

          </div> 
          :
          <div id="finished-game" onClick={this.restartGame.bind(null, false)}>
            {resultMsg}<br />
            <span>Click to play again</span>
          </div>
        }
      </div>
    );
  }
}

class Grid extends Component {
  renderCells() {
    let cells = [];
    for (var i = 0; i < this.props.size; i++) {
      for (var j = 0; j < this.props.size; j++) {
        cells.push(
          <Cell 
            row={i} 
            col={j} 
            key={i.toString() + j.toString()} 
            mark={this.props.mark.bind(null, i, j)}
          />
        );
      }
    }
    return cells;
  }

  render() {
    return (
      <div className="grid-wrapper">
        {this.renderCells()}
      </div>
    );
  }
}

const Cell = ({row, col, mark}) => (
  <div className="cell" data-row={row} data-col={col} onClick={mark}>
   &nbsp;
  </div>
)

export default App;
