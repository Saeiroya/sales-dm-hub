const { pool } = require('../config/db');

async function createMessage({
  leadId,
  tenantId,
  direction,
  content,
  intent,
  confidence,
  rawPayload,
}) {
  const query = `
    INSERT INTO public.messages (
      lead_id,
      tenant_id,
      direction,
      content,
      intent,
      intent_confidence,
      raw_payload
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING
      id,
      lead_id,
      tenant_id,
      direction,
      content,
      intent,
      intent_confidence::float8 AS intent_confidence,
      created_at;
  `;

  const values = [
    leadId,
    tenantId,
    direction,
    content,
    intent,
    confidence,
    rawPayload || null,
  ];

  const result = await pool.query(query, values);
  const row = result.rows[0];

  return {
    ...row,
    id: Number(row.id),
    lead_id: Number(row.lead_id),
    tenant_id: Number(row.tenant_id),
    intent_confidence: Number(row.intent_confidence),
  };
}

module.exports = { createMessage };
