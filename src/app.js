const express = require('express');
const webhookRoutes = require('./routes/webhook.routes');
const healthRoutes = require('./routes/health.routes');

const app = express();

app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'sales-dm-hub API is running',
  });
});

app.use('/health', healthRoutes);
app.use('/webhook', webhookRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled app error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

module.exports = app;
