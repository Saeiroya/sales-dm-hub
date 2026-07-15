const contactsRepository = require('../repositories/contacts.repository');
const leadsRepository = require('../repositories/leads.repository');
const conversationsRepository = require(
  '../repositories/conversations.repository'
);
const messagesRepository = require('../repositories/messages.repository');
const intentClassifier = require('./intent-classifier.service');

function normalizeInteger(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value === 'number' && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();

    if (/^\d+$/.test(trimmedValue)) {
      return Number(trimmedValue);
    }
  }

  return value;
}

function normalizeLeadStage(stage) {
  const normalized = String(stage || "").trim().toLowerCase();

  const stageMap = {
    new: "incoming",
    incoming: "incoming",
    contacted: "contacted",
    contact: "contacted",
    engaged: "engaged",
    qualified: "engaged",
    interested: "engaged",
    proposal: "proposal",
    proposed: "proposal",
    negotiation: "negotiation",
    negotiating: "negotiation",
    won: "closed",
    lost: "closed",
    closed: "closed",
  };

  return stageMap[normalized] || "incoming";
}

function normalizePayload(payload = {}) {
  const tenantId = normalizeInteger(
    payload.tenantId ??
      payload.tenant_id
  );

  const channelId = normalizeInteger(
    payload.channelId ??
      payload.channel_id
  );

  const externalContactId =
    payload.externalContactId ??
    payload.external_contact_id ??
    payload.contactExternalId ??
    payload.contact_external_id ??
    payload.contactId ??
    payload.contact_id ??
    payload.senderId ??
    payload.sender_id ??
    payload.customerId ??
    payload.customer_id ??
    payload.externalId ??
    payload.external_id;

  const externalLeadId =
    payload.externalLeadId ??
    payload.external_lead_id ??
    payload.leadExternalId ??
    payload.lead_warm_id ?? // در صورت نیاز
    payload.lead_id ??
    externalContactId;

  const externalConversationId =
    payload.externalConversationId ??
    payload.external_conversation_id ??
    payload.conversationExternalId ??
    payload.conversation_external_id ??
    payload.threadId ??
    payload.thread_id ??
    payload.chatId ??
    payload.chat_id ??
    externalContactId;

  const externalMessageId =
    payload.externalMessageId ??
    payload.external_message_id ??
    payload.messageId ??
    payload.message_id ??
    payload.id ??
    null;

  const fullName =
    payload.fullName ??
    payload.full_name ??
    payload.name ??
    payload.contactName ??
    payload.contact_name ??
    null;

  const phone =
    payload.phone ??
    payload.mobile ??
    payload.phoneNumber ??
    payload.phone_number ??
    null;

  const username =
    payload.username ??
    payload.userName ??
    payload.user_name ??
    payload.handle ??
    null;

  const messageText =
    payload.messageText ??
    payload.message_text ??
    payload.content ??
    payload.message ??
    payload.text;

  const sentAt =
    payload.sentAt ??
    payload.sent_at ??
    payload.createdAt ??
    payload.created_at ??
    new Date().toISOString();

  return {
    tenantId,
    channelId,
    externalContactId,
    externalLeadId,
    externalConversationId,
    externalMessageId,
    fullName,
    phone,
    username,
    messageText,
    sentAt,
    rawPayload: payload,
  };
}

function validatePayload(data) {
  if (data.tenantId === null || data.tenantId === undefined) {
    throw new Error('Missing required field: tenantId');
  }

  if (!Number.isInteger(data.tenantId)) {
    throw new Error('Invalid tenantId: must be an integer');
  }

  if (data.channelId === null || data.channelId === undefined) {
    throw new Error('Missing required field: channelId');
  }

  if (!Number.isInteger(data.channelId)) {
    throw new Error('Invalid channelId: must be an integer');
  }

  if (
    data.externalContactId === null ||
    data.externalContactId === undefined ||
    String(data.externalContactId).trim() === ''
  ) {
    throw new Error('Missing required field: externalContactId');
  }

  if (
    data.externalConversationId === null ||
    data.externalConversationId === undefined ||
    String(data.externalConversationId).trim() === ''
  ) {
    throw new Error('Missing required field: externalConversationId');
  }

  if (
    data.messageText === null ||
    data.messageText === undefined ||
    String(data.messageText).trim() === ''
  ) {
    throw new Error('Missing required field: messageText');
  }

  const parsedSentAt = new Date(data.sentAt);

  if (Number.isNaN(parsedSentAt.getTime())) {
    throw new Error('Invalid sentAt: must be a valid date');
  }
}

async function updateLeadFromIntent(tenantId, leadId, intentResult) {
  if (!tenantId || !leadId || !intentResult) {
    return;
  }

  const scoreDelta = Number(intentResult.scoreDelta ?? 0);
  const stage = intentResult.stage ?? null;

  if (Number.isFinite(scoreDelta) && scoreDelta !== 0) {
    await leadsRepository.bumpLeadScore({
      tenantId,
      leadId,
      scoreDelta,
    });

    console.log(
      `[LeadIngestion] Lead ${leadId} score updated by ${scoreDelta}`
    );
  }

  if (stage) {
    await leadsRepository.updateLeadStage({
      tenantId,
      leadId,
      stage,
    });

    console.log(
      `[LeadIngestion] Lead ${leadId} stage updated to ${stage}`
    );
  }
}

async function ingestMessage(payload = {}) {
  const data = normalizePayload(payload);

  validatePayload(data);

  console.log(
    `[LeadIngestion] Processing message ${
      data.externalMessageId || 'no-external-id'
    } for tenant ${data.tenantId}`
  );

  /*
   * Prevent processing the same external message more than once (Early Check).
   * This check is skipped when the provider does not send a message ID.
   */
  if (data.externalMessageId) {
    const existingMessage =
      await messagesRepository.findMessageByExternalMessageId(
        data.tenantId,
        data.externalMessageId
      );

    if (existingMessage) {
      console.log(
        `[LeadIngestion] Duplicate message detected (Early Check): ${data.externalMessageId}`
      );

      return {
        success: true,
        duplicate: true,
        messageId: existingMessage.id,
      };
    }
  }

  const contact = await contactsRepository.upsertContact({
    tenantId: data.tenantId,
    channelId: data.channelId,
    externalId: String(data.externalContactId),
    fullName: data.fullName,
    phone: data.phone,
    username: data.username,
    source: 'dm',
    tags: [],
    meta: {
      externalLeadId: data.externalLeadId,
      externalConversationId: data.externalConversationId,
      rawPayload: data.rawPayload,
    },
  });

  if (!contact || !contact.id) {
    throw new Error('Failed to create or update contact');
  }

  const lead = await leadsRepository.upsertLead({
    tenantId: data.tenantId,
    contactId: contact.id,
    source: 'dm',
    lastActivityAt: new Date(data.sentAt),
  });

  if (!lead || !lead.id) {
    throw new Error('Failed to create or update lead');
  }

  /*
   * The repository receives one object. Passing tenantId separately caused
   * tenant_id to become NULL during conversation creation.
   */
  const conversation =
    await conversationsRepository.findOrCreateConversation({
      tenantId: data.tenantId,
      contactId: contact.id,
      channelId: data.channelId,
      externalConversationId: String(
        data.externalConversationId
      ),
    });

  if (!conversation || !conversation.id) {
    throw new Error('Failed to find or create conversation');
  }

  const intentResult = await intentClassifier.classifyIntent(
    String(data.messageText)
  );

  const normalizedIntentResult = {
    intent: intentResult?.intent ?? 'unknown',
    sentiment: intentResult?.sentiment ?? 'neutral',
    confidence: intentResult?.confidence ?? null,
    scoreDelta: intentResult?.scoreDelta ?? 0,
    stage: normalizeLeadStage(intentResult?.stage),
  };

  const messageResult = await messagesRepository.createMessage({
    tenantId: data.tenantId,
    conversationId: conversation.id,
    senderId: contact.id,
    content: String(data.messageText).trim(),
    externalMessageId: data.externalMessageId,
    direction: 'inbound',
    intent: normalizedIntentResult.intent,
    sentiment: normalizedIntentResult.sentiment,
    metadata: {
      originalPayload: data.rawPayload,
      confidence: normalizedIntentResult.confidence,
      sentAt: data.sentAt,
    },
  });

  // Late Check / Duplicate Guard (handling unique key constraint violations or race conditions)
  if (messageResult?.duplicate) {
    console.log(
      `[LeadIngestion] Duplicate message detected (Late Guard): ${data.externalMessageId}`
    );
    return {
      success: true,
      duplicate: true,
      messageId: messageResult.message?.id ?? messageResult.id ?? null,
      contactId: contact.id,
      leadId: lead.id,
      conversationId: conversation.id,
    };
  }

  if (!messageResult || !(messageResult.id || messageResult.message?.id)) {
    throw new Error('Failed to create message');
  }

  const finalMessageId = messageResult.id ?? messageResult.message?.id;

  await updateLeadFromIntent(
    data.tenantId,
    lead.id,
    normalizedIntentResult
  );

  console.log(
    `[LeadIngestion] Message ${finalMessageId} processed successfully`
  );

  return {
    success: true,
    duplicate: false,
    messageId: finalMessageId,
    contactId: contact.id,
    leadId: lead.id,
    conversationId: conversation.id,
    intent: normalizedIntentResult.intent,
  };
}

module.exports = {
  ingestMessage,
  ingestLead: ingestMessage,
  updateLeadFromIntent,
  normalizePayload,
  validatePayload,
  normalizeLeadStage,
};
