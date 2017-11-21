import React from 'react';

import GameList from '../components/GameList';
import path from 'path';
import { spawn } from 'child_process';

import { getGames } from '../utils/library';

export default class Favorites extends React.PureComponent {
  dir = '/home/rasse/roms/nes';

  state = {
    games: [],
  };

  componentDidMount = async () => {
    const games = await getGames();
    this.setState({ games, numGames: games.length });
  };

  onSelectGame = game => {
    console.log('starting:', game);
    spawn('retroarch', [
      '-L',
      '/usr/lib/libretro/nestopia_libretro.so',
      '--appendconfig',
      '/home/rasse/src/arcade-menu/nes.cfg',
      path.join(this.dir, game.filename),
    ]);
  };

  render = () => (
    <GameList games={this.state.games} onSelectGame={this.onSelectGame} />
  );
}
