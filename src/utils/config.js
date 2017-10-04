const config = {
  db: {
    // Common config for all db environments
    debug: false, // Toggle db debugging
    client: 'pg',
    connection: process.env.DATABASE_URL || {
      host: '127.0.0.1',
      user: 'postgres',
      password: '',
      database: 'arcademenu',
      ssl: false,
    },
    pool: {
      min: 1,
      max: 1,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: 'migrations',
    },
  },
};

export default {
  ...config,
  db: {
    // Developer's local machine
    development: {
      ...config.db,

      seeds: {
        directory: 'seeds-dev',
      },
    },

    // Production environment
    production: {
      ...config.db,

      seeds: {
        directory: 'seeds-prod',
      },
    },
  },
};
