exports.up = (pgm) => {
  pgm.createTable('leads', {
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
    assigned_user_id: {
      type: 'integer',
      references: 'users',
      onDelete: 'set null',
    },
    title: {
      type: 'varchar(200)',
    },
    status: {
      type: 'varchar(50)',
      notNull: true,
      default: 'new',
    },
    stage: {
      type: 'varchar(50)',
      notNull: true,
      default: 'incoming',
    },
    score: {
      type: 'integer',
      notNull: true,
      default: 0,
    },
    priority: {
      type: 'varchar(30)',
      notNull: true,
      default: 'normal',
    },
    source: {
      type: 'varchar(100)',
      notNull: true,
      default: 'dm',
    },
    notes: {
      type: 'text',
    },
    last_activity_at: {
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

  pgm.addConstraint('leads', 'leads_status_check', {
    check: "status IN ('new', 'open', 'qualified', 'won', 'lost', 'archived')",
  });

  pgm.addConstraint('leads', 'leads_stage_check', {
    check: "stage IN ('incoming', 'contacted', 'engaged', 'proposal', 'negotiation', 'closed')",
  });

  pgm.addConstraint('leads', 'leads_priority_check', {
    check: "priority IN ('low', 'normal', 'high', 'urgent')",
  });
};

exports.down = (pgm) => {
  pgm.dropTable('leads');
};
