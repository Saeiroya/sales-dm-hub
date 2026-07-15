exports.up = (pgm) => {
  pgm.createTable('contacts', {
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
    full_name: {
      type: 'varchar(150)',
    },
    username: {
      type: 'varchar(100)',
    },
    phone: {
      type: 'varchar(30)',
    },
    email: {
      type: 'varchar(150)',
    },
    external_id: {
      type: 'varchar(150)',
    },
    source: {
      type: 'varchar(100)',
      notNull: true,
      default: 'manual',
    },
    tags: {
      type: 'text[]',
      notNull: true,
      default: '{}',
    },
    meta: {
      type: 'jsonb',
      notNull: true,
      default: '{}',
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
};

exports.down = (pgm) => {
  pgm.dropTable('contacts');
};
