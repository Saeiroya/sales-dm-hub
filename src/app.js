const express = require('express');
const webhookRoutes = require('./routes/webhook.routes');
const requestContextMiddleware = require('./middlewares/request-context.middleware');
const errorHandlerMiddleware = require('./middlewares/error-handler.middleware');

const app = express();

app.use(express.json());

app.use(requestContextMiddleware);

app.use('/webhook', webhookRoutes);

app.use(errorHandlerMiddleware);

module.exports = app;
