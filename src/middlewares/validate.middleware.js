const AppError = require('../utils/app-error');

function validateMiddleware(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(
        new AppError(
          'Invalid request payload',
          400,
          'VALIDATION_ERROR',
          result.error.flatten()
        )
      );
    }

    req.validatedBody = result.data;
    next();
  };
}

module.exports = validateMiddleware;
