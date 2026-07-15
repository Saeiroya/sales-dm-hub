const AppError = require('../utils/app-error');

function webhookAuthMiddleware(req, res, next) {
  const configuredSecret = process.env.WEBHOOK_SECRET;

  if (!configuredSecret) {
    return next();
  }

  const providedSecret =
    req.headers['x-webhook-secret'] ||
    req.headers['x-api-key'] ||
    req.query.secret;

  if (!providedSecret || providedSecret !== configuredSecret) {
    return next(new AppError('Unauthorized webhook request', 401, 'UNAUTHORIZED'));
  }

  next();
}

module.exports = webhookAuthMiddleware;
