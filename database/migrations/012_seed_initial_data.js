exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO tenants (
      id,
      name,
      slug,
      status,
      plan,
      timezone,
      locale,
      created_at,
      updated_at
    )
    VALUES (
      1,
      'Default Tenant',
      'default-tenant',
      'active',
      'starter',
      'Asia/Tehran',
      'fa-IR',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
  `);

  pgm.sql(`
    INSERT INTO users (
      tenant_id,
      full_name,
      email,
      password_hash,
      role,
      is_active,
      created_at,
      updated_at
    )
    VALUES (
      1,
      'System Owner',
      'owner@example.com',
      '$2b$10$replace_this_with_real_bcrypt_hash',
      'owner',
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (tenant_id, email) DO NOTHING;
  `);

  pgm.sql(`
    INSERT INTO tenant_settings (
      tenant_id,
      setting_key,
      setting_value,
      created_at,
      updated_at
    )
    VALUES
      (
        1,
        'lead_scoring',
        '{"rules":{"pricing":10,"buy":15,"urgent":20}}'::jsonb,
        NOW(),
        NOW()
      ),
      (
        1,
        'message_classification',
        '{"buy_keywords":["خرید","قیمت","موجودی"],"support_keywords":["خراب","مشکل","پشتیبانی"]}'::jsonb,
        NOW(),
        NOW()
      )
    ON CONFLICT (tenant_id, setting_key) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM tenant_settings
    WHERE tenant_id = 1
      AND setting_key IN ('lead_scoring', 'message_classification');
  `);

  pgm.sql(`
    DELETE FROM users
    WHERE tenant_id = 1
      AND email = 'owner@example.com';
  `);

  pgm.sql(`
    DELETE FROM tenants
    WHERE id = 1;
  `);
};
