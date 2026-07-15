const { Pool } = require('pg');
const env = require('./env');

const isProduction = env.NODE_ENV === 'production';
const hasDatabaseUrl =
  typeof env.DATABASE_URL === 'string' && env.DATABASE_URL.trim().length > 0;

const basePoolConfig = {
  max: Number(env.DB_POOL_MAX || 20),
  idleTimeoutMillis: Number(env.DB_IDLE_TIMEOUT_MS || 30000),
  connectionTimeoutMillis: Number(env.DB_CONNECTION_TIMEOUT_MS || 10000),
};

const poolConfig = hasDatabaseUrl
  ? {
      connectionString: env.DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
      ...basePoolConfig,
    }
  : {
      host: env.DB_HOST || '127.0.0.1',
      port: Number(env.DB_PORT || 5432),
      database: env.DB_NAME || 'postgres',
      user: env.DB_USER || 'postgres',
      password: env.DB_PASSWORD || '',
      ssl: isProduction ? { rejectUnauthorized: false } : false,
      ...basePoolConfig,
    };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error:', err);
});

async function query(text, params) {
  return pool.query(text, params);
}

async function getClient() {
  return pool.connect();
}

async function healthCheck() {
  const result = await pool.query(
    'SELECT NOW() AS now, current_database() AS db, current_schema() AS schema'
  );

  return result.rows[0];
}

module.exports = {
  pool,
  query,
  getClient,
  healthCheck,
};
