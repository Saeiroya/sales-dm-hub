require('dotenv').config();

const host = process.env.DB_HOST || '127.0.0.1';
const port = process.env.DB_PORT || '5432';
const database = process.env.DB_NAME || 'postgres';
const user = process.env.DB_USER || 'postgres';
const password = encodeURIComponent(String(process.env.DB_PASSWORD || ''));

const databaseUrl = `postgres://${user}:${password}@127.0.0.1:${port}/${database}`;

module.exports = {
  dir: 'database/migrations',
  migrationsTable: 'pgmigrations',
  databaseUrl,
  schema: 'public',
  createSchema: false,
  noLock: false,
};
