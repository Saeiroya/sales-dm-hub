exports.up = (pgm) => {
  pgm.createTable('webhook_events', {
    id: 'id',
    tenant_id: {
      type: 'integer',
      notNull: true,
      references: 'tenants',
      onDelete: 'cascade',
    },
    channel_id: {
      type: 'integer',
      references: 'channels',
      onDelete: 'set null',
    },
    event_type: {
      type: 'varchar(100)',
      notNull: true,
    },
    payload: {
      type: 'jsonb',
      notNull: true,
      default: '{}',
    },
    status: {
      type: 'varchar(30)',
      notNull: true,
      default: 'pending',
    },
    error_message: {
      type: 'text',
    },
    received_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    processed_at: {
      type: 'timestamptz',
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  pgm.addConstraint('webhook_events', 'webhook_events_status_check', {
    check: "status IN ('pending', 'processed', 'failed', 'ignored')",
  });
};

exports.down = (pgm) => {
  pgm.dropTable('webhook_events');
};
