-- ============================================================================
-- V2.1 Training System: 紧急修复 - 添加UNIQUE约束到sub_skills表
-- ============================================================================
-- 修复原因: sub_skills表缺少UNIQUE约束，导致ON CONFLICT子句无法工作
-- 错误信息: ERROR: 42P10: there is no unique or exclusion constraint matching
--           the ON CONFLICT specification
-- 作者: 耶氏台球学院
-- 日期: 2025-01-10
-- ============================================================================

-- 步骤1: 检查是否存在重复数据（应该不存在，因为表刚创建）
DO $$
DECLARE
    duplicate_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT skill_id, sub_skill_name, COUNT(*)
        FROM sub_skills
        GROUP BY skill_id, sub_skill_name
        HAVING COUNT(*) > 1
    ) duplicates;

    IF duplicate_count > 0 THEN
        RAISE WARNING '⚠️  警告：发现 % 组重复的子技能数据，请先清理', duplicate_count;
        RAISE EXCEPTION '无法添加UNIQUE约束，因为存在重复数据';
    ELSE
        RAISE NOTICE '✅ 检查通过：sub_skills表中无重复数据';
    END IF;
END $$;

-- 步骤2: 添加UNIQUE约束
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'sub_skills_skill_id_sub_skill_name_key'
    ) THEN
        ALTER TABLE "sub_skills"
        ADD CONSTRAINT "sub_skills_skill_id_sub_skill_name_key"
        UNIQUE ("skill_id", "sub_skill_name");

        RAISE NOTICE '✅ UNIQUE约束添加成功！';
        RAISE NOTICE '约束名称: sub_skills_skill_id_sub_skill_name_key';
        RAISE NOTICE '约束字段: (skill_id, sub_skill_name)';
    ELSE
        RAISE NOTICE 'ℹ️  UNIQUE约束已存在，无需重复添加';
    END IF;
END $$;

-- 步骤3: 验证约束已成功添加
DO $$
DECLARE
    constraint_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'sub_skills_skill_id_sub_skill_name_key'
    ) INTO constraint_exists;

    IF constraint_exists THEN
        RAISE NOTICE '=========================================';
        RAISE NOTICE '✅ 修复完成！UNIQUE约束验证通过';
        RAISE NOTICE '=========================================';
        RAISE NOTICE '下一步: 执行 sql/11_create_subskills_level4_8.sql';
        RAISE NOTICE '=========================================';
    ELSE
        RAISE EXCEPTION '❌ 修复失败：UNIQUE约束未成功添加';
    END IF;
END $$;

-- ============================================================================
-- 使用说明
-- ============================================================================
--
-- 执行方式:
-- 1. 在Supabase SQL Editor中复制粘贴本文件全部内容
-- 2. 点击 "Run" 执行
-- 3. 看到 "✅ 修复完成！" 后，重新执行 11_create_subskills_level4_8.sql
--
-- 预期输出:
-- NOTICE: ✅ 检查通过：sub_skills表中无重复数据
-- NOTICE: ✅ UNIQUE约束添加成功！
-- NOTICE: 约束名称: sub_skills_skill_id_sub_skill_name_key
-- NOTICE: 约束字段: (skill_id, sub_skill_name)
-- NOTICE: =========================================
-- NOTICE: ✅ 修复完成！UNIQUE约束验证通过
-- NOTICE: =========================================
-- NOTICE: 下一步: 执行 sql/11_create_subskills_level4_8.sql
-- NOTICE: =========================================
--
-- 如果看到警告 "发现X组重复数据"，请先清理重复数据:
-- SELECT skill_id, sub_skill_name, COUNT(*)
-- FROM sub_skills
-- GROUP BY skill_id, sub_skill_name
-- HAVING COUNT(*) > 1;
--
-- 然后手动删除重复数据再执行本脚本
-- ============================================================================
