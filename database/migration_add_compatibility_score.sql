-- Migration: Add compatibility_score to matches table
-- Run this in Supabase SQL Editor after the main schema

ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS compatibility_score DECIMAL(5,2) CHECK (compatibility_score >= 0 AND compatibility_score <= 100);

-- Add index for sorting matches by compatibility
CREATE INDEX IF NOT EXISTS matches_compatibility_score_idx ON matches (compatibility_score DESC);

COMMENT ON COLUMN matches.compatibility_score IS 'Compatibility score (0-100) calculated from questionnaire and AI matching';

