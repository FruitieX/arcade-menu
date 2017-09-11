import React from 'react';
import ReactDOM from 'react-dom';

//import Card, { CardContent, CardActions, CardMedia } from 'material-ui/Card';

import { blueGrey } from 'material-ui/colors';
import Velocity from 'velocity-animate';

import styled from 'styled-components';

import Game from '../components/Game';

const Container = styled.div`
  background-color: ${blueGrey[50]};
  width: 100vw;
`;

const GameSelect = styled.div`
  padding-top: 100vh;
  padding-bottom: 100vh;
  background-color: ${blueGrey[50]};
  display: flex;
  align-items: center;
  flex-wrap: wrap;
`;

const gamesPerRow = 4;
export default class Home extends React.PureComponent {
  gameRefs = [];

  state = {
    selectedGame: 0,
    numGames: 14,
  };

  scrollToGame = index => {
    const node = ReactDOM.findDOMNode(this.gameRefs[index]);
    const offset = window.innerHeight / 2 - node.offsetHeight / 2;

    Velocity(node, 'stop');
    Velocity(node, 'scroll', {
      duration: 1000,
      easing: [0.05, 0.2, 0.2, 1],
      offset: -offset,
    });
  };

  handleUp = () => {
    let selectedGame = this.state.selectedGame;
    if (this.state.selectedGame > gamesPerRow - 1) {
      selectedGame = this.state.selectedGame - gamesPerRow;
    } else {
      // on top-most row
      selectedGame = Math.min(
        this.state.numGames - 1,
        this.state.numGames - (gamesPerRow - 1) + this.state.selectedGame,
      );
    }

    this.setState({ selectedGame });
    this.scrollToGame(selectedGame);
  };
  handleDown = () => {
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
    this.props.onSelectGame(this.props.games[this.state.selectedGame]);
  };

  componentDidMount = () => {
    this.props.input.on('up', this.handleUp);
    this.props.input.on('down', this.handleDown);
    this.props.input.on('left', this.handleLeft);
    this.props.input.on('right', this.handleRight);
    this.props.input.on('select', this.handleSelect);

    this.scrollToGame(this.state.selectedGame);
    //window.onwheel = () => false;
  };

  componentWillUnmount = () => {
    this.props.input.off('up', this.handleUp);
    this.props.input.off('down', this.handleDown);
    this.props.input.off('left', this.handleLeft);
    this.props.input.off('right', this.handleRight);
    this.props.input.off('select', this.handleSelect);
  };

  renderGames = () =>
    this.props.games.map((game, index) => (
      <Game
        ref={ref => (this.gameRefs[index] = ref)}
        key={index}
        selected={this.state.selectedGame === index}
        image={game.image}
        title={game.title}
      />
    ));

  render = () => (
    <Container>
      <GameSelect>{this.renderGames()}</GameSelect>
    </Container>
  );
}
