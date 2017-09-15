import React from 'react';

import GameList from '../components/GameList';

import games from '../utils/library';

export default class Home extends React.PureComponent {
  onSelectGame = game => console.log(game);

  render = () => <GameList games={games} onSelectGame={this.onSelectGame} />;
}
