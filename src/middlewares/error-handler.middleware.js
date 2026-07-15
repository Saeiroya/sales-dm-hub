const logger = require('../lib/logger');

function errorHandlerMiddleware(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'Internal server error';

  logger.error({
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    statusCode,
    code,
    message,
    details: err.details || null,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details: err.details || null,
    },
    requestId: req.requestId,
  });
}

module.exports = errorHandlerMiddleware;
