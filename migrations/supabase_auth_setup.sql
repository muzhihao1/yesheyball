-- ============================================
-- Supabase Auth Migration - Database Setup
-- ============================================
-- 运行此 SQL 在 Supabase SQL Editor 中
-- 目的：准备数据库架构以支持 Supabase Auth 迁移

-- Step 1: 添加迁移跟踪列到 users 表
-- ============================================
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS supabase_user_id uuid,
ADD COLUMN IF NOT EXISTS migrated_to_supabase boolean DEFAULT false;

-- 添加注释
COMMENT ON COLUMN public.users.supabase_user_id IS '关联到 auth.users.id 的外键';
COMMENT ON COLUMN public.users.migrated_to_supabase IS '标记用户是否已迁移到 Supabase Auth';

-- Step 2: 创建索引以提升查询性能
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON public.users(supabase_user_id);
CREATE INDEX IF NOT EXISTS idx_users_migrated ON public.users(migrated_to_supabase);

-- Step 3: 创建触发器函数 - 自动同步新用户
-- ============================================
-- 当用户通过 Supabase Auth 注册时，自动在 public.users 创建记录

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- 在 public.users 创建对应记录
  INSERT INTO public.users (
    id,
    supabase_user_id,
    email,
    first_name,
    last_name,
    username,
    migrated_to_supabase,
    level,
    exp,
    streak,
    total_days,
    completed_tasks,
    total_time,
    achievements,
    current_level,
    current_exercise,
    completed_exercises
  )
  VALUES (
    gen_random_uuid()::varchar, -- 保持现有的 varchar id 结构
    new.id,                      -- 关联到 auth.users.id
    new.email,
    COALESCE(new.raw_user_meta_data->>'firstName', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'lastName',
    lower(split_part(new.email, '@', 1)) || '-' || substring(new.id::text, 1, 8),
    true,                        -- 新用户已经在 Supabase Auth 中
    1,                           -- 默认 level
    0,                           -- 默认 exp
    0,                           -- 默认 streak
    0,                           -- 默认 total_days
    0,                           -- 默认 completed_tasks
    0,                           -- 默认 total_time
    '[]'::jsonb,                 -- 默认 achievements
    1,                           -- 默认 current_level
    1,                           -- 默认 current_exercise
    '{}'::jsonb                  -- 默认 completed_exercises
  )
  ON CONFLICT (email) DO UPDATE
  SET
    supabase_user_id = EXCLUDED.supabase_user_id,
    migrated_to_supabase = true;

  RETURN new;
END;
$$;

-- Step 4: 创建触发器
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- Step 5: 验证设置
-- ============================================
-- 检查新列是否创建成功
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
  AND column_name IN ('supabase_user_id', 'migrated_to_supabase');

-- 检查触发器是否创建成功
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Step 6: 统计当前迁移状态
-- ============================================
-- Note: password_hash column check is conditional - only counts if column exists
SELECT
  COUNT(*) FILTER (WHERE migrated_to_supabase = true) as migrated_users,
  COUNT(*) FILTER (WHERE migrated_to_supabase = false) as pending_users,
  COUNT(*) as total_users
FROM public.users;

-- ============================================
-- 迁移准备完成！
-- ============================================
-- 下一步：在应用代码中实现懒迁移逻辑
