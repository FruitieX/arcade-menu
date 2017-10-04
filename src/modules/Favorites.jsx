import React from 'react';

import GameList from '../components/GameList';

export default class Home extends React.PureComponent {
  onSelectGame = game => console.log(game);

  render = () => <GameList onSelectGame={this.onSelectGame} />;
}
