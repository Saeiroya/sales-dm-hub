exports.up = (pgm) => {
  pgm.createIndex('users', 'tenant_id');
  pgm.createIndex('users', 'email');

  pgm.createIndex('channels', 'tenant_id');
  pgm.createIndex('channels', 'type');

  pgm.createIndex('contacts', ['tenant_id', 'phone']);
  pgm.createIndex('contacts', ['tenant_id', 'email']);

  pgm.sql(`
    CREATE UNIQUE INDEX contacts_tenant_channel_external_unique
    ON contacts(tenant_id, channel_id, external_id)
    WHERE external_id IS NOT NULL AND channel_id IS NOT NULL;
  `);

  pgm.sql(`
    CREATE UNIQUE INDEX leads_tenant_contact_unique
    ON leads(tenant_id, contact_id);
  `);

  pgm.createIndex('leads', ['tenant_id', 'status']);
  pgm.createIndex('leads', ['tenant_id', 'score']);
  pgm.createIndex('leads', ['tenant_id', 'assigned_user_id']);

  pgm.createIndex('conversations', ['tenant_id', 'contact_id']);

  pgm.sql(`
    CREATE INDEX conversations_tenant_channel_last_message_idx
    ON conversations(tenant_id, channel_id, last_message_at DESC);
  `);

  pgm.createIndex('messages', ['tenant_id', 'conversation_id']);
  pgm.createIndex('messages', ['tenant_id', 'sent_at']);

  pgm.createIndex('webhook_events', ['tenant_id', 'status']);
  pgm.createIndex('webhook_events', ['tenant_id', 'received_at']);

  pgm.createIndex('audit_logs', ['tenant_id', 'created_at']);
  pgm.createIndex('audit_logs', ['tenant_id', 'entity_type', 'entity_id']);
};

exports.down = (pgm) => {
  pgm.dropIndex('audit_logs', ['tenant_id', 'entity_type', 'entity_id']);
  pgm.dropIndex('audit_logs', ['tenant_id', 'created_at']);

  pgm.dropIndex('webhook_events', ['tenant_id', 'received_at']);
  pgm.dropIndex('webhook_events', ['tenant_id', 'status']);

  pgm.dropIndex('messages', ['tenant_id', 'sent_at']);
  pgm.dropIndex('messages', ['tenant_id', 'conversation_id']);

  pgm.sql(`
    DROP INDEX IF EXISTS conversations_tenant_channel_last_message_idx;
  `);

  pgm.dropIndex('conversations', ['tenant_id', 'contact_id']);

  pgm.dropIndex('leads', ['tenant_id', 'assigned_user_id']);
  pgm.dropIndex('leads', ['tenant_id', 'score']);
  pgm.dropIndex('leads', ['tenant_id', 'status']);

  pgm.sql(`
    DROP INDEX IF EXISTS leads_tenant_contact_unique;
  `);

  pgm.sql(`
    DROP INDEX IF EXISTS contacts_tenant_channel_external_unique;
  `);

  pgm.dropIndex('contacts', ['tenant_id', 'email']);
  pgm.dropIndex('contacts', ['tenant_id', 'phone']);

  pgm.dropIndex('channels', 'type');
  pgm.dropIndex('channels', 'tenant_id');

  pgm.dropIndex('users', 'email');
  pgm.dropIndex('users', 'tenant_id');
};
