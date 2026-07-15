exports.up = (pgm) => {
  pgm.createTable('users', {
    id: 'id',
    tenant_id: {
      type: 'integer',
      notNull: true,
      references: 'tenants',
      onDelete: 'cascade',
    },
    full_name: {
      type: 'varchar(150)',
      notNull: true,
    },
    email: {
      type: 'varchar(150)',
      notNull: true,
    },
    password_hash: {
      type: 'text',
      notNull: true,
    },
    role: {
      type: 'varchar(50)',
      notNull: true,
      default: 'agent',
    },
    is_active: {
      type: 'boolean',
      notNull: true,
      default: true,
    },
    last_login_at: {
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

  pgm.addConstraint('users', 'users_role_check', {
    check: "role IN ('owner', 'admin', 'manager', 'agent', 'viewer')",
  });

  pgm.addConstraint('users', 'users_tenant_email_unique', {
    unique: ['tenant_id', 'email'],
  });
};

exports.down = (pgm) => {
  pgm.dropTable('users');
};
