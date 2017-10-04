import React from 'react';
//import 'react-virtualized/styles.css';

import Grid from 'react-virtualized/dist/commonjs/Grid';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import WindowScroller from 'react-virtualized/dist/commonjs/WindowScroller';
import ReactAnimationFrame from 'react-animation-frame';

import input from '../utils/input';
import Game from '../components/Game';

import { getGames } from '../utils/library';

const gamesPerRow = 4;
export class GameList extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      games: [],
      selectedGame: 0,
      numGames: 0,
    };
  }

  componentDidMount = async () => {
    input.on('up', this.handleUp);
    input.on('down', this.handleDown);
    input.on('left', this.handleLeft);
    input.on('right', this.handleRight);
    input.on('select', this.handleSelect);

    this.scrollToGame(this.state.selectedGame);
    //window.onwheel = () => false;

    const games = await getGames();
    this.setState({ games, numGames: games.length });
  };

  componentWillUnmount = () => {
    input.off('up', this.handleUp);
    input.off('down', this.handleDown);
    input.off('left', this.handleLeft);
    input.off('right', this.handleRight);
    input.off('select', this.handleSelect);
  };

  onAnimationFrame = (time, oldTime) => {
    const dt = time - oldTime;

    let wishOffset =
      Math.floor(this.state.selectedGame / gamesPerRow) *
      (window.innerWidth / 5);

    //wishOffset -= window.innerHeight / 2;
    wishOffset += window.innerWidth / 5 / 2;

    //wishOffset += window.innerHeight / 2;

    const weight = Math.pow(0.99, dt);
    const offset = weight * window.pageYOffset + (1 - weight) * wishOffset;

    window.scroll(0, offset);
  };

  scrollToGame = index => {
    /*
    console.log(this.gameRefs);
    console.log(this.state.selectedGame);
    console.log(this.grid);
    */
    /*
    const node = ReactDOM.findDOMNode(this.gameRefs[index]);
    if (!node) return;
    console.log('there');
    const offset = window.innerHeight / 2 - node.offsetHeight / 2;

    Velocity(node, 'stop');
    Velocity(node, 'scroll', {
      duration: 1000,
      easing: [0.05, 0.2, 0.2, 1],
      offset: -offset,
      container: ReactDOM.findDOMNode(this.grid),
    });
    */
  };

  handleUp = () => {
    let selectedGame = this.state.selectedGame;
    if (this.state.selectedGame > gamesPerRow - 1) {
      selectedGame = this.state.selectedGame - gamesPerRow;
    } else {
      // on top-most row
      selectedGame = Math.min(
        this.state.numGames - 1,
        this.state.numGames - this.state.numGames % 4 + this.state.selectedGame,
      );
    }

    this.setState({ selectedGame });
    this.scrollToGame(selectedGame);
  };
  handleDown = () => {
    let selectedGame = this.state.selectedGame;

    const numRows = Math.ceil(this.state.numGames / gamesPerRow);
    const curRow = Math.floor(this.state.selectedGame / gamesPerRow);

    if (curRow < numRows) {
      selectedGame = Math.min(
        this.state.numGames - 1,
        this.state.selectedGame + gamesPerRow,
      );
    } else {
      // on bottom row
      selectedGame =
        (this.state.selectedGame + this.state.numGames % 4) %
        this.state.numGames;
    }

    this.setState({ selectedGame });
    this.scrollToGame(selectedGame);
  };
  handleLeft = () => {
    let selectedGame = this.state.selectedGame;

    if (this.state.selectedGame % gamesPerRow === 0) {
      selectedGame = Math.min(
        this.state.numGames - 1,
        this.state.selectedGame + (gamesPerRow - 1),
      );
    } else {
      selectedGame = Math.max(0, this.state.selectedGame - 1);
    }

    this.setState({ selectedGame });
    this.scrollToGame(selectedGame);
  };
  handleRight = () => {
    let selectedGame = this.state.selectedGame;

    if ((this.state.selectedGame + 1) % gamesPerRow === 0) {
      selectedGame = this.state.selectedGame - (gamesPerRow - 1);
    } else if (this.state.selectedGame === this.state.numGames - 1) {
      const gamesOnLastRow = this.state.numGames % gamesPerRow;

      selectedGame = this.state.selectedGame - gamesOnLastRow + 1;
    } else {
      selectedGame = Math.min(
        this.state.numGames - 1,
        this.state.selectedGame + 1,
      );
    }

    this.setState({ selectedGame });
    this.scrollToGame(selectedGame);
  };

  handleSelect = () => {
    this.props.onSelectGame(this.state.games[this.state.selectedGame]);
  };

  renderGame = ({ columnIndex, key, rowIndex, style, isScrolling }) => {
    const index = gamesPerRow * rowIndex + columnIndex;
    const game = this.state.games[index];

    if (!game) return null;

    return (
      <div key={key} style={style}>
        <Game
          selected={this.state.selectedGame === index}
          {...game}
          isScrolling={isScrolling}
          image={`file:///home/rasse/roms/nes/images/${game.filename}.png`}
        />
      </div>
    );
  };

  render = () => (
    <div style={{ flex: '1 1 auto', transform: 'rotateZ(360deg)' }}>
      <WindowScroller>
        {({ height, isScrolling, onChildScroll, scrollTop }) => (
          <AutoSizer disableHeight>
            {({ width }) => (
              <Grid
                style={{ marginTop: '50vh', marginBottom: '50vh' }}
                autoHeight
                width={width}
                height={height}
                cellRenderer={this.renderGame}
                columnCount={gamesPerRow}
                columnWidth={width / gamesPerRow}
                rowCount={Math.ceil(this.state.games.length / gamesPerRow)}
                rowHeight={width / 5}
                overscanRowCount={2}
                selectedGame={this.state.selectedGame}
                scrollTop={scrollTop}
                // isScrolling={isScrolling} // TODO: this optimisation breaks updating active game cursor
                onScroll={onChildScroll}
              />
            )}
          </AutoSizer>
        )}
      </WindowScroller>
    </div>
  );
}

export default ReactAnimationFrame(GameList);
