const { pool } = require('../config');

async function upsertLead({ tenantId, externalId, name, phone, score, status }) {
  const query = `
    INSERT INTO public.leads (
      tenant_id,
      external_id,
      name,
      phone,
      score,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (tenant_id, external_id)
    DO UPDATE SET
      name = EXCLUDED.name,
      phone = EXCLUDED.phone,
      score = EXCLUDED.score,
      status = EXCLUDED.status,
      updated_at = NOW()
    RETURNING id, tenant_id, external_id, name, phone, score, status, created_at, updated_at;
  `;

  const values = [tenantId, externalId, name, phone, score, status];
  const result = await pool.query(query, values);
  return result.rows[0];
}

module.exports = {
  upsertLead,
};
