exports.up = (pgm) => {
  pgm.createTable('messages', {
    id: 'id',
    tenant_id: {
      type: 'integer',
      notNull: true,
      references: 'tenants',
      onDelete: 'cascade',
    },
    conversation_id: {
      type: 'integer',
      notNull: true,
      references: 'conversations',
      onDelete: 'cascade',
    },
    sender_type: {
      type: 'varchar(30)',
      notNull: true,
    },
    sender_id: {
      type: 'integer',
    },
    message_type: {
      type: 'varchar(30)',
      notNull: true,
      default: 'text',
    },
    content: {
      type: 'text',
    },
    media_url: {
      type: 'text',
    },
    external_message_id: {
      type: 'varchar(150)',
    },
    is_read: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    sent_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  pgm.addConstraint('messages', 'messages_sender_type_check', {
    check: "sender_type IN ('contact', 'user', 'system', 'bot')",
  });

  pgm.addConstraint('messages', 'messages_type_check', {
    check: "message_type IN ('text', 'image', 'video', 'audio', 'file', 'template', 'system')",
  });
};

exports.down = (pgm) => {
  pgm.dropTable('messages');
};
