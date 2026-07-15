exports.up = (pgm) => {
  pgm.createTable('conversations', {
    id: 'id',
    tenant_id: {
      type: 'integer',
      notNull: true,
      references: 'tenants',
      onDelete: 'cascade',
    },
    contact_id: {
      type: 'integer',
      notNull: true,
      references: 'contacts',
      onDelete: 'cascade',
    },
    channel_id: {
      type: 'integer',
      references: 'channels',
      onDelete: 'set null',
    },
    lead_id: {
      type: 'integer',
      references: 'leads',
      onDelete: 'set null',
    },
    status: {
      type: 'varchar(30)',
      notNull: true,
      default: 'open',
    },
    subject: {
      type: 'varchar(200)',
    },
    started_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    last_message_at: {
      type: 'timestamptz',
    },
    closed_at: {
      type: 'timestamptz',
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  pgm.addConstraint('conversations', 'conversations_status_check', {
    check: "status IN ('open', 'pending', 'closed', 'archived')",
  });
};

exports.down = (pgm) => {
  pgm.dropTable('conversations');
};
