-- ============================================================================
-- Migration 17: 建立90天课程与52集教学的映射关系
-- 策略：将52集教学内容科学分配到90天课程中
-- 部分基础内容会在多个阶段重复强化训练
-- ============================================================================

-- 步骤1: 获取program_id用于后续查询
DO $$
DECLARE
    v_program_id INTEGER;
BEGIN
    -- 获取52集完整版课程的program_id
    SELECT id INTO v_program_id
    FROM training_programs
    WHERE name = '耶氏台球学院系统教学（52集完整版）'
    LIMIT 1;

    IF v_program_id IS NULL THEN
        RAISE EXCEPTION '未找到训练计划：耶氏台球学院系统教学（52集完整版）。请先执行15_insert_52_episodes.sql';
    END IF;

    RAISE NOTICE '找到训练计划ID: %', v_program_id;

    -- 步骤2: 建立映射关系
    -- 根据original_course_ref字段（例如"第1集"）匹配training_days的title
    -- 映射策略：
    -- Days 1-20: 基础技术（第1-10集）+ 力量控制（第11-14集）
    -- Days 21-40: 高级瞄准（第15-23集）+ 分离角（第24-28集）
    -- Days 41-60: 加塞技术（第29-33集）+ 实战清台（第34-42集）
    -- Days 61-80: 理论提升（第43集）+ 肌肉激活（第44-49集）+ 节奏训练（第50-51集）
    -- Days 81-90: 综合运用（第52集）+ 复习巩固

    -- 第1-10天：基础技术（十大招技能1）- 第1-7集
    UPDATE ninety_day_curriculum ndc
    SET training_day_id = td.id
    FROM training_days td
    WHERE td.program_id = v_program_id
        AND ndc.day_number BETWEEN 1 AND 7
        AND ndc.original_course_ref = '第' || td.day || '集';

    -- 第8-10天：重复基础技术强化
    UPDATE ninety_day_curriculum ndc
    SET training_day_id = (
        SELECT td.id FROM training_days td
        WHERE td.program_id = v_program_id
            AND td.day = CASE
                WHEN ndc.day_number = 8 THEN 1
                WHEN ndc.day_number = 9 THEN 2
                WHEN ndc.day_number = 10 THEN 3
            END
        LIMIT 1
    )
    WHERE ndc.day_number BETWEEN 8 AND 10
        AND ndc.tencore_skill_id = (SELECT id FROM tencore_skills WHERE skill_number = 1 LIMIT 1);

    -- 第11-20天：力量控制与穿透力（十大招技能2）- 第8-14集
    UPDATE ninety_day_curriculum ndc
    SET training_day_id = td.id
    FROM training_days td
    WHERE td.program_id = v_program_id
        AND ndc.day_number BETWEEN 11 AND 17
        AND td.day = ndc.day_number - 3; -- 第11天对应第8集，第17天对应第14集

    -- 第18-20天：力量控制巩固
    UPDATE ninety_day_curriculum ndc
    SET training_day_id = (
        SELECT td.id FROM training_days td
        WHERE td.program_id = v_program_id
            AND td.day = CASE
                WHEN ndc.day_number = 18 THEN 11
                WHEN ndc.day_number = 19 THEN 12
                WHEN ndc.day_number = 20 THEN 13
            END
        LIMIT 1
    )
    WHERE ndc.day_number BETWEEN 18 AND 20
        AND ndc.tencore_skill_id = (SELECT id FROM tencore_skills WHERE skill_number = 2 LIMIT 1);

    -- 第21-30天：高级瞄准技术（十大招技能3）- 第15-23集
    UPDATE ninety_day_curriculum ndc
    SET training_day_id = td.id
    FROM training_days td
    WHERE td.program_id = v_program_id
        AND ndc.day_number BETWEEN 21 AND 29
        AND td.day = ndc.day_number - 6; -- 第21天对应第15集，第29天对应第23集

    -- 第30天：瞄准技术综合
    UPDATE ninety_day_curriculum ndc
    SET training_day_id = (
        SELECT td.id FROM training_days td
        WHERE td.program_id = v_program_id AND td.day = 18
        LIMIT 1
    )
    WHERE ndc.day_number = 30;

    -- 第31-40天：分离角技术（十大招技能4）- 第24-28集 + 走位训练
    UPDATE ninety_day_curriculum ndc
    SET training_day_id = td.id
    FROM training_days td
    WHERE td.program_id = v_program_id
        AND ndc.day_number BETWEEN 31 AND 35
        AND td.day = ndc.day_number - 7; -- 第31天对应第24集，第35天对应第28集

    -- 第36-40天：走位技术巩固（重复第24-28集）
    UPDATE ninety_day_curriculum ndc
    SET training_day_id = (
        SELECT td.id FROM training_days td
        WHERE td.program_id = v_program_id
            AND td.day = 24 + (ndc.day_number - 36)
        LIMIT 1
    )
    WHERE ndc.day_number BETWEEN 36 AND 40
        AND ndc.tencore_skill_id = (SELECT id FROM tencore_skills WHERE skill_number = 4 LIMIT 1);

    -- 第41-50天：加塞技术（十大招技能5-6）- 第29-33集
    UPDATE ninety_day_curriculum ndc
    SET training_day_id = td.id
    FROM training_days td
    WHERE td.program_id = v_program_id
        AND ndc.day_number BETWEEN 41 AND 45
        AND td.day = ndc.day_number - 12; -- 第41天对应第29集，第45天对应第33集

    -- 第46-50天：加塞技术强化（重复第29-33集）
    UPDATE ninety_day_curriculum ndc
    SET training_day_id = (
        SELECT td.id FROM training_days td
        WHERE td.program_id = v_program_id
            AND td.day = 29 + (ndc.day_number - 46)
        LIMIT 1
    )
    WHERE ndc.day_number BETWEEN 46 AND 50;

    -- 第51-60天：实战清台训练（十大招技能7）- 第34-42集
    UPDATE ninety_day_curriculum ndc
    SET training_day_id = td.id
    FROM training_days td
    WHERE td.program_id = v_program_id
        AND ndc.day_number BETWEEN 51 AND 59
        AND td.day = ndc.day_number - 17; -- 第51天对应第34集，第59天对应第42集

    -- 第60天：实战清台综合
    UPDATE ninety_day_curriculum ndc
    SET training_day_id = (
        SELECT td.id FROM training_days td
        WHERE td.program_id = v_program_id AND td.day = 42
        LIMIT 1
    )
    WHERE ndc.day_number = 60;

    -- 第61-70天：理论提升与肌肉激活（十大招技能8-9）- 第43-49集
    UPDATE ninety_day_curriculum ndc
    SET training_day_id = td.id
    FROM training_days td
    WHERE td.program_id = v_program_id
        AND ndc.day_number BETWEEN 61 AND 67
        AND td.day = ndc.day_number - 18; -- 第61天对应第43集，第67天对应第49集

    -- 第68-70天：肌肉激活循环训练
    UPDATE ninety_day_curriculum ndc
    SET training_day_id = (
        SELECT td.id FROM training_days td
        WHERE td.program_id = v_program_id
            AND td.day = 44 + ((ndc.day_number - 68) % 6)
        LIMIT 1
    )
    WHERE ndc.day_number BETWEEN 68 AND 70;

    -- 第71-80天：节奏掌握（十大招技能10）- 第50-51集循环
    UPDATE ninety_day_curriculum ndc
    SET training_day_id = (
        SELECT td.id FROM training_days td
        WHERE td.program_id = v_program_id
            AND td.day = 50 + ((ndc.day_number - 71) % 2)
        LIMIT 1
    )
    WHERE ndc.day_number BETWEEN 71 AND 80;

    -- 第81-90天：综合运用与复习巩固 - 第52集为主，配合关键技术复习
    UPDATE ninety_day_curriculum ndc
    SET training_day_id = (
        SELECT td.id FROM training_days td
        WHERE td.program_id = v_program_id
            AND td.day = CASE
                WHEN ndc.day_number BETWEEN 81 AND 85 THEN 52  -- 第52集：综合技术运用
                WHEN ndc.day_number = 86 THEN 23               -- 复习瞄准锁定
                WHEN ndc.day_number = 87 THEN 28               -- 复习走位技术
                WHEN ndc.day_number = 88 THEN 33               -- 复习加塞技术
                WHEN ndc.day_number = 89 THEN 42               -- 复习分离角原理
                WHEN ndc.day_number = 90 THEN 52               -- 最终综合运用
            END
        LIMIT 1
    )
    WHERE ndc.day_number BETWEEN 81 AND 90;

    RAISE NOTICE '映射关系建立完成';
END $$;

-- 步骤3: 验证映射结果
SELECT
    '映射统计' as check_type,
    COUNT(*) as total_days,
    COUNT(training_day_id) as mapped_days,
    COUNT(*) - COUNT(training_day_id) as unmapped_days
FROM ninety_day_curriculum;

-- 步骤4: 显示映射详情（前20天示例）
SELECT
    ndc.day_number as "90天课程日",
    ts.skill_name as "十大招技能",
    ndc.title as "90天课程标题",
    td.day as "对应集数",
    td.title as "52集课程标题",
    CASE
        WHEN ndc.training_day_id IS NOT NULL THEN '✅ 已映射'
        ELSE '❌ 未映射'
    END as "映射状态"
FROM ninety_day_curriculum ndc
LEFT JOIN tencore_skills ts ON ndc.tencore_skill_id = ts.id
LEFT JOIN training_days td ON ndc.training_day_id = td.id
WHERE ndc.day_number BETWEEN 1 AND 20
ORDER BY ndc.day_number;

-- 步骤5: 检查未映射的天数
SELECT
    ndc.day_number as "未映射天数",
    ts.skill_name as "十大招技能",
    ndc.title as "90天课程标题"
FROM ninety_day_curriculum ndc
LEFT JOIN tencore_skills ts ON ndc.tencore_skill_id = ts.id
WHERE ndc.training_day_id IS NULL
ORDER BY ndc.day_number;

-- 步骤6: 统计每个技能的映射情况
SELECT
    ts.skill_name as "十大招技能",
    COUNT(*) as "总天数",
    COUNT(ndc.training_day_id) as "已映射天数",
    ROUND(COUNT(ndc.training_day_id)::NUMERIC / COUNT(*)::NUMERIC * 100, 1) || '%' as "映射率"
FROM ninety_day_curriculum ndc
LEFT JOIN tencore_skills ts ON ndc.tencore_skill_id = ts.id
GROUP BY ts.skill_name, ts.skill_number
ORDER BY ts.skill_number;
