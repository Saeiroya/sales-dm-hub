-- =========================
-- tenants: کسب‌وکارها / مشتریان سیستم
-- =========================
CREATE TABLE IF NOT EXISTS tenants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    slug            TEXT UNIQUE,
    status          TEXT NOT NULL DEFAULT 'active', -- active | inactive
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- channels: کانال‌های پیام (مثلاً instagram_dm, whatsapp, site_chat)
-- =========================
CREATE TABLE IF NOT EXISTS channels (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type            TEXT NOT NULL, -- instagram_dm | whatsapp | site_chat | ...
    external_id     TEXT,          -- id پیج یا شماره واتساپ
    name            TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- contacts: مخاطبان / لیدها
-- =========================
CREATE TABLE IF NOT EXISTS contacts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    channel_id      UUID REFERENCES channels(id) ON DELETE SET NULL,
    external_id     TEXT,          -- مثلاً instagram user id
    username        TEXT,
    full_name       TEXT,
    phone           TEXT,
    email           TEXT,
    tags            TEXT[] DEFAULT '{}',  -- آرایه تگ‌ها
    lead_score      INTEGER,             -- امتیاز لید در کل
    last_message_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- messages: پیام‌های دریافتی/ارسالی
-- =========================
CREATE TABLE IF NOT EXISTS messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    channel_id      UUID REFERENCES channels(id) ON DELETE SET NULL,
    contact_id      UUID REFERENCES contacts(id) ON DELETE SET NULL,
    direction       TEXT NOT NULL,      -- inbound | outbound
    raw_text        TEXT NOT NULL,      -- متن اصلی پیام
    normalized_text TEXT,               -- نسخه نرمال‌شده برای AI
    intent          TEXT,               -- مثل: question_price, ask_discount, complaint, ...
    intent_score    NUMERIC(5,2),       -- 0 تا 100
    sentiment       TEXT,               -- positive | neutral | negative
    lead_score      INTEGER,            -- امتیاز لید در سطح پیام
    ai_response     TEXT,               -- پیشنهادی پاسخ
    meta            JSONB,              -- هر داده جانبی AI یا وبهوک
    received_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- intent_config: تنظیمات Intent برای هر tenant
-- =========================
CREATE TABLE IF NOT EXISTS intent_config (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    intent_key      TEXT NOT NULL,        -- مثل: question_price
    title           TEXT,
    description     TEXT,
    keywords        TEXT[],               -- لیست کلیدواژه‌های فارسی
    priority        INTEGER DEFAULT 0,    -- برای مرتب‌کردن
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, intent_key)
);
