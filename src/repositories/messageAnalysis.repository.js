// src/repositories/messageAnalysis.repository.js
const pool = require('../config/db');

async function createMessageAnalysis({
  messageId,
  intent,
  leadScore,
  replySuggestion,
  tags,
  confidence,
  metadata
}) {
  const query = `
    INSERT INTO message_analyses
      (message_id, intent, lead_score, reply_suggestion, tags, confidence, metadata)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;

  const values = [
    messageId,
    intent || null,
    typeof leadScore === 'number' ? leadScore : null,
    replySuggestion || null,
    tags && tags.length ? JSON.stringify(tags) : null,
    typeof confidence === 'number' ? confidence : null,
    metadata ? JSON.stringify(metadata) : null
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
}

module.exports = {
  createMessageAnalysis
};
