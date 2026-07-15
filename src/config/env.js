require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  DB_POOL_MAX: process.env.DB_POOL_MAX || 20,
  DB_IDLE_TIMEOUT_MS: process.env.DB_IDLE_TIMEOUT_MS || 30000,
  DB_CONNECTION_TIMEOUT_MS: process.env.DB_CONNECTION_TIMEOUT_MS || 10000,
};
