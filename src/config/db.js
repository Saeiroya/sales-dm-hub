const { Pool } = require('pg');
const { env } = require('./env');

const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  user: env.db.user,
  password: env.db.password,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

async function connectDb() {
  const result = await pool.query(`
    SELECT NOW() AS now, current_database() AS db, current_schema() AS schema
  `);

  console.log('PostgreSQL connected:', result.rows[0]);
}

module.exports = { pool, connectDb };
