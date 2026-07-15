exports.up = (pgm) => {
  pgm.createTable('channels', {
    id: 'id',
    tenant_id: {
      type: 'integer',
      notNull: true,
      references: 'tenants',
      onDelete: 'cascade',
    },
    name: {
      type: 'varchar(150)',
      notNull: true,
    },
    type: {
      type: 'varchar(50)',
      notNull: true,
    },
    provider: {
      type: 'varchar(100)',
      notNull: true,
    },
    external_id: {
      type: 'varchar(150)',
    },
    access_token: {
      type: 'text',
    },
    refresh_token: {
      type: 'text',
    },
    meta: {
      type: 'jsonb',
      notNull: true,
      default: '{}',
    },
    is_active: {
      type: 'boolean',
      notNull: true,
      default: true,
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

  pgm.addConstraint('channels', 'channels_type_check', {
    check: "type IN ('instagram', 'telegram', 'whatsapp', 'website', 'other')",
  });

  pgm.addConstraint('channels', 'channels_tenant_provider_external_unique', {
    unique: ['tenant_id', 'provider', 'external_id'],
  });
};

exports.down = (pgm) => {
  pgm.dropTable('channels');
};
