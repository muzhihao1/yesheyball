-- Migration: Seed Skill Tree Data
-- Created: 2025-11-09
-- Description: Populates initial 8-node skill tree aligned with 8-level growth path

-- Clear existing data (for development/testing - comment out in production if preserving user progress)
-- DELETE FROM user_skill_progress;
-- DELETE FROM skill_unlock_conditions;
-- DELETE FROM skill_dependencies;
-- DELETE FROM skills;

-- ============================================
-- 1. Insert 8 Skill Nodes (aligned with 8 levels)
-- ============================================

INSERT INTO skills (id, name, description, position, metadata) VALUES
  (1, '初窥门径', '掌握台球基础：正确的握杆、站位和基本击球姿势',
   '{"x": 400, "y": 100}',
   '{"icon": "🌱", "color": "#10b981", "level": 1}'),

  (2, '小有所成', '熟练运用手架技巧，建立稳定的瞄准系统',
   '{"x": 400, "y": 250}',
   '{"icon": "🎯", "color": "#3b82f6", "level": 2}'),

  (3, '渐入佳境', '掌握球控与走位，理解母球控制的基本原理',
   '{"x": 400, "y": 400}',
   '{"icon": "⚡", "color": "#8b5cf6", "level": 3}'),

  (4, '炉火纯青', '发力平顺流畅，能够稳定控制击球力度与节奏',
   '{"x": 400, "y": 550}',
   '{"icon": "💫", "color": "#ec4899", "level": 4}'),

  (5, '登堂入室', '运用高级球技：塞球、低杆、高杆的精准控制',
   '{"x": 400, "y": 700}',
   '{"icon": "🎓", "color": "#f59e0b", "level": 5}'),

  (6, '超群绝伦', '战术思维成熟，能够规划多杆走位与整体布局',
   '{"x": 400, "y": 850}',
   '{"icon": "🏆", "color": "#ef4444", "level": 6}'),

  (7, '登峰造极', '大师级技巧：复杂球型解决、精准控制、战术运用',
   '{"x": 400, "y": 1000}',
   '{"icon": "👑", "color": "#a855f7", "level": 7}'),

  (8, '出神入化', '完美掌控台球艺术，融会贯通所有技术与战术',
   '{"x": 400, "y": 1150}',
   '{"icon": "⭐", "color": "#fbbf24", "level": 8}')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for skills table
SELECT setval('skills_id_seq', (SELECT MAX(id) FROM skills));

-- ============================================
-- 2. Define Skill Dependencies (Linear Path)
-- ============================================
-- Each skill requires the previous skill to be unlocked

INSERT INTO skill_dependencies (source_skill_id, target_skill_id) VALUES
  (1, 2),  -- 初窥门径 → 小有所成
  (2, 3),  -- 小有所成 → 渐入佳境
  (3, 4),  -- 渐入佳境 → 炉火纯青
  (4, 5),  -- 炉火纯青 → 登堂入室
  (5, 6),  -- 登堂入室 → 超群绝伦
  (6, 7),  -- 超群绝伦 → 登峰造极
  (7, 8)   -- 登峰造极 → 出神入化
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. Define Unlock Conditions
-- ============================================

-- Skill 1: 初窥门径 (Starting node - no conditions)
-- This skill is unlocked by default for all users

-- Skill 2: 小有所成
INSERT INTO skill_unlock_conditions (skill_id, condition_type, condition_value, required_count, condition_description) VALUES
  (2, 'LEVEL', '2', 1, '达到等级 2'),
  (2, 'COURSE', '5', 1, '完成 5 个训练课程')
ON CONFLICT DO NOTHING;

-- Skill 3: 渐入佳境
INSERT INTO skill_unlock_conditions (skill_id, condition_type, condition_value, required_count, condition_description) VALUES
  (3, 'LEVEL', '3', 1, '达到等级 3'),
  (3, 'ACHIEVEMENT', '2', 1, '解锁【坚持训练】成就'),
  (3, 'COURSE', '15', 1, '完成 15 个训练课程')
ON CONFLICT DO NOTHING;

-- Skill 4: 炉火纯青
INSERT INTO skill_unlock_conditions (skill_id, condition_type, condition_value, required_count, condition_description) VALUES
  (4, 'LEVEL', '4', 1, '达到等级 4'),
  (4, 'DAILY_GOAL', '10', 1, '完成 10 个每日目标'),
  (4, 'COURSE', '25', 1, '完成 25 个训练课程')
ON CONFLICT DO NOTHING;

-- Skill 5: 登堂入室
INSERT INTO skill_unlock_conditions (skill_id, condition_type, condition_value, required_count, condition_description) VALUES
  (5, 'LEVEL', '5', 1, '达到等级 5'),
  (5, 'ACHIEVEMENT', '5', 1, '解锁 5 个成就'),
  (5, 'COURSE', '40', 1, '完成 40 个训练课程')
ON CONFLICT DO NOTHING;

-- Skill 6: 超群绝伦
INSERT INTO skill_unlock_conditions (skill_id, condition_type, condition_value, required_count, condition_description) VALUES
  (6, 'LEVEL', '6', 1, '达到等级 6'),
  (6, 'ACHIEVEMENT', '8', 1, '解锁 8 个成就'),
  (6, 'DAILY_GOAL', '30', 1, '完成 30 个每日目标')
ON CONFLICT DO NOTHING;

-- Skill 7: 登峰造极
INSERT INTO skill_unlock_conditions (skill_id, condition_type, condition_value, required_count, condition_description) VALUES
  (7, 'LEVEL', '7', 1, '达到等级 7'),
  (7, 'ACHIEVEMENT', '12', 1, '解锁 12 个成就'),
  (7, 'COURSE', '80', 1, '完成 80 个训练课程')
ON CONFLICT DO NOTHING;

-- Skill 8: 出神入化 (Final node - highest requirements)
INSERT INTO skill_unlock_conditions (skill_id, condition_type, condition_value, required_count, condition_description) VALUES
  (8, 'LEVEL', '8', 1, '达到等级 8'),
  (8, 'ACHIEVEMENT', '20', 1, '解锁所有 20 个成就'),
  (8, 'DAILY_GOAL', '100', 1, '完成 100 个每日目标'),
  (8, 'COURSE', '121', 1, '完成所有 121 个训练课程')
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. Verify Data Inserted
-- ============================================

-- Count skills
SELECT COUNT(*) as skill_count FROM skills;
-- Expected: 8

-- Count dependencies
SELECT COUNT(*) as dependency_count FROM skill_dependencies;
-- Expected: 7

-- Count unlock conditions
SELECT COUNT(*) as condition_count FROM skill_unlock_conditions;
-- Expected: 24 (3+3+3+3+3+3+3+3)

-- Show skill tree structure
SELECT
  s.id,
  s.name,
  COUNT(DISTINCT suc.id) as condition_count,
  COUNT(DISTINCT sd.target_skill_id) as dependency_count
FROM skills s
LEFT JOIN skill_unlock_conditions suc ON s.id = suc.skill_id
LEFT JOIN skill_dependencies sd ON s.id = sd.source_skill_id
GROUP BY s.id, s.name
ORDER BY s.id;
