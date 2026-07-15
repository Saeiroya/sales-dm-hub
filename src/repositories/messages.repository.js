const db = require('../config/db');

async function createMessage(messageData, client = db) {
  const {
    tenantId,
    conversationId,
    senderType = 'contact',
    senderId = null,
    messageType = 'text',
    messageText,
    content,
    message,
    mediaUrl = null,
    externalMessageId = null,
    isRead = false,
    sentAt = new Date(),
  } = messageData;

  const finalContent = messageText ?? content ?? message;

  if (!tenantId || !conversationId || !finalContent) {
    throw new Error('Missing required fields: tenantId, conversationId, or message content');
  }

  if (externalMessageId) {
    const existingMessage = await findMessageByExternalMessageId(
      tenantId,
      externalMessageId,
      client
    );

    if (existingMessage) {
      return {
        inserted: false,
        duplicate: true,
        message: existingMessage,
      };
    }
  }

  const insertQuery = `
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
    RETURNING *;
  `;

  const insertValues = [
    tenantId,
    conversationId,
    senderType,
    senderId,
    messageType,
    finalContent,
    mediaUrl,
    externalMessageId,
    isRead,
    sentAt,
  ];

  try {
    const insertResult = await client.query(insertQuery, insertValues);

    return {
      inserted: true,
      duplicate: false,
      message: mapMessageRow(insertResult.rows[0]),
    };
  } catch (error) {
    if (
      error.code === '23505' &&
      externalMessageId &&
      error.constraint === 'messages_tenant_external_message_id_uq'
    ) {
      const existingMessage = await findMessageByExternalMessageId(
        tenantId,
        externalMessageId,
        client
      );

      if (existingMessage) {
        return {
          inserted: false,
          duplicate: true,
          message: existingMessage,
        };
      }
    }

    throw error;
  }
}

async function findMessageByExternalMessageId(tenantId, externalMessageId, client = db) {
  if (!externalMessageId) return null;

  const query = `
    SELECT *
    FROM messages
    WHERE tenant_id = $1
      AND external_message_id = $2
    LIMIT 1;
  `;

  const result = await client.query(query, [tenantId, externalMessageId]);

  if (result.rows.length === 0) return null;

  return mapMessageRow(result.rows[0]);
}

function mapMessageRow(row) {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    conversationId: row.conversation_id,
    senderType: row.sender_type,
    senderId: row.sender_id,
    messageType: row.message_type,
    content: row.content,
    messageText: row.content,
    mediaUrl: row.media_url,
    externalMessageId: row.external_message_id,
    isRead: row.is_read,
    sentAt: row.sent_at,
    createdAt: row.created_at,
  };
}

module.exports = {
  createMessage,
  findMessageByExternalMessageId,
};
