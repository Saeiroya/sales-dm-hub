/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE messages
    ADD COLUMN IF NOT EXISTS external_message_id text;
  `);

  pgm.sql(`
    CREATE UNIQUE INDEX IF NOT EXISTS messages_tenant_external_message_id_uq
    ON messages (tenant_id, external_message_id)
    WHERE external_message_id IS NOT NULL;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP INDEX IF EXISTS messages_tenant_external_message_id_uq;
  `);

  pgm.sql(`
    ALTER TABLE messages
    DROP COLUMN IF EXISTS external_message_id;
  `);
};
