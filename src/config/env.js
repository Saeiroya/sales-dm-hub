require('dotenv').config();

function required(name, fallback = undefined) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),

  db: {
    host: required('DB_HOST', 'localhost'),
    port: Number(process.env.DB_PORT || 5432),
    name: required('DB_NAME'),
    user: required('DB_USER'),
    password: required('DB_PASSWORD'),
  },

  defaultTenantId: Number(process.env.DEFAULT_TENANT_ID || 1),
  logLevel: process.env.LOG_LEVEL || 'info',
};

module.exports = { env };
