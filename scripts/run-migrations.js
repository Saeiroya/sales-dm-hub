require('dotenv').config();
const { runner: pgMigrate } = require('node-pg-migrate');

async function run() {
  const host = '127.0.0.1';
  const port = process.env.DB_PORT || '5432';
  const database = process.env.DB_NAME || 'postgres';
  const user = process.env.DB_USER || 'postgres';
  const password = encodeURIComponent(String(process.env.DB_PASSWORD || ''));

  const databaseUrl = `postgres://${user}:${password}@${host}:${port}/${database}`;

  try {
    await pgMigrate({
      dir: 'database/migrations',
      direction: 'up',
      migrationsTable: 'pgmigrations',
      databaseUrl,
      schema: 'public',
      createSchema: false,
      noLock: false,
      verbose: true,
    });

    console.log('Migrations completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

run();
