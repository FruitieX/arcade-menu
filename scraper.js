import xml2js from 'xml2js-es6-promise';
import axios from 'axios';
import fs from 'fs.promised';
import path from 'path';
import changeCase from 'change-case';
import Fuse from 'fuse.js';
import knex from './src/utils/library';
import sharp from 'sharp';

const rootUrl = 'http://thegamesdb.net/api';
const bannerUrl = 'http://thegamesdb.net/banners';

// Simplify search strings when matching
const stripSpecialCharacters = string =>
  string
    .toLowerCase()
    // Remove special characters
    .replace(/[^\w\s]/gi, ' ')
    // Remove leading "The"
    .replace(/^the/gi, '')
    // Remove trailing "The"
    .replace(/the$/gi, '')
    // Trim extra whitespace within string
    .replace(/\s+/gi, ' ')
    // Trim extra whitespace at ends of string
    .trim();

const fuseOptions = {
  shouldSort: true,
  includeScore: true,
  //matchAllTokens: true,
  //findAllMatches: true,
  //tokenize: true,
  threshold: 1,
  location: 0,
  distance: 2,
  maxPatternLength: 64,
  minMatchCharLength: 10,
  keys: [
    {
      name: 'searchTitle',
      weight: 0.8,
    },
    {
      name: 'alternateSearchTitles',
      weight: 0.2,
    },
  ],
};

const downloadImage = async (url, filepath) =>
  axios.get(url, { responseType: 'arraybuffer' }).then(res =>
    sharp(res.data)
      .resize(400, 300)
      .crop(sharp.gravity.north)
      .jpeg()
      .toFile(filepath),
  );

//res.data.pipe(converter).pipe(fs.createWriteStream(filepath)));

const arrayify = (obj, tagName, childTag) => {
  if (childTag) {
    if (Array.isArray(obj[tagName][childTag])) {
      obj[tagName] = obj[tagName][childTag];
    } else {
      obj[tagName] = [obj[tagName][childTag]];
    }
  } else if (!Array.isArray(obj[tagName])) {
    obj[tagName] = [obj[tagName]];
  }
};

const cleanupResult = game => {
  // Strip special characters from titles for searching
  game.searchTitle = stripSpecialCharacters(game.gameTitle);

  // Alternate titles should always be an array of strings
  if (game.alternateTitles) {
    arrayify(game, 'alternateTitles', 'title');

    // Strip special characters from alternate titles for searching
    game.alternateSearchTitles = game.alternateTitles.map(title =>
      stripSpecialCharacters(title),
    );
  }

  // Genres should always be an array of strings
  if (game.genres) {
    arrayify(game, 'genres', 'genre');
  }

  if (game.images) {
    // Box art should always be an array of strings
    if (game.images.boxart) {
      arrayify(game.images, 'boxart');
    }

    // Fan art should always be an array of strings
    if (game.images.fanart) {
      arrayify(game.images, 'fanart');
    }

    // Screenshots should always be an array of strings
    if (game.images.screenshot) {
      arrayify(game.images, 'screenshot');
    }
  }

  game.tgdbId = game.id;
  delete game.id;
};

const findGame = async (name, platform) => {
  const apiResult = await axios.get(`${rootUrl}/GetGame.php`, {
    params: { name, platform },
  });

  // Game list is under <Data><Game> ...
  let gameList = (await xml2js(apiResult.data, {
    ignoreAttrs: true,
    explicitArray: false,
    tagNameProcessors: [name => changeCase.camel(name)],
  })).data.game;

  // Make sure gameList is an array
  gameList = Array.isArray(gameList) ? gameList : [gameList];

  if (!gameList.length || !gameList[0]) {
    throw new Error(`No game found!`);
  }

  // Fix up each game in the response a little bit...
  gameList.forEach(cleanupResult);

  const fuse = new Fuse(gameList, fuseOptions);
  let matches = fuse.search(stripSpecialCharacters(name));
  let { score, item } = matches[0];

  item.scraperConfidence = 1 - score;

  if (item.scraperConfidence <= 0.99) {
    console.log('Low confidence score!');
    //console.log(`Alternatives:\n${matches.slice(1, 5)}\n`);

    console.log(`Score: ${item.scraperConfidence}`);
    console.log(`ROM: ${name}\nResult: ${item.gameTitle}`);
  }

  // delete item.searchTitle;
  // delete item.alternateSearchTitles;

  return item;
};

const createPlatform = async (platformName, dir) => {
  // Fetch available platforms in TGDB
  let apiResult = await axios.get(`${rootUrl}/GetPlatformsList.php`);

  let platformList = (await xml2js(apiResult.data, {
    ignoreAttrs: true,
    explicitArray: false,
    tagNameProcessors: [name => changeCase.camel(name)],
  })).data.platforms.platform;

  const platformId = platformList.find(
    platform => platform.name === platformName,
  ).id;

  apiResult = await axios.get(`${rootUrl}/GetPlatform.php`, {
    params: { id: platformId },
  });

  const platformDetails = (await xml2js(apiResult.data, {
    ignoreAttrs: true,
    explicitArray: false,
    tagNameProcessors: [name => changeCase.camel(name)],
  })).data.platform;

  console.log(`Inserting platform ${platformDetails.platform} into DB...`);
  const platform = (await knex('platforms').insert(
    {
      name: platformDetails.platform,
      rom_directory: dir,
      manufacturer: platformDetails.manufacturer,

      description: platformDetails.overview,
      rating: platformDetails.rating,
    },
    '*',
  ))[0];

  console.log(`Downloading images for platform ${platformDetails.platform}...`);
  if (platformDetails.images.boxart) {
    await downloadImage(
      `${bannerUrl}/${platformDetails.images.boxart}`,
      `${dir}/images/boxart.jpg`,
    );
  }
  if (platformDetails.images.consoleart) {
    await downloadImage(
      `${bannerUrl}/${platformDetails.images.consoleart}`,
      `${dir}/images/consoleart.jpg`,
    );
  }
  if (platformDetails.images.controllerart) {
    await downloadImage(
      `${bannerUrl}/${platformDetails.images.controllerart}`,
      `${dir}/images/controllerart.jpg`,
    );
  }

  return platform;
};

const createGame = async (game, platformName, dir) => {
  let platform = await knex('platforms')
    .first()
    .where({ name: platformName });

  if (!platform) {
    platform = await createPlatform(platformName, dir);
  }

  const dbGame = await knex('games')
    .first()
    .where({ filename: game.filename, platformId: platform.id });

  const fields = {
    name: game.gameTitle,
    platformId: platform.id,
    filename: game.filename,
    players: game.players && parseInt(game.players),
    description: game.overview,
    genres: JSON.stringify(game.genres),
    coop: game.coOp === 'No' ? false : true,

    developer: game.developer,
    publisher: game.publisher,
    rating: game.rating,

    scraper_confidence: game.scraperConfidence,
  };

  if (!dbGame) {
    console.log(`Inserting game ${game.filename} into DB...`);
    await knex('games').insert(fields);
  } else {
    console.log(`Updating game ${game.filename} in DB...`);
    await knex('games')
      .where({ filename: game.filename, platformId: platform.id })
      .update(fields);
  }

  if (!fs.existsSync(path.join(dir, 'images', `${game.filename}.jpg`))) {
    console.log(`Downloading boxart for ${game.gameTitle}...`);
    await downloadImage(
      `${bannerUrl}/${game.images.boxart[0]}`,
      `${dir}/images/${game.filename}.jpg`,
    );
  } else {
    console.log(
      `Boxart already exists for ${game.gameTitle}! Skipping download...`,
    );
  }
};

export const doScrape = async (dir, platform) => {
  if (!fs.existsSync(path.join(dir, 'images'))) {
    await fs.mkdir(path.join(dir, 'images'));
  }

  let roms = await fs.readdir(dir);

  roms = roms.filter(filename =>
    fs.statSync(path.join(dir, filename)).isFile(),
  );

  roms = roms.map(filename => ({ filename }));

  // Best guess of game title name based on filename
  roms.forEach(rom => {
    // strip filename extensions
    rom.gameTitle = /(.*)\..*/.exec(rom.filename)[1];
    // strip parenthesis after name
    rom.gameTitle = rom.gameTitle.split(' (')[0];
  });

  // for debugging
  //roms = roms.slice(0, 3);

  for (let i in roms) {
    const rom = roms[i];
    console.log(
      `\n(${i} / ${roms.length}) Scraping ROM file ${rom.filename}...`,
    );
    try {
      const details = await findGame(rom.gameTitle, platform);
      roms[i] = {
        ...rom,
        ...details,
      };

      await createGame(roms[i], platform, dir);
    } catch (e) {
      console.log('Error while scraping game:', e.message);
    }
  }
};

doScrape(
  '/home/rasse/roms/nes',
  'Nintendo Entertainment System (NES)',
).then(() => {
  console.log('done');
  process.exit(0);
});
