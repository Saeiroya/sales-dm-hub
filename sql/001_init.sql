CREATE TABLE IF NOT EXISTS tenants (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id),
    external_id TEXT NOT NULL,
    name TEXT,
    phone TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (tenant_id, external_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES leads(id),
    message_text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
