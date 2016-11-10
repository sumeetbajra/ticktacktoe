import React, { Component } from 'react';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);
    const size = 3;

    this.state = {
      size: size,
      marks: ['x', 'o'],
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
      }
    }
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

  mark = (i, j, e) => {
    var that = this;
    if(e.target.innerHTML === '&nbsp;') {
      e.target.innerHTML = this.state.marks[this.state.counter];
      e.target.style.color = 'white';
      let tickTackGrid = this.state.tickTackGrid;
      tickTackGrid[i][j] = this.state.marks[this.state.counter];
      this.setState({
        tickTackGrid: tickTackGrid
      });
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
          })
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
      counter: 0,
      tickTackGrid: this.initializeGrid(this.state.size)
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

  restartGame = () => {
    this.setState({
      finished: false,
      winner: null
    })
  }

  render() {
    let activePlayer = this.state.marks[this.state.counter];
    return (
      <div className="App">
    
        {!this.state.finished ?
          <div className="App-wrapper">
            <Grid size={this.state.size} mark={this.mark}/>
            <div className={"winning-track" + (activePlayer === 'x' ? ' active' : '')}>Player 1 (X)<br /> {this.state.winningTrack.x}</div>
            <div className="winning-track">Tie<br /> {this.state.winningTrack.tie}</div>
            <div className={"winning-track" + (activePlayer === 'o' ? ' active' : '')}>Player 2 (O)<br /> {this.state.winningTrack.o}</div>
          </div> 
          :
          <div id="finished-game" onClick={this.restartGame}>
            {this.state.winner ? this.state.winner + ' has won' : 'The game has tied'}<br />
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
  <div className="cell" onClick={mark}>
   &nbsp;
  </div>
)

export default App;
