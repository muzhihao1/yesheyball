-- Migration: Add sort_order field to specialized_trainings table
-- Purpose: Enable ordered display of 8 specialized training categories
-- Date: 2025-01-13

-- Add sort_order column if it doesn't exist
ALTER TABLE specialized_trainings
ADD COLUMN IF NOT EXISTS sort_order INTEGER;

-- Create index for efficient sorting queries
CREATE INDEX IF NOT EXISTS idx_specialized_trainings_sort_order
ON specialized_trainings(sort_order);

-- Update comment for the table
COMMENT ON COLUMN specialized_trainings.sort_order IS 'Display order for training categories (1-8)';
