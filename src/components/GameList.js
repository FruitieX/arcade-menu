import React from 'react';
import ReactDOM from 'react-dom';
//import 'react-virtualized/styles.css';

import Grid from 'react-virtualized/dist/commonjs/Grid';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import WindowScroller from 'react-virtualized/dist/commonjs/WindowScroller';
import ReactAnimationFrame from 'react-animation-frame';

import input from '../utils/input';
import Game from '../components/Game';
import FastScroll from '../components/FastScroll';

import { getGames } from '../utils/library';

/**
 * Calculates the number of cells to overscan before and after a specified range.
 * Overscans in both directions
 */
const OverscanIndicesGetter = ({
  cellCount,
  overscanCellsCount,
  scrollDirection,
  startIndex,
  stopIndex,
}) => ({
  overscanStartIndex: Math.max(0, startIndex - overscanCellsCount),
  overscanStopIndex: Math.min(cellCount - 1, stopIndex + overscanCellsCount),
});

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

  scrollContainerNode = {};
  letterScroll = false;

  componentDidMount = async () => {
    input.on('up', this.handleUp);
    input.on('down', this.handleDown);
    input.on('left', this.handleLeft);
    input.on('right', this.handleRight);
    input.on('select', this.handleSelect);
    input.on('letterscroll', this.handleLetterScroll);

    const games = await getGames();
    this.setState({ games, numGames: games.length });
  };

  componentWillUnmount = () => {
    input.off('up', this.handleUp);
    input.off('down', this.handleDown);
    input.off('left', this.handleLeft);
    input.off('right', this.handleRight);
    input.off('select', this.handleSelect);
    input.off('letterscroll', this.handleLetterScroll);
  };

  scrollToOffset = offset => {
    if (this.scrollContainerNode) {
      // Instantly jump over large distances (larger than window height)
      // if (Math.abs(wishOffset - currentPos) > window.innerHeight) {
      //   offset = wishOffset;
      // }

      this.scrollContainerNode.scroll(0, offset);
    }
  };

  getScrollOffset = gameIndex => {
    let wishOffset =
      Math.floor(gameIndex / gamesPerRow) * (window.innerWidth / 5);

    wishOffset -= window.innerHeight / 2;
    wishOffset += window.innerWidth / 5 / 2;

    return wishOffset;
  };

  onAnimationFrame = (time, oldTime) => {
    const dt = time - oldTime;

    const wishOffset = this.getScrollOffset(this.state.selectedGame);

    const currentPos = this.scrollContainerNode.scrollTop;
    const weight = Math.pow(0.99, dt);
    let offset = weight * currentPos + (1 - weight) * wishOffset;

    this.scrollToOffset(offset);
  };

  selectGame = selectedGame => this.setState({ selectedGame });

  handleLetterScroll = event => {
    this.letterScroll = event.pressed;
  };

  handleUp = event => {
    if (!event.pressed) {
      // Ignore keyup events
      return;
    }
    if (this.letterScroll) {
      // Don't scroll if letter scroll active
      return;
    }

    let selectedGame = this.state.selectedGame;
    if (this.state.selectedGame > gamesPerRow - 1) {
      selectedGame = this.state.selectedGame - gamesPerRow;
    } else {
      // on top-most row
      selectedGame = Math.min(
        this.state.numGames - 1,
        this.state.selectedGame +
          (this.state.numGames -
            (this.state.numGames % gamesPerRow || gamesPerRow)),
      );

      // Instant scroll to new position
      this.scrollToOffset(this.getScrollOffset(selectedGame));
    }

    this.selectGame(selectedGame);
  };
  handleDown = event => {
    if (!event.pressed) {
      // Ignore keyup events
      return;
    }
    if (this.letterScroll) {
      // Don't scroll if letter scroll active
      return;
    }

    let selectedGame = this.state.selectedGame;

    const numRows = Math.ceil(this.state.numGames / gamesPerRow);
    const curRow = Math.floor(this.state.selectedGame / gamesPerRow);

    if (curRow < numRows - 1) {
      selectedGame = Math.min(
        this.state.numGames - 1,
        this.state.selectedGame + gamesPerRow,
      );
    } else {
      // on bottom row
      selectedGame =
        (this.state.selectedGame +
          (this.state.numGames % gamesPerRow || gamesPerRow)) %
        this.state.numGames;

      // Instant scroll to new position
      this.scrollToOffset(this.getScrollOffset(selectedGame));
    }

    this.selectGame(selectedGame);
  };
  handleLeft = event => {
    if (!event.pressed) {
      // Ignore keyup events
      return;
    }

    let selectedGame = this.state.selectedGame;

    if (this.state.selectedGame % gamesPerRow === 0) {
      selectedGame = Math.min(
        this.state.numGames - 1,
        this.state.selectedGame + (gamesPerRow - 1),
      );
    } else {
      selectedGame = Math.max(0, this.state.selectedGame - 1);
    }

    this.selectGame(selectedGame);
  };
  handleRight = event => {
    if (!event.pressed) {
      // Ignore keyup events
      return;
    }

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

    this.selectGame(selectedGame);
  };

  handleSelect = () => {
    this.props.onSelectGame(this.state.games[this.state.selectedGame]);
  };

  renderGame = ({ columnIndex, key, rowIndex, style, isScrolling }) => {
    const index = gamesPerRow * rowIndex + columnIndex;
    const game = this.state.games[index];

    // console.log('renderGame()');

    if (!game) return null;

    return (
      <div key={key} style={style}>
        <Game
          selected={this.state.selectedGame === index}
          {...game}
          // image={`file:///home/rasse/roms/nes/images/${game.filename}.png`}
          image={`/home/rasse/roms/nes/images/${game.filename}.jpg`}
        />
      </div>
    );
  };

  saveScrollContainerNode = ref => {
    this.ref = ref;
    this.scrollContainerNode = ReactDOM.findDOMNode(ref);
  };

  render = () => (
    <div style={{ height: '100vh' }}>
      <AutoSizer>
        {({ width, height }) => (
          <Grid
            ref={this.saveScrollContainerNode}
            // containerStyle={{ paddingTop: '50vh', paddingBottom: '50vh' }}
            width={width}
            height={height}
            cellRenderer={this.renderGame}
            columnCount={gamesPerRow}
            columnWidth={width / gamesPerRow}
            rowCount={Math.ceil(this.state.games.length / gamesPerRow)}
            rowHeight={width / 5}
            overscanRowCount={1}
            selectedGame={this.state.selectedGame}
            // scrollingResetTimeInterval={0}
            // scrollTop={scrollTop}
            isScrolling={false}
            overscanIndicesGetter={OverscanIndicesGetter}
            // isScrolling={isScrolling} // TODO: this optimisation breaks updating active game cursor
            // onScroll={onChildScroll}
          />
        )}
      </AutoSizer>
      {this.state.games[this.state.selectedGame] && (
        <FastScroll
          games={this.state.games}
          selectedGame={this.state.selectedGame}
          selectGame={this.selectGame}
        />
      )}
    </div>
  );
}

export default ReactAnimationFrame(GameList);
