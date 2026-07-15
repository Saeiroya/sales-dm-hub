require('dotenv').config();

const app = require('./app');
const db = require('./config/db');

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  try {
    const result = await db.healthCheck();

    console.log('PostgreSQL connected:', result);

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
