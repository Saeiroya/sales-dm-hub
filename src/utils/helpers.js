function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeString(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function validateWebhookPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return {
      isValid: false,
      errors: ['Request body must be a valid JSON object'],
    };
  }

  if (!isNonEmptyString(body.external_id)) {
    errors.push('external_id is required and must be a non-empty string');
  }

  if (body.name != null && typeof body.name !== 'string') {
    errors.push('name must be a string');
  }

  if (body.phone != null && typeof body.phone !== 'string') {
    errors.push('phone must be a string');
  }

  if (body.message != null && typeof body.message !== 'string') {
    errors.push('message must be a string');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  isNonEmptyString,
  normalizeString,
  validateWebhookPayload,
};
