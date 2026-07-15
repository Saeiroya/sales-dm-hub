const db = require('../config/db');

async function findOrCreateConversation({ tenantId, contactId, channelId = null, leadId = null }) {
  const findQuery = `
    SELECT *
    FROM conversations
    WHERE tenant_id = $1
      AND contact_id = $2
    ORDER BY id DESC
    LIMIT 1;
  `;

  const existing = await db.query(findQuery, [tenantId, contactId]);

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  const insertQuery = `
    INSERT INTO conversations (
      tenant_id,
      contact_id,
      channel_id,
      lead_id,
      status,
      started_at,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, 'open', NOW(), NOW(), NOW())
    RETURNING *;
  `;

  const created = await db.query(insertQuery, [
    tenantId,
    contactId,
    channelId,
    leadId,
  ]);

  return created.rows[0];
}

module.exports = {
  findOrCreateConversation,
};
