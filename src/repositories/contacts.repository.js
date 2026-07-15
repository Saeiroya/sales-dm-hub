const db = require('../config/db');

async function upsertContact({
  tenantId,
  channelId,
  externalId,
  fullName = null,
  username = null,
  phone = null,
  email = null,
  source = 'dm',
  tags = [],
  meta = {},
}) {
  const query = `
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
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::text[], $10::jsonb)
    ON CONFLICT (tenant_id, channel_id, external_id)
    WHERE external_id IS NOT NULL AND channel_id IS NOT NULL
    DO UPDATE SET
      full_name = EXCLUDED.full_name,
      username = EXCLUDED.username,
      phone = EXCLUDED.phone,
      email = EXCLUDED.email,
      source = EXCLUDED.source,
      tags = EXCLUDED.tags,
      meta = EXCLUDED.meta,
      updated_at = NOW()
    RETURNING *;
  `;

  const values = [
    tenantId,
    channelId,
    fullName,
    username,
    phone,
    email,
    externalId,
    source,
    tags,
    JSON.stringify(meta || {}),
  ];

  const { rows } = await db.query(query, values);
  return rows[0];
}

module.exports = {
  upsertContact,
};
