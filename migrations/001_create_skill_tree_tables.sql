-- Migration: Create Skill Tree System Tables
-- Created: 2025-11-09
-- Description: Adds 4 tables for skill tree framework (S2)

-- 1. Skills table - stores skill nodes
CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  name VARCHAR(256) NOT NULL,
  description TEXT,
  position JSONB NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. Skill dependencies table - defines skill tree structure (edges)
CREATE TABLE IF NOT EXISTS skill_dependencies (
  source_skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  target_skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (source_skill_id, target_skill_id)
);

-- 3. Skill unlock conditions table - defines requirements for unlocking skills
CREATE TABLE IF NOT EXISTS skill_unlock_conditions (
  id SERIAL PRIMARY KEY,
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  condition_type VARCHAR(50) NOT NULL,
  condition_value TEXT NOT NULL,
  required_count INTEGER NOT NULL DEFAULT 1,
  condition_description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. User skill progress table - tracks which skills users have unlocked
CREATE TABLE IF NOT EXISTS user_skill_progress (
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP NOT NULL DEFAULT NOW(),
  unlock_context JSONB NOT NULL DEFAULT '{}',
  PRIMARY KEY (user_id, skill_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_skill_unlock_conditions_skill_id ON skill_unlock_conditions(skill_id);
CREATE INDEX IF NOT EXISTS idx_user_skill_progress_user_id ON user_skill_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skill_progress_skill_id ON user_skill_progress(skill_id);

-- Verify tables created
SELECT table_name
FROM information_schema.tables
WHERE table_name IN ('skills', 'skill_dependencies', 'skill_unlock_conditions', 'user_skill_progress')
ORDER BY table_name;
