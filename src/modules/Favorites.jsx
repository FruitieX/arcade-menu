import React from 'react';

import EventEmitter from 'event-emitter';
import Mousetrap from 'mousetrap';

import GameList from '../components/GameList';

import fs from 'fs';

const gamesDb = JSON.parse(
  fs.readFileSync('/home/rasse/src/igdb-scraper/nes_games.json', {
    encoding: 'utf-8',
  }),
);

export default class Home extends React.PureComponent {
  games = gamesDb
    .sort((a, b) => a.item.name.localeCompare(b.item.name))
    .map(game => {
      return {
        image: `file:///home/rasse/src/igdb-scraper/covers/${game.filename}.jpg`,
        title: game.item.name,
        filename: game.filename,
      };
    })
    //.slice(0, 500);

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
