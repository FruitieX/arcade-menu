import React from 'react';
import styled from 'styled-components';

import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import List from 'react-virtualized/dist/commonjs/List';

import { blue, grey } from 'material-ui/colors';

import input from '../utils/input';

const Container = styled.div`
  position: fixed;
  top: 10vh;
  left: 25vw;
  background-color: ${grey[100]};
  box-shadow: 0 0.5vw 1vw rgba(0, 0, 0, 0.16), 0 0.5vw 1vw rgba(0, 0, 0, 0.23);
  border-radius: 0.5vw;
  width: 50vw;
  height: 80vh;
  margin: 1vw;
  opacity: ${props => (props.active ? 1 : 0)};
  transition: opacity 0.5s;
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

export default class FastScroll extends React.Component {
  state = {
    active: false,
    lastPress: new Date().getTime(),
  };

  deactivationTimeout = null;

  componentDidMount = () => {
    input.on('up', this.handleKeypress);
    input.on('down', this.handleKeypress);
  };
  componentWillUnmount = () => {
    input.off('up', this.handleKeypress);
    input.off('down', this.handleKeypress);

    clearTimeout(this.deactivationTimeout);
  };

  deactivate = () => this.setState({ active: false });

  handleKeypress = () => {
    const currentTime = new Date().getTime();

    if (this.state.lastPress + 100 > currentTime) {
      clearTimeout(this.deactivationTimeout);
      this.deactivationTimeout = setTimeout(this.deactivate, 500);

      if (!this.state.active) {
        this.setState({ active: true });
      }
    }

    this.setState({ lastPress: currentTime });
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
    <Container active={this.state.active}>
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
  );
}
