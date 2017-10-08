import React from 'react';

import GameList from '../components/GameList';
import path from 'path';
import { spawn } from 'child_process';

export default class Platform extends React.PureComponent {
  dir = '/home/rasse/roms/nes';

  onSelectGame = game => {
    console.log('starting:', game);
    spawn('retroarch', [
      '-L',
      '/usr/lib/libretro/nestopia_libretro.so',
      path.join(this.dir, game.filename),
    ]);
  };

  render = () => <GameList onSelectGame={this.onSelectGame} />;
}
