/* 014_create_message_analyses.js */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('message_analyses', {
    id: 'id', // serial primary key

    message_id: {
      type: 'integer',
      notNull: true,
      references: '"messages"',
      onDelete: 'cascade'
    },

    // نوع نیت/اینتنت تشخیص داده شده (مثلاً: pricing, complaint, greeting, follow_up)
    intent: {
      type: 'varchar(100)',
      notNull: false
    },

    // امتیاز لید (۰ تا ۱۰۰)
    lead_score: {
      type: 'integer',
      notNull: false
    },

    // پیشنهاد پاسخ کوتاه
    reply_suggestion: {
      type: 'text',
      notNull: false
    },

    // برچسب‌های اضافه (مثلاً ["pricing","discount","whatsapp"])
    tags: {
      type: 'jsonb',
      notNull: false
    },

    // میزان اطمینان مدل برای intent / lead score
    confidence: {
      type: 'numeric(5,4)',
      notNull: false
    },

    // متادیتا آزاد (ورژن مدل، زمان inference و ...)
    metadata: {
      type: 'jsonb',
      notNull: false
    },

    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    }
  });

  // هر پیام فقط یک تحلیل اصلی
  pgm.createIndex('message_analyses', 'message_id', { unique: true });
};

exports.down = pgm => {
  pgm.dropTable('message_analyses');
};
