import fs from 'fs';

const gamesDb = JSON.parse(
  fs.readFileSync('/home/rasse/src/igdb-scraper/nes_games.json', {
    encoding: 'utf-8',
  }),
);

const games = gamesDb
  .sort((a, b) => a.item.name.localeCompare(b.item.name))
  .map(game => {
    return {
      image: `file:///home/rasse/src/igdb-scraper/covers/${game.filename}.jpg`,
      title: game.item.name,
      filename: game.filename,
    };
  });

export default games;
