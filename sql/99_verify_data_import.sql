-- ============================================================================
-- V2.1 Training System: 数据导入验证
-- ============================================================================
-- 全面验证Fu Jiajun V2.1训练系统的数据完整性
-- 作者: 耶氏台球学院
-- 日期: 2025-01-10
-- ============================================================================

-- ============================================================================
-- 验证 1: 核心总数验证
-- ============================================================================
DO $$
DECLARE
    sub_skill_count INTEGER;
    training_unit_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO sub_skill_count FROM sub_skills;
    SELECT COUNT(*) INTO training_unit_count FROM training_units;

    RAISE NOTICE '=========================================';
    RAISE NOTICE '验证 1: 核心总数检查';
    RAISE NOTICE '=========================================';
    RAISE NOTICE '子技能总数: % (期望: 10)', sub_skill_count;
    RAISE NOTICE '训练单元总数: % (期望: 33)', training_unit_count;

    IF sub_skill_count = 10 AND training_unit_count = 33 THEN
        RAISE NOTICE '✅ 核心总数验证通过！';
    ELSE
        RAISE WARNING '⚠️  核心总数不匹配！';
        IF sub_skill_count <> 10 THEN
            RAISE WARNING '子技能数量错误：期望10个，实际%个', sub_skill_count;
        END IF;
        IF training_unit_count <> 33 THEN
            RAISE WARNING '训练单元数量错误：期望33个，实际%个', training_unit_count;
        END IF;
    END IF;
    RAISE NOTICE '=========================================';
END $$;

-- ============================================================================
-- 验证 2: 各父技能下的子技能分布
-- ============================================================================
DO $$
DECLARE
    skill_record RECORD;
    all_correct BOOLEAN := TRUE;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=========================================';
    RAISE NOTICE '验证 2: 子技能分布检查';
    RAISE NOTICE '=========================================';

    FOR skill_record IN
        SELECT
            ts.skill_name,
            COUNT(ss.id) AS sub_skill_count
        FROM training_skills ts
        LEFT JOIN sub_skills ss ON ts.id = ss.skill_id
        GROUP BY ts.id, ts.skill_name
        ORDER BY ts.skill_name
    LOOP
        RAISE NOTICE '技能: % → 子技能数: % (期望: 2)',
            skill_record.skill_name,
            skill_record.sub_skill_count;

        IF skill_record.sub_skill_count <> 2 THEN
            all_correct := FALSE;
            RAISE WARNING '⚠️  技能 [%] 的子技能数不正确！', skill_record.skill_name;
        END IF;
    END LOOP;

    IF all_correct THEN
        RAISE NOTICE '✅ 子技能分布验证通过！';
    ELSE
        RAISE WARNING '⚠️  子技能分布存在问题！';
    END IF;
    RAISE NOTICE '=========================================';
END $$;

-- ============================================================================
-- 验证 3: 完整层级结构聚合验证（最重要）
-- ============================================================================
DO $$
DECLARE
    level_record RECORD;
    expected_data RECORD;
    all_correct BOOLEAN := TRUE;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=========================================';
    RAISE NOTICE '验证 3: 层级结构聚合检查';
    RAISE NOTICE '=========================================';

    -- 定义期望数据
    CREATE TEMP TABLE IF NOT EXISTS expected_levels (
        level_number INTEGER,
        skill_name VARCHAR(50),
        expected_sub_skills INTEGER,
        expected_units INTEGER,
        expected_xp INTEGER
    );

    TRUNCATE expected_levels;
    INSERT INTO expected_levels VALUES
        (4, '杆法技术', 2, 8, 160),
        (5, '走位技术', 2, 8, 160),
        (6, '加塞技术', 2, 6, 130),
        (7, '高级技术', 2, 6, 130),
        (8, '竞技心态', 2, 5, 100);

    FOR level_record IN
        SELECT
            tl.level_number,
            ts.skill_name,
            COUNT(DISTINCT ss.id) AS sub_skill_count,
            COUNT(tu.id) AS unit_count,
            SUM(tu.xp_reward) AS total_xp
        FROM training_levels tl
        JOIN training_skills ts ON tl.id = ts.level_id
        JOIN sub_skills ss ON ts.id = ss.skill_id
        LEFT JOIN training_units tu ON ss.id = tu.sub_skill_id
        WHERE tl.level_number BETWEEN 4 AND 8
        GROUP BY tl.level_number, ts.skill_name
        ORDER BY tl.level_number
    LOOP
        -- 获取期望值
        SELECT * INTO expected_data
        FROM expected_levels
        WHERE level_number = level_record.level_number;

        RAISE NOTICE 'Level %: % → 子技能:%/%, 单元:%/%, XP:%/%',
            level_record.level_number,
            level_record.skill_name,
            level_record.sub_skill_count, expected_data.expected_sub_skills,
            level_record.unit_count, expected_data.expected_units,
            level_record.total_xp, expected_data.expected_xp;

        IF level_record.sub_skill_count <> expected_data.expected_sub_skills
           OR level_record.unit_count <> expected_data.expected_units
           OR level_record.total_xp <> expected_data.expected_xp THEN
            all_correct := FALSE;
            RAISE WARNING '⚠️  Level % 数据不匹配！', level_record.level_number;
        END IF;
    END LOOP;

    DROP TABLE expected_levels;

    IF all_correct THEN
        RAISE NOTICE '✅ 层级结构聚合验证通过！';
    ELSE
        RAISE WARNING '⚠️  层级结构聚合存在问题！';
    END IF;
    RAISE NOTICE '=========================================';
END $$;

-- ============================================================================
-- 验证 4: 孤立数据检查 - 训练单元
-- ============================================================================
DO $$
DECLARE
    orphan_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO orphan_count
    FROM training_units tu
    LEFT JOIN sub_skills ss ON tu.sub_skill_id = ss.id
    WHERE ss.id IS NULL;

    RAISE NOTICE '';
    RAISE NOTICE '=========================================';
    RAISE NOTICE '验证 4: 孤立训练单元检查';
    RAISE NOTICE '=========================================';
    RAISE NOTICE '孤立训练单元数: % (期望: 0)', orphan_count;

    IF orphan_count = 0 THEN
        RAISE NOTICE '✅ 无孤立训练单元，验证通过！';
    ELSE
        RAISE WARNING '⚠️  发现%个孤立训练单元！', orphan_count;
        RAISE WARNING '执行以下查询查看详情：';
        RAISE WARNING 'SELECT tu.* FROM training_units tu LEFT JOIN sub_skills ss ON tu.sub_skill_id = ss.id WHERE ss.id IS NULL;';
    END IF;
    RAISE NOTICE '=========================================';
END $$;

-- ============================================================================
-- 验证 5: 孤立数据检查 - 子技能
-- ============================================================================
DO $$
DECLARE
    orphan_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO orphan_count
    FROM sub_skills ss
    LEFT JOIN training_skills ts ON ss.skill_id = ts.id
    WHERE ts.id IS NULL;

    RAISE NOTICE '';
    RAISE NOTICE '=========================================';
    RAISE NOTICE '验证 5: 孤立子技能检查';
    RAISE NOTICE '=========================================';
    RAISE NOTICE '孤立子技能数: % (期望: 0)', orphan_count;

    IF orphan_count = 0 THEN
        RAISE NOTICE '✅ 无孤立子技能，验证通过！';
    ELSE
        RAISE WARNING '⚠️  发现%个孤立子技能！', orphan_count;
        RAISE WARNING '执行以下查询查看详情：';
        RAISE WARNING 'SELECT ss.* FROM sub_skills ss LEFT JOIN training_skills ts ON ss.skill_id = ts.id WHERE ts.id IS NULL;';
    END IF;
    RAISE NOTICE '=========================================';
END $$;

-- ============================================================================
-- 验证 6: JSONB内容完整性检查
-- ============================================================================
DO $$
DECLARE
    incomplete_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO incomplete_count
    FROM training_units
    WHERE NOT (
        content ? 'theory'
        AND content ? 'steps'
        AND content ? 'tips'
        AND content ? 'common_mistakes'
        AND content ? 'practice_requirements'
        AND content ? 'success_criteria'
        AND content ? 'related_courses'
    );

    RAISE NOTICE '';
    RAISE NOTICE '=========================================';
    RAISE NOTICE '验证 6: JSONB内容完整性检查';
    RAISE NOTICE '=========================================';
    RAISE NOTICE '内容不完整的训练单元: % (期望: 0)', incomplete_count;

    IF incomplete_count = 0 THEN
        RAISE NOTICE '✅ 所有训练单元JSONB内容完整！';
    ELSE
        RAISE WARNING '⚠️  发现%个训练单元内容不完整！', incomplete_count;
        RAISE WARNING '执行以下查询查看详情：';
        RAISE WARNING 'SELECT id, title FROM training_units WHERE NOT (content ? ''theory'' AND content ? ''steps'' ...);';
    END IF;
    RAISE NOTICE '=========================================';
END $$;

-- ============================================================================
-- 最终总结
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=========================================';
    RAISE NOTICE '🎉 Fu Jiajun V2.1 数据导入验证完成';
    RAISE NOTICE '=========================================';
    RAISE NOTICE '';
    RAISE NOTICE '如果所有验证都显示 ✅，恭喜您！';
    RAISE NOTICE '数据导入完全成功，可以开始前端开发了。';
    RAISE NOTICE '';
    RAISE NOTICE '如果有任何 ⚠️  警告，请根据提示进行排查。';
    RAISE NOTICE '';
    RAISE NOTICE '下一步建议：';
    RAISE NOTICE '1. 重构 tasks.tsx → fu-training.tsx';
    RAISE NOTICE '2. 创建 targeted-practice.tsx';
    RAISE NOTICE '3. 实现API接口 (推荐/薄弱环节)';
    RAISE NOTICE '=========================================';
END $$;

-- ============================================================================
-- 详细数据查看（可选）
-- ============================================================================

-- 查看所有子技能详情
-- SELECT
--     ts.skill_name AS "技能名称",
--     ss.sub_skill_name AS "子技能名称",
--     ss.sub_skill_order AS "顺序",
--     COUNT(tu.id) AS "训练单元数"
-- FROM sub_skills ss
-- JOIN training_skills ts ON ss.skill_id = ts.id
-- LEFT JOIN training_units tu ON tu.sub_skill_id = ss.id
-- GROUP BY ts.skill_name, ss.sub_skill_name, ss.sub_skill_order
-- ORDER BY ts.skill_name, ss.sub_skill_order;

-- 查看所有训练单元概览
-- SELECT
--     tl.level_number AS "Level",
--     ts.skill_name AS "技能",
--     ss.sub_skill_name AS "子技能",
--     tu.title AS "训练单元标题",
--     tu.unit_type AS "类型",
--     tu.xp_reward AS "XP",
--     tu.estimated_minutes AS "时长(分)"
-- FROM training_units tu
-- JOIN sub_skills ss ON tu.sub_skill_id = ss.id
-- JOIN training_skills ts ON ss.skill_id = ts.id
-- JOIN training_levels tl ON ts.level_id = tl.id
-- WHERE tl.level_number BETWEEN 4 AND 8
-- ORDER BY tl.level_number, tu.unit_order;
