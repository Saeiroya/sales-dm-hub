function validateInstagramPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    const error = new Error('Invalid payload: request body is required');
    error.statusCode = 400;
    throw error;
  }

  if (!payload.sender_id) {
    const error = new Error('Invalid payload: sender_id is required');
    error.statusCode = 400;
    throw error;
  }

  if (!payload.message || typeof payload.message !== 'object') {
    const error = new Error('Invalid payload: message object is required');
    error.statusCode = 400;
    throw error;
  }

  if (!payload.message.id) {
    const error = new Error('Invalid payload: message.id is required');
    error.statusCode = 400;
    throw error;
  }
}

function normalizeInstagramPayload(payload) {
  return {
    tenantId: payload.tenant_id || null,
    senderId: String(payload.sender_id),
    senderName: payload.sender_name || null,
    messageId: String(payload.message.id),
    messageText: payload.message.text || '',
    rawPayload: payload,
    receivedAt: new Date().toISOString(),
  };
}

async function processInstagramWebhook(payload) {
  validateInstagramPayload(payload);

  const normalizedData = normalizeInstagramPayload(payload);

  console.log('📩 Instagram webhook received:');
  console.log({
    tenantId: normalizedData.tenantId,
    senderId: normalizedData.senderId,
    senderName: normalizedData.senderName,
    messageId: normalizedData.messageId,
    messageText: normalizedData.messageText,
    receivedAt: normalizedData.receivedAt,
  });

  return {
    tenantId: normalizedData.tenantId,
    senderId: normalizedData.senderId,
    senderName: normalizedData.senderName,
    messageId: normalizedData.messageId,
    messageText: normalizedData.messageText,
    receivedAt: normalizedData.receivedAt,
  };
}

module.exports = {
  processInstagramWebhook,
};
