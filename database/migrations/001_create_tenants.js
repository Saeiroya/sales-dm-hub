exports.up = (pgm) => {
  pgm.createTable('tenants', {
    id: 'id',
    name: {
      type: 'varchar(150)',
      notNull: true,
    },
    slug: {
      type: 'varchar(100)',
      notNull: true,
      unique: true,
    },
    status: {
      type: 'varchar(30)',
      notNull: true,
      default: 'active',
    },
    plan: {
      type: 'varchar(50)',
      notNull: true,
      default: 'starter',
    },
    timezone: {
      type: 'varchar(100)',
      notNull: true,
      default: 'Asia/Tehran',
    },
    locale: {
      type: 'varchar(20)',
      notNull: true,
      default: 'fa-IR',
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

  pgm.addConstraint('tenants', 'tenants_status_check', {
    check: "status IN ('active', 'inactive', 'suspended')",
  });
};

exports.down = (pgm) => {
  pgm.dropTable('tenants');
};
