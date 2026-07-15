const leadIngestionService = require('../services/lead-ingestion.service');

async function handleWebhook(req, res, next) {
  const requestId = req.id || req.headers['x-request-id'] || 'no-request-id';

  try {
    const payload = req.body || {};

    console.log(`[Webhook][${requestId}] Incoming webhook`, {
      tenantId: payload.tenantId ?? payload.tenant_id,
      channelId: payload.channelId ?? payload.channel_id,
      externalId:
        payload.externalId ??
        payload.external_id ??
        payload.externalContactId ??
        payload.external_contact_id ??
        payload.senderId ??
        payload.sender_id,
      externalMessageId:
        payload.externalMessageId ??
        payload.external_message_id ??
        payload.messageId ??
        payload.message_id ??
        payload.id,
    });

    const result = await leadIngestionService.ingestMessage(payload);

    return res.status(result.duplicate ? 200 : 201).json({
      success: true,
      duplicate: Boolean(result.duplicate),
      data: result,
    });
  } catch (error) {
    console.error(`[Webhook][${requestId}] Failed`, {
      message: error.message,
      stack: error.stack,
    });

    if (
      error.message === 'Missing required field: tenantId' ||
      error.message === 'Missing required field: channelId' ||
      error.message === 'Missing required field: externalContactId' ||
      error.message === 'Missing required field: externalConversationId' ||
      error.message === 'Missing required field: message content' ||
      error.message === 'Invalid tenantId: must be an integer' ||
      error.message === 'Invalid channelId: must be an integer'
    ) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    return next(error);
  }
}

module.exports = {
  handleWebhook,
};
