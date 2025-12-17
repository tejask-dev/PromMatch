-- ============================================
-- PROM MATCHMAKING DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id TEXT UNIQUE NOT NULL, -- Links to Supabase Auth
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL CHECK (char_length(name) >= 2 AND char_length(name) <= 50),
    bio TEXT CHECK (char_length(bio) <= 500),
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'non-binary', 'other')),
    looking_for TEXT[] DEFAULT ARRAY['male', 'female', 'non-binary', 'other'],
    grade TEXT NOT NULL CHECK (grade IN ('freshman', 'sophomore', 'junior', 'senior')),
    hobbies TEXT[] DEFAULT ARRAY[]::TEXT[],
    personality TEXT CHECK (char_length(personality) >= 50),
    question_answers JSONB DEFAULT '{}'::JSONB,
    socials JSONB DEFAULT '{}'::JSONB,
    profile_pic_url TEXT,
    embedding vector(384), -- MiniLM-L6-v2 produces 384-dim vectors
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for vector similarity search (IVFFlat for speed)
CREATE INDEX IF NOT EXISTS users_embedding_idx ON users 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Index for filtering
CREATE INDEX IF NOT EXISTS users_gender_idx ON users (gender);
CREATE INDEX IF NOT EXISTS users_grade_idx ON users (grade);
CREATE INDEX IF NOT EXISTS users_auth_id_idx ON users (auth_id);

-- ============================================
-- SWIPES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS swipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('yes', 'no', 'super')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, target_user_id) -- Prevent duplicate swipes
);

-- Indexes for swipe lookups
CREATE INDEX IF NOT EXISTS swipes_user_id_idx ON swipes (user_id);
CREATE INDEX IF NOT EXISTS swipes_target_user_id_idx ON swipes (target_user_id);
CREATE INDEX IF NOT EXISTS swipes_action_idx ON swipes (action);

-- ============================================
-- MATCHES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_super_match BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user1_id, user2_id),
    CHECK (user1_id < user2_id) -- Ensures consistent ordering
);

-- Index for match lookups
CREATE INDEX IF NOT EXISTS matches_user1_idx ON matches (user1_id);
CREATE INDEX IF NOT EXISTS matches_user2_idx ON matches (user2_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VECTOR SIMILARITY SEARCH FUNCTION
-- This is the MAGIC - finds similar users at DB level!
-- ============================================
CREATE OR REPLACE FUNCTION find_matches(
    p_user_id UUID,
    p_limit INT DEFAULT 10
)
RETURNS TABLE (
    user_id UUID,
    name TEXT,
    bio TEXT,
    gender TEXT,
    grade TEXT,
    hobbies TEXT[],
    personality TEXT,
    question_answers JSONB,
    socials JSONB,
    profile_pic_url TEXT,
    similarity FLOAT,
    compatibility_percentage INT
) AS $$
DECLARE
    v_user_embedding vector(384);
    v_user_gender TEXT;
    v_user_looking_for TEXT[];
BEGIN
    -- Get current user's data
    SELECT u.embedding, u.gender, u.looking_for
    INTO v_user_embedding, v_user_gender, v_user_looking_for
    FROM users u
    WHERE u.id = p_user_id;

    -- If user has no embedding, return empty
    IF v_user_embedding IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT 
        u.id AS user_id,
        u.name,
        u.bio,
        u.gender,
        u.grade,
        u.hobbies,
        u.personality,
        u.question_answers,
        u.socials,
        u.profile_pic_url,
        -- Cosine similarity (1 - cosine distance)
        (1 - (u.embedding <=> v_user_embedding))::FLOAT AS similarity,
        -- Convert to percentage (0-100)
        LEAST(100, GREATEST(0, ((1 - (u.embedding <=> v_user_embedding) + 1) * 50)::INT)) AS compatibility_percentage
    FROM users u
    WHERE u.id != p_user_id
      AND u.embedding IS NOT NULL
      -- Gender preferences (both ways)
      AND u.gender = ANY(v_user_looking_for)
      AND v_user_gender = ANY(u.looking_for)
      -- Exclude already swiped users
      AND NOT EXISTS (
          SELECT 1 FROM swipes s 
          WHERE s.user_id = p_user_id AND s.target_user_id = u.id
      )
    ORDER BY u.embedding <=> v_user_embedding ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Users can read all profiles (for discovery)
CREATE POLICY "Users can view all profiles" ON users
    FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = auth_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = auth_id);

-- Swipes: users can only see and create their own swipes
CREATE POLICY "Users can view own swipes" ON swipes
    FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text));

CREATE POLICY "Users can create own swipes" ON swipes
    FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text));

-- Matches: users can see matches they're part of
CREATE POLICY "Users can view own matches" ON matches
    FOR SELECT USING (
        user1_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text) OR
        user2_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text)
    );

-- ============================================
-- SERVICE ROLE BYPASS (for backend)
-- ============================================
-- The service role key bypasses RLS, which is what the backend uses

COMMENT ON TABLE users IS 'User profiles for prom matchmaking';
COMMENT ON TABLE swipes IS 'User swipe actions (yes/no/super)';
COMMENT ON TABLE matches IS 'Mutual matches between users';
COMMENT ON FUNCTION find_matches IS 'Vector similarity search for finding compatible matches';
