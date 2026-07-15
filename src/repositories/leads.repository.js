const db = require('../config/db');

async function upsertLead({
  tenantId,
  contactId,
  assignedUserId = null,
  title = null,
  status = 'new',
  stage = 'incoming',
  score = 0,
  priority = 'normal',
  source = 'dm',
  notes = null,
  lastActivityAt = new Date(),
}, client = db) {
  const query = `
    INSERT INTO leads (
      tenant_id,
      contact_id,
      assigned_user_id,
      title,
      status,
      stage,
      score,
      priority,
      source,
      notes,
      last_activity_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
    ON CONFLICT (tenant_id, contact_id)
    DO UPDATE SET
      assigned_user_id = COALESCE(EXCLUDED.assigned_user_id, leads.assigned_user_id),
      title = COALESCE(EXCLUDED.title, leads.title),
      status = COALESCE(EXCLUDED.status, leads.status),
      stage = CASE
        WHEN leads.stage IN ('won', 'lost') THEN leads.stage
        ELSE EXCLUDED.stage
      END,
      score = GREATEST(leads.score, EXCLUDED.score),
      priority = COALESCE(EXCLUDED.priority, leads.priority),
      source = COALESCE(EXCLUDED.source, leads.source),
      notes = COALESCE(EXCLUDED.notes, leads.notes),
      last_activity_at = GREATEST(leads.last_activity_at, EXCLUDED.last_activity_at),
      updated_at = NOW()
    RETURNING *;
  `;

  const values = [
    tenantId,
    contactId,
    assignedUserId,
    title,
    status,
    stage,
    score,
    priority,
    source,
    notes,
    lastActivityAt,
  ];

  const { rows } = await client.query(query, values);
  return mapLeadRow(rows[0]);
}

async function bumpLeadScore({ tenantId, leadId, scoreDelta, lastActivityAt = new Date() }, client = db) {
  const query = `
    UPDATE leads
    SET
      score = score + $3,
      last_activity_at = GREATEST(last_activity_at, $4),
      updated_at = NOW()
    WHERE tenant_id = $1 AND id = $2
    RETURNING *;
  `;

  const { rows } = await client.query(query, [tenantId, leadId, scoreDelta, lastActivityAt]);
  return rows[0] ? mapLeadRow(rows[0]) : null;
}

async function updateLeadStage({ tenantId, leadId, stage, status = null }, client = db) {
  const query = `
    UPDATE leads
    SET
      stage = $3,
      status = COALESCE($4, status),
      updated_at = NOW()
    WHERE tenant_id = $1 AND id = $2
    RETURNING *;
  `;

  const { rows } = await client.query(query, [tenantId, leadId, stage, status]);
  return rows[0] ? mapLeadRow(rows[0]) : null;
}

function mapLeadRow(row) {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    contactId: row.contact_id,
    assignedUserId: row.assigned_user_id,
    title: row.title,
    status: row.status,
    stage: row.stage,
    score: row.score,
    priority: row.priority,
    source: row.source,
    notes: row.notes,
    lastActivityAt: row.last_activity_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = {
  upsertLead,
  bumpLeadScore,
  updateLeadStage,
};
