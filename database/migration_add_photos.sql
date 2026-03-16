-- ============================================
-- MIGRATION: Add user_photos table
-- Run this in Supabase SQL Editor
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS user_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, order_index)
);

CREATE INDEX IF NOT EXISTS user_photos_user_id_idx ON user_photos (user_id);
CREATE INDEX IF NOT EXISTS user_photos_primary_idx ON user_photos (user_id, is_primary);

-- Add compatibility_score to matches if not already present
ALTER TABLE matches ADD COLUMN IF NOT EXISTS compatibility_score DECIMAL(5,2);
CREATE INDEX IF NOT EXISTS matches_compatibility_idx ON matches (compatibility_score DESC);

-- Add school column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS school TEXT;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE user_photos ENABLE ROW LEVEL SECURITY;

-- Anyone can view photos (for discovery/swipe cards)
CREATE POLICY "Anyone can view photos" ON user_photos
    FOR SELECT USING (true);

-- Users can manage their own photos
CREATE POLICY "Users can insert own photos" ON user_photos
    FOR INSERT WITH CHECK (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text)
    );

CREATE POLICY "Users can delete own photos" ON user_photos
    FOR DELETE USING (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text)
    );

CREATE POLICY "Users can update own photos" ON user_photos
    FOR UPDATE USING (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text)
    );

-- ============================================
-- SUPABASE STORAGE SETUP (run separately)
-- ============================================
-- 1. Go to Supabase Dashboard → Storage
-- 2. Create bucket named: profile-photos
-- 3. Set to Public
-- 4. Add storage policy:
--    INSERT: authenticated users, condition: (storage.foldername(name))[1] = auth.uid()::text
