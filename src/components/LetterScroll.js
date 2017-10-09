import React from 'react';
import styled from 'styled-components';

import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import List from 'react-virtualized/dist/commonjs/List';

import { blue, grey } from 'material-ui/colors';

import { createSelector } from 'reselect';

import input from '../utils/input';

const AlphabeticContainer = styled.div`
  position: fixed;
  top: 10vh;
  left: 5vw;
  background-color: ${grey[100]};
  box-shadow: 0 0.5vw 1vw rgba(0, 0, 0, 0.16), 0 0.5vw 1vw rgba(0, 0, 0, 0.23);
  border-radius: 0.5vw;
  width: 10vw;
  height: 80vh;
  margin: 1vw;
  opacity: ${props => (props.active ? 1 : 0)};
  transition: opacity 0.5s;
`;

const Letter = styled.div`
  font-size: 3vw;
  height: 5vw;
  line-height: 5vw;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;

  color: ${props => (props.selected ? blue[500] : '#000')};
`;

// JavaScript sucks
const mod = (n, m) => (n % m + m) % m;

const specialChars = /[^a-z]/gi;

// TODO: don't use filename
const firstLettersSelector = createSelector(
  props => props.games,
  games =>
    games
      // Get the first letter
      .map(game => game.filename[0])
      // Change it to upper case
      .map(letter => letter.toUpperCase())
      // Any characters outside of [a-z] are replaced with #
      .map(letter => letter.replace(specialChars, '#'))
      // Filter by unique elements
      .filter((letter, index, arr) => arr.indexOf(letter) === index),
);

export default class LetterScroll extends React.PureComponent {
  state = {
    active: false,
    lastPress: new Date().getTime(),
  };

  componentDidMount = () => {
    input.on('up', this.handleKeypress);
    input.on('down', this.handleKeypress);
    input.on('letterscroll', this.handleKeypress);
  };
  componentWillUnmount = () => {
    input.off('up', this.handleKeypress);
    input.off('down', this.handleKeypress);
    input.off('letterscroll', this.handleKeypress);
  };

  getFirstLetter = game => game.filename[0].toUpperCase();

  nextLetter = direction => {
    const offset = direction === 'down' ? 1 : -1;
    const letters = firstLettersSelector(this.props);

    return letters[mod(this.getActiveIndex() + offset, letters.length)];
  };

  nextGameIndex = direction => {
    const letter = this.nextLetter(direction);

    let iterator = game => this.getFirstLetter(game) === letter;
    if (letter === '#') {
      // Special characters
      iterator = game => this.getFirstLetter(game).match(specialChars);
    }

    const firstIndex = this.props.games.findIndex(iterator);

    if (firstIndex === -1) {
      return -1;
    }

    const lastIndex =
      this.props.games.length -
      [...this.props.games].reverse().findIndex(iterator);

    const index = Math.round((lastIndex + firstIndex) / 2);

    return index;
  };

  handleKeypress = event => {
    if (event.button === 'letterscroll') {
      return this.setState({ active: event.pressed });
    }

    if (this.state.active && event.pressed) {
      const nextIndex = this.nextGameIndex(event.button);

      if (nextIndex !== -1) {
        this.props.selectGame(nextIndex);
      }
    }
  };

  getActiveIndex = () => {
    const game = this.props.games[this.props.selectedGame];

    const firstLetter = this.getFirstLetter(game);

    if (firstLetter.match(specialChars)) {
      return 0;
    } else {
      return firstLettersSelector(this.props).findIndex(
        letter => letter === firstLetter,
      );
    }
  };

  isLetterSelected = index => this.getActiveIndex() === index;

  rowRenderer = ({
    key, // Unique key within array of rows
    index, // Index of row within collection
    isScrolling, // The List is currently being scrolled
    isVisible, // This row is visible within the List (eg it is not an overscanned row)
    style, // Style object to be applied to row (to position it)
  }) => (
    <Letter key={key} style={style} selected={this.isLetterSelected(index)}>
      {firstLettersSelector(this.props)[index]}
    </Letter>
  );

  saveRef = ref => (this.ref = ref);

  render = () => (
    <AlphabeticContainer active={this.props.active}>
      <AutoSizer>
        {({ width, height }) => (
          <List
            ref={this.saveRef}
            width={width}
            height={height}
            rowCount={firstLettersSelector(this.props).length}
            rowHeight={window.innerWidth * 0.05}
            rowRenderer={this.rowRenderer}
            overscanRowCount={1}
            selectedGame={this.props.selectedGame}
            isScrolling={false}
            // scrollingResetTimeInterval={0}
            scrollToIndex={this.getActiveIndex()}
            scrollToAlignment="center"
          />
        )}
      </AutoSizer>
    </AlphabeticContainer>
  );
}
