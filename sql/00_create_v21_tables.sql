-- ============================================================================
-- V2.1 Training System: Core Tables Creation (Fixed Version)
-- ============================================================================
-- 修复版：匹配实际数据库结构 (users.id = uuid)
-- 只创建V2.1训练系统核心表，避免与现有表冲突
-- 作者: 耶氏台球学院
-- 日期: 2025-01-10
-- ============================================================================

-- 启用UUID生成功能（如果尚未启用）
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

BEGIN;

-- ============================================================================
-- 1. Training Levels (训练等级表)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "training_levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level_number" integer NOT NULL UNIQUE,
	"title" varchar(100) NOT NULL,
	"description" text,
	"prerequisite_level_id" uuid,
	"order_index" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- 自引用外键（Level的前置条件）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'training_levels_prerequisite_level_id_fk'
    ) THEN
        ALTER TABLE "training_levels"
        ADD CONSTRAINT "training_levels_prerequisite_level_id_fk"
        FOREIGN KEY("prerequisite_level_id")
        REFERENCES "training_levels"("id")
        ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;

-- ============================================================================
-- 2. Training Skills (技能表)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "training_skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level_id" uuid NOT NULL,
	"skill_name" varchar(100) NOT NULL,
	"skill_order" integer NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- 外键约束
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'training_skills_level_id_fk'
    ) THEN
        ALTER TABLE "training_skills"
        ADD CONSTRAINT "training_skills_level_id_fk"
        FOREIGN KEY("level_id")
        REFERENCES "training_levels"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
END $$;

-- ============================================================================
-- 3. Sub Skills (子技能表)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "sub_skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"skill_id" uuid NOT NULL,
	"sub_skill_name" varchar(100) NOT NULL,
	"sub_skill_order" integer NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- 外键约束
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'sub_skills_skill_id_fk'
    ) THEN
        ALTER TABLE "sub_skills"
        ADD CONSTRAINT "sub_skills_skill_id_fk"
        FOREIGN KEY("skill_id")
        REFERENCES "training_skills"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
END $$;

-- 唯一约束（防止同一技能下重复的子技能名称）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'sub_skills_skill_id_sub_skill_name_key'
    ) THEN
        ALTER TABLE "sub_skills"
        ADD CONSTRAINT "sub_skills_skill_id_sub_skill_name_key"
        UNIQUE ("skill_id", "sub_skill_name");
    END IF;
END $$;

-- ============================================================================
-- 4. Training Units (训练单元表)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "training_units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sub_skill_id" uuid NOT NULL,
	"unit_type" varchar(20) NOT NULL,
	"unit_order" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"content" jsonb NOT NULL,
	"xp_reward" integer DEFAULT 10,
	"estimated_minutes" integer DEFAULT 5,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- 外键约束
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'training_units_sub_skill_id_fk'
    ) THEN
        ALTER TABLE "training_units"
        ADD CONSTRAINT "training_units_sub_skill_id_fk"
        FOREIGN KEY("sub_skill_id")
        REFERENCES "sub_skills"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
END $$;

-- ============================================================================
-- 5. User Training Progress (用户训练进度表)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "user_training_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL, -- 修复：匹配实际数据库users.id为uuid类型
	"level_id" uuid NOT NULL,
	"unit_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'not_started' NOT NULL,
	"progress_data" jsonb,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- 外键约束
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_training_progress_user_id_fk'
    ) THEN
        ALTER TABLE "user_training_progress"
        ADD CONSTRAINT "user_training_progress_user_id_fk"
        FOREIGN KEY("user_id")
        REFERENCES "users"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_training_progress_level_id_fk'
    ) THEN
        ALTER TABLE "user_training_progress"
        ADD CONSTRAINT "user_training_progress_level_id_fk"
        FOREIGN KEY("level_id")
        REFERENCES "training_levels"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_training_progress_unit_id_fk'
    ) THEN
        ALTER TABLE "user_training_progress"
        ADD CONSTRAINT "user_training_progress_unit_id_fk"
        FOREIGN KEY("unit_id")
        REFERENCES "training_units"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
END $$;

-- 唯一索引
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'user_training_progress_user_unit_unique'
    ) THEN
        CREATE UNIQUE INDEX "user_training_progress_user_unit_unique"
        ON "user_training_progress" USING btree ("user_id","unit_id");
    END IF;
END $$;

-- ============================================================================
-- 6. Specialized Trainings (专项训练表) - 可选
-- ============================================================================
CREATE TABLE IF NOT EXISTS "specialized_trainings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"skill_category" varchar(50) NOT NULL,
	"training_name" varchar(100) NOT NULL,
	"description" text,
	"difficulty_level" integer DEFAULT 1,
	"thumbnail_url" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- ============================================================================
-- 7. Specialized Training Plans (专项训练计划表) - 可选
-- ============================================================================
CREATE TABLE IF NOT EXISTS "specialized_training_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"training_id" uuid NOT NULL,
	"plan_order" integer NOT NULL,
	"exercise_name" varchar(200) NOT NULL,
	"exercise_description" text,
	"demo_video_url" varchar(500),
	"target_metrics" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- 外键约束
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'specialized_training_plans_training_id_fk'
    ) THEN
        ALTER TABLE "specialized_training_plans"
        ADD CONSTRAINT "specialized_training_plans_training_id_fk"
        FOREIGN KEY("training_id")
        REFERENCES "specialized_trainings"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
END $$;

COMMIT;

-- ============================================================================
-- 验证表创建
-- ============================================================================

DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN (
        'training_levels',
        'training_skills',
        'sub_skills',
        'training_units',
        'user_training_progress'
    );

    RAISE NOTICE '=========================================';
    RAISE NOTICE 'V2.1 训练系统表创建验证';
    RAISE NOTICE '=========================================';
    RAISE NOTICE '核心表数量: %/5', table_count;

    IF table_count = 5 THEN
        RAISE NOTICE '✅ V2.1 核心表创建成功！';
        RAISE NOTICE '可以开始导入训练数据';
    ELSE
        RAISE WARNING '⚠️  表创建不完整，期望5个核心表，实际%个', table_count;
    END IF;

    RAISE NOTICE '=========================================';
END $$;

-- ============================================================================
-- 使用说明
-- ============================================================================
--
-- 执行方式:
-- 1. 在Supabase SQL Editor中复制粘贴本文件全部内容
-- 2. 点击 "Run" 执行
-- 3. 检查输出的验证信息
--
-- 注意事项:
-- - 使用 CREATE TABLE IF NOT EXISTS 避免重复创建
-- - 使用 DO $$ 块条件性添加约束，避免重复约束错误
-- - user_training_progress.user_id 修改为uuid类型以匹配实际数据库users.id
-- - 所有表使用UUID主键提高性能和扩展性
--
-- 回滚方法:
-- DROP TABLE IF EXISTS user_training_progress CASCADE;
-- DROP TABLE IF EXISTS training_units CASCADE;
-- DROP TABLE IF EXISTS sub_skills CASCADE;
-- DROP TABLE IF EXISTS training_skills CASCADE;
-- DROP TABLE IF EXISTS training_levels CASCADE;
-- DROP TABLE IF EXISTS specialized_training_plans CASCADE;
-- DROP TABLE IF EXISTS specialized_trainings CASCADE;
-- ============================================================================
