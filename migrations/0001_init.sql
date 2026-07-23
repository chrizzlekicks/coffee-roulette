CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE CHECK (username = lower(btrim(username)) AND username <> ''),
    password_hash TEXT NOT NULL,
    session_token UUID UNIQUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_matches (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, match_id)
);

CREATE INDEX user_matches_match_id_idx ON user_matches (match_id);
