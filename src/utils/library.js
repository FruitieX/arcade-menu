import Knex from 'knex';
// import pg from 'pg';

import config from './config';

// Use ssl by default
// pg.defaults.ssl = true;

const knex = Knex(config.db.development);

export default knex;

export const getGames = (
  { offset = 0, limit = 10000, orderBy = 'filename', desc = false } = {},
) =>
  knex('games')
    .where({ platformId: 1 })
    .offset(offset)
    .limit(limit)
    .orderBy(orderBy, desc && 'desc');

/*
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
*/
