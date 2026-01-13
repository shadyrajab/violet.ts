CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(20) PRIMARY KEY,
    language VARCHAR(20) NOT NULL DEFAULT 'english',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT language_check CHECK (language IN ('english', 'portuguese', 'spanish', 'korean', 'japanese'))
);

CREATE TABLE IF NOT EXISTS servers (
    server_id VARCHAR(20) PRIMARY KEY,
    language VARCHAR(20) NOT NULL DEFAULT 'english',
    category_id VARCHAR(20),
    channel_id VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT server_language_check CHECK (language IN ('english', 'portuguese', 'spanish', 'korean', 'japanese'))
);

CREATE TABLE IF NOT EXISTS voice_rooms (
    channel_id VARCHAR(20) PRIMARY KEY,
    owner_id VARCHAR(20) NOT NULL,
    admin_ids TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_voice_rooms_owner ON voice_rooms(owner_id);

CREATE TABLE IF NOT EXISTS presets (
    user_id VARCHAR(20) NOT NULL,
    guild_id VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL DEFAULT 'default',
    hide BOOLEAN NOT NULL DEFAULT FALSE,
    lock BOOLEAN NOT NULL DEFAULT FALSE,
    member_ids TEXT[] NOT NULL DEFAULT '{}',
    admin_ids TEXT[] NOT NULL DEFAULT '{}',
    blocked_ids TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, guild_id)
);

CREATE INDEX idx_presets_user ON presets(user_id);
CREATE INDEX idx_presets_guild ON presets(guild_id);

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL,
    stripe_subscription_id VARCHAR(100),
    stripe_customer_id VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    plan_type VARCHAR(20) NOT NULL DEFAULT 'free',
    current_period_end TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT subscription_status_check CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
    CONSTRAINT subscription_plan_check CHECK (plan_type IN ('free', 'basic', 'premium', 'enterprise'))
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);

CREATE TABLE IF NOT EXISTS user_server_subscriptions (
    id UUID PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL,
    server_id VARCHAR(20) NOT NULL,
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, server_id)
);

CREATE INDEX idx_user_server_subs_user ON user_server_subscriptions(user_id);
CREATE INDEX idx_user_server_subs_server ON user_server_subscriptions(server_id);
CREATE INDEX idx_user_server_subs_subscription ON user_server_subscriptions(subscription_id);
