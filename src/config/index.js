const { Pool } = require('pg');
require('dotenv').config();

const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err.message);
});

async function testDbConnection() {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT NOW() AS now, current_database() AS db, current_schema() AS schema'
    );
    console.log('✅ PostgreSQL connected:', result.rows[0]);
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  testDbConnection,
};
