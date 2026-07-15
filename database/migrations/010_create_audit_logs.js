exports.up = (pgm) => {
  pgm.createTable('audit_logs', {
    id: 'id',
    tenant_id: {
      type: 'integer',
      notNull: true,
      references: 'tenants',
      onDelete: 'cascade',
    },
    user_id: {
      type: 'integer',
      references: 'users',
      onDelete: 'set null',
    },
    action: {
      type: 'varchar(100)',
      notNull: true,
    },
    entity_type: {
      type: 'varchar(100)',
      notNull: true,
    },
    entity_id: {
      type: 'integer',
    },
    old_data: {
      type: 'jsonb',
    },
    new_data: {
      type: 'jsonb',
    },
    ip_address: {
      type: 'varchar(64)',
    },
    user_agent: {
      type: 'text',
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('audit_logs');
};
