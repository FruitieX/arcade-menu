import React from 'react';
import styled from 'styled-components';

import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import List from 'react-virtualized/dist/commonjs/List';

import { blue, grey } from 'material-ui/colors';

import input from '../utils/input';
import LetterScroll from './LetterScroll';

const RootContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: ${props => (props.active ? 1 : 0)};
  transition: opacity 0.5s;
`;

const Container = styled.div`
  position: fixed;
  top: 10vh;
  left: 25vw;
  background-color: ${grey[100]};
  box-shadow: 0 0.5vw 1vw rgba(0, 0, 0, 0.16), 0 0.5vw 1vw rgba(0, 0, 0, 0.23);
  width: 50vw;
  height: 80vh;
  margin: 1vw;
`;

const Line = styled.div`
  font-size: 3vw;
  height: 5vw;
  line-height: 5vw;

  background-color: ${props => (props.active ? grey[300] : 'transparent')};
`;

const Text = styled.div`
  margin-left: 1vw;
  margin-right: 1vw;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: ${props => (props.active ? blue[500] : '#000')};
`;

// JavaScript sucks
const mod = (n, m) => (n % m + m) % m;

export default class FastScroll extends React.Component {
  state = {
    active: false,
  };

  scrollStart = new Date().getTime();
  scrollDirection = 'down';
  scrollTimeout = null;
  scrollSpeed = 5;
  hideDelay = 300;
  speedUpPerSecond = 5;
  maxSpeed = 30;
  delay = 300;
  letterScroll = false;

  componentDidMount = () => {
    input.on('up', this.handleKeypress);
    input.on('down', this.handleKeypress);
    input.on('letterscroll', this.handleKeypress);
  };
  componentWillUnmount = () => {
    input.off('up', this.handleKeypress);
    input.off('down', this.handleKeypress);
    input.off('letterscroll', this.handleKeypress);

    clearTimeout(this.scrollTimeout);
  };

  doScroll = () => {
    const dt = new Date().getTime() - this.scrollStart;
    const scrollSpeed = Math.round(
      Math.min(
        this.maxSpeed,
        this.scrollSpeed + this.speedUpPerSecond * dt / 1000,
      ),
    );

    if (this.scrollDirection === 'up') {
      const nextGame = mod(
        this.props.selectedGame - scrollSpeed,
        this.props.games.length,
      );
      this.props.selectGame(nextGame);
    } else {
      const nextGame =
        (this.props.selectedGame + scrollSpeed) % this.props.games.length;
      this.props.selectGame(nextGame);
    }
    this.scrollTimeout = setTimeout(this.doScroll, 20);
  };

  deactivate = () => {
    this.setState({ active: false });
  };

  handleKeypress = event => {
    clearTimeout(this.scrollTimeout);

    if (event.button === 'letterscroll') {
      if (event.pressed) {
        this.setState({ active: true });
        this.letterScroll = true;
      } else {
        this.deactivate();
        this.letterScroll = false;
      }
    } else if (!this.letterScroll) {
      if (event.pressed) {
        // Up or down pressed
        this.scrollTimeout = setTimeout(() => {
          this.scrollStart = new Date().getTime();
          this.doScroll();
          this.setState({ active: true });
        }, this.delay);

        this.scrollDirection = event.button;
      } else {
        // Up or down released
        this.deactivate();
        console.log('there');
      }
    }
  };

  rowRenderer = ({
    key, // Unique key within array of rows
    index, // Index of row within collection
    isScrolling, // The List is currently being scrolled
    isVisible, // This row is visible within the List (eg it is not an overscanned row)
    style, // Style object to be applied to row (to position it)
  }) => (
    <Line style={style} key={key} active={index === this.props.selectedGame}>
      <Text active={index === this.props.selectedGame}>
        {this.props.games[index].filename}
      </Text>
    </Line>
  );

  saveRef = ref => (this.ref = ref);

  render = () => (
    <RootContainer active={this.state.active}>
      <LetterScroll
        active={this.state.active}
        games={this.props.games}
        selectedGame={this.props.selectedGame}
        selectGame={this.props.selectGame}
      />
      <Container>
        <AutoSizer>
          {({ width, height }) => (
            <List
              ref={this.saveRef}
              width={width}
              height={height}
              rowCount={this.props.games.length}
              rowHeight={window.innerWidth * 0.05}
              rowRenderer={this.rowRenderer}
              overscanRowCount={2}
              selectedGame={this.props.selectedGame}
              isScrolling={false}
              // scrollingResetTimeInterval={0}
              scrollToIndex={this.props.selectedGame}
              scrollToAlignment="center"
            />
          )}
        </AutoSizer>
      </Container>
    </RootContainer>
  );
}
