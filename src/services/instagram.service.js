const db = require('../config/db');

function getTextFromInstagramMessage(message) {
  if (!message) return '';
  if (typeof message.text === 'string') return message.text;
  return '';
}

function getMessageTypeFromInstagramMessage(message) {
  if (!message) return 'text';

  if (message.text) return 'text';
  if (message.attachments?.some(a => a.type === 'image')) return 'image';
  if (message.attachments?.some(a => a.type === 'video')) return 'video';
  if (message.attachments?.some(a => a.type === 'audio')) return 'audio';
  if (message.attachments?.length) return 'file';

  return 'text';
}

async function findChannelByExternalId(client, externalId) {
  const res = await client.query(
    `
    SELECT *
    FROM channels
    WHERE external_id = $1
      AND type = 'instagram'
      AND is_active = true
    LIMIT 1
    `,
    [externalId]
  );

  return res.rows[0] || null;
}

async function findContactByExternalId(client, tenantId, channelId, externalContactId) {
  const res = await client.query(
    `
    SELECT *
    FROM contacts
    WHERE tenant_id = $1
      AND channel_id = $2
      AND external_id = $3
    ORDER BY id ASC
    LIMIT 1
    `,
    [tenantId, channelId, externalContactId]
  );

  return res.rows[0] || null;
}

async function createContact(client, {
  tenantId,
  channelId,
  externalContactId,
  username = null,
  fullName = null,
  meta = {}
}) {
  const res = await client.query(
    `
    INSERT INTO contacts (
      tenant_id,
      channel_id,
      full_name,
      username,
      phone,
      email,
      external_id,
      source,
      tags,
      meta
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
    `,
    [
      tenantId,
      channelId,
      fullName,
      username,
      null,
      null,
      externalContactId,
      'instagram',
      [],
      meta
    ]
  );

  return res.rows[0];
}

async function findOrCreateContact(client, {
  tenantId,
  channelId,
  externalContactId,
  username = null,
  fullName = null,
  meta = {}
}) {
  const existing = await findContactByExternalId(
    client,
    tenantId,
    channelId,
    externalContactId
  );

  if (existing) {
    return existing;
  }

  return createContact(client, {
    tenantId,
    channelId,
    externalContactId,
    username,
    fullName,
    meta
  });
}

async function findOpenConversation(client, tenantId, contactId, channelId) {
  const res = await client.query(
    `
    SELECT *
    FROM conversations
    WHERE tenant_id = $1
      AND contact_id = $2
      AND channel_id = $3
      AND status IN ('open', 'pending')
    ORDER BY id DESC
    LIMIT 1
    `,
    [tenantId, contactId, channelId]
  );

  return res.rows[0] || null;
}

async function createConversation(client, {
  tenantId,
  contactId,
  channelId,
  subject = 'Instagram DM'
}) {
  const res = await client.query(
    `
    INSERT INTO conversations (
      tenant_id,
      contact_id,
      channel_id,
      lead_id,
      status,
      subject,
      started_at,
      last_message_at,
      closed_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), $7)
    RETURNING *
    `,
    [
      tenantId,
      contactId,
      channelId,
      null,
      'open',
      subject,
      null
    ]
  );

  return res.rows[0];
}

async function touchConversation(client, conversationId) {
  const res = await client.query(
    `
    UPDATE conversations
    SET last_message_at = NOW(),
        updated_at = NOW()
    WHERE id = $1
    RETURNING *
    `,
    [conversationId]
  );

  return res.rows[0] || null;
}

async function findOrCreateConversation(client, {
  tenantId,
  contactId,
  channelId
}) {
  const existing = await findOpenConversation(client, tenantId, contactId, channelId);

  if (existing) {
    await touchConversation(client, existing.id);
    return existing;
  }

  return createConversation(client, {
    tenantId,
    contactId,
    channelId
  });
}

async function insertMessage(client, {
  tenantId,
  conversationId,
  senderType,
  senderId = null,
  messageType,
  content,
  mediaUrl = null,
  externalMessageId = null,
  isRead = false,
  sentAt = new Date()
}) {
  const res = await client.query(
    `
    INSERT INTO messages (
      tenant_id,
      conversation_id,
      sender_type,
      sender_id,
      message_type,
      content,
      media_url,
      external_message_id,
      is_read,
      sent_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
    `,
    [
      tenantId,
      conversationId,
      senderType,
      senderId,
      messageType,
      content,
      mediaUrl,
      externalMessageId,
      isRead,
      sentAt
    ]
  );

  return res.rows[0];
}

async function insertWebhookEvent(client, {
  tenantId,
  channelId,
  eventType,
  payload,
  status = 'processed',
  errorMessage = null,
  receivedAt = new Date(),
  processedAt = new Date()
}) {
  const res = await client.query(
    `
    INSERT INTO webhook_events (
      tenant_id,
      channel_id,
      event_type,
      payload,
      status,
      error_message,
      received_at,
      processed_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
    `,
    [
      tenantId,
      channelId,
      eventType,
      payload,
      status,
      errorMessage,
      receivedAt,
      processedAt
    ]
  );

  return res.rows[0];
}

async function processIncomingInstagramMessage(payload) {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const entry = payload?.entry?.[0];
    const messaging = entry?.messaging?.[0];

    if (!messaging) {
      throw new Error('Invalid Instagram webhook payload: messaging[0] not found');
    }

    const pageOrAccountId = String(messaging.recipient?.id || '');
    const senderExternalId = String(messaging.sender?.id || '');
    const externalMessageId = messaging.message?.mid || null;

    if (!pageOrAccountId) {
      throw new Error('Instagram recipient.id is missing');
    }

    if (!senderExternalId) {
      throw new Error('Instagram sender.id is missing');
    }

    const channel = await findChannelByExternalId(client, pageOrAccountId);

    if (!channel) {
      throw new Error(`Active Instagram channel not found for external_id=${pageOrAccountId}`);
    }

    const tenantId = channel.tenant_id;

    const contact = await findOrCreateContact(client, {
      tenantId,
      channelId: channel.id,
      externalContactId: senderExternalId,
      username: null,
      fullName: null,
      meta: {
        platform: 'instagram',
        sender_id: senderExternalId
      }
    });

    const conversation = await findOrCreateConversation(client, {
      tenantId,
      contactId: contact.id,
      channelId: channel.id
    });

    const messageType = getMessageTypeFromInstagramMessage(messaging.message);
    const content = getTextFromInstagramMessage(messaging.message);
    const mediaUrl = messaging.message?.attachments?.[0]?.payload?.url || null;

    const message = await insertMessage(client, {
      tenantId,
      conversationId: conversation.id,
      senderType: 'contact',
      senderId: contact.id,
      messageType,
      content,
      mediaUrl,
      externalMessageId,
      isRead: false,
      sentAt: messaging.timestamp ? new Date(messaging.timestamp) : new Date()
    });

    const webhookEvent = await insertWebhookEvent(client, {
      tenantId,
      channelId: channel.id,
      eventType: 'instagram_message',
      payload,
      status: 'processed',
      errorMessage: null,
      receivedAt: new Date(),
      processedAt: new Date()
    });

    await touchConversation(client, conversation.id);

    await client.query('COMMIT');

    return {
      channel,
      contact,
      conversation,
      message,
      webhookEvent
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  findChannelByExternalId,
  findOrCreateContact,
  findOrCreateConversation,
  insertMessage,
  insertWebhookEvent,
  processIncomingInstagramMessage
};
