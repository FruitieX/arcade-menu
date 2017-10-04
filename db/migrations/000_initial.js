exports.up = knex =>
  knex.schema
    .createTableIfNotExists('platforms', table => {
      table.increments('id').primary();
      table.text('name');
      table.text('rom_directory').notNullable();
      table.text('controller_image');
      table.text('manufacturer');
      table.json('details');

      // Common fields
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('release_date');
      table.text('description');
      table.text('thumbnail');
      table.text('video_url');
      table.float('rating');
    })
    .createTableIfNotExists('games', table => {
      table.text('name').notNullable();
      table
        .integer('platformId')
        .references('id')
        .inTable('platforms')
        .onDelete('CASCADE')
        .notNullable();
      table.text('filename').primary();
      table
        .boolean('favorite')
        .defaultTo(false)
        .notNullable();
      table.integer('playcount').defaultTo(0);
      table.timestamp('last_played');
      table.json('play_durations');
      table.json('local_ratings');

      // Optional fields
      table.text('developer');
      table.text('publisher');
      table.text('esrb');
      table.json('genres');
      table.json('alternate_titles');
      table.json('images');
      table.integer('players');
      table.boolean('coop');
      table.float('scraper_confidence');

      // Common fields
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('release_date');
      table.text('description');
      table.text('thumbnail');
      table.text('video_url');
      table.float('rating');
    });

exports.down = knex =>
  knex.schema.dropTableIfExists('games').dropTableIfExists('platforms');
