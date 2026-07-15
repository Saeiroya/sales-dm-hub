exports.up = (pgm) => {
  pgm.createTable('tenant_settings', {
    id: 'id',
    tenant_id: {
      type: 'integer',
      notNull: true,
      references: 'tenants',
      onDelete: 'cascade',
    },
    setting_key: {
      type: 'varchar(100)',
      notNull: true,
    },
    setting_value: {
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

  pgm.addConstraint('tenant_settings', 'tenant_settings_tenant_key_unique', {
    unique: ['tenant_id', 'setting_key'],
  });
};

exports.down = (pgm) => {
  pgm.dropTable('tenant_settings');
};
