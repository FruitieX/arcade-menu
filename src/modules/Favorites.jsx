import React from 'react';

import EventEmitter from 'event-emitter';
import Mousetrap from 'mousetrap';

import GameList from '../components/GameList';

const sampleBoxArt =
  'http://vignette2.wikia.nocookie.net/mario/images/8/8c/Super_Mario_World_2_-_North_American_Boxart.png';

const numGames = 14;

export default class Home extends React.PureComponent {
  games = [...Array(numGames)].map(() => ({
    image: sampleBoxArt,
    title: "Super Mario World 2: Yoshi's Island",
  }));

  inputEmitter = new EventEmitter();

  handleUp = e => {
    e.preventDefault();
    this.inputEmitter.emit('up');
  };
  handleDown = e => {
    e.preventDefault();
    this.inputEmitter.emit('down');
  };
  handleLeft = e => {
    e.preventDefault();
    this.inputEmitter.emit('left');
  };
  handleRight = e => {
    e.preventDefault();
    this.inputEmitter.emit('right');
  };
  handleSelect = e => {
    e.preventDefault();
    this.inputEmitter.emit('select');
  };

  componentDidMount = () => {
    Mousetrap.bind('up', this.handleUp);
    Mousetrap.bind('down', this.handleDown);
    Mousetrap.bind('left', this.handleLeft);
    Mousetrap.bind('right', this.handleRight);
    Mousetrap.bind('return', this.handleSelect);
  };

  componentWillUnmount = () => {
    Mousetrap.unbind('up');
    Mousetrap.unbind('down');
    Mousetrap.unbind('left');
    Mousetrap.unbind('right');
    Mousetrap.unbind('return');
  };

  render = () => (
    <GameList
      games={this.games}
      onSelectGame={game => console.log(game)}
      input={this.inputEmitter}
    />
  );
}
