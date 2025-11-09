-- Migration: Create Daily Goals System Tables
-- Created: 2025-11-09
-- Description: Adds goal_templates and user_daily_goals tables for daily goals feature

-- Create goal_templates table
CREATE TABLE IF NOT EXISTS goal_templates (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'EASY',
  reward_xp INTEGER NOT NULL DEFAULT 10,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create user_daily_goals table
CREATE TABLE IF NOT EXISTS user_daily_goals (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  goal_template_id INTEGER NOT NULL REFERENCES goal_templates(id),
  date TIMESTAMP NOT NULL,
  target_value INTEGER NOT NULL,
  current_value INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_daily_goals_user_id ON user_daily_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_goals_date ON user_daily_goals(date);
CREATE INDEX IF NOT EXISTS idx_user_daily_goals_completed ON user_daily_goals(is_completed);
CREATE INDEX IF NOT EXISTS idx_goal_templates_active ON goal_templates(active);

-- Add comments
COMMENT ON TABLE goal_templates IS 'Reusable daily goal template definitions';
COMMENT ON TABLE user_daily_goals IS 'User-specific daily goal instances with progress tracking';

COMMENT ON COLUMN goal_templates.type IS 'Goal type: SESSION_COUNT, TOTAL_DURATION, MIN_RATING';
COMMENT ON COLUMN goal_templates.difficulty IS 'Goal difficulty: EASY, MEDIUM, HARD';
COMMENT ON COLUMN user_daily_goals.target_value IS 'Target value to complete the goal (e.g., 2 sessions, 20 minutes)';
COMMENT ON COLUMN user_daily_goals.current_value IS 'Current progress towards target';
