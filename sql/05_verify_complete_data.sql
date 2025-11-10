-- ============================================================================
-- V2.1 完整数据验证查询
-- ============================================================================

-- 1. 整体统计
SELECT
    'V2.1 数据导入统计' as category,
    (SELECT COUNT(*) FROM training_levels) as levels_count,
    (SELECT COUNT(*) FROM training_skills) as skills_count,
    (SELECT COUNT(*) FROM sub_skills) as subskills_count,
    (SELECT COUNT(*) FROM training_units) as units_count;

-- 2. 训练单元按类型统计
SELECT
    '训练单元类型分布' as info,
    unit_type,
    COUNT(*) as count,
    SUM(xp_reward) as total_xp,
    SUM(estimated_minutes) as total_minutes
FROM training_units
GROUP BY unit_type
ORDER BY unit_type;

-- 3. 完整层级结构验证
SELECT
    tl.level_number,
    tl.title as level_title,
    ts.skill_order,
    ts.skill_name,
    ss.sub_skill_order,
    ss.sub_skill_name,
    COUNT(tu.id) as unit_count,
    SUM(tu.xp_reward) as total_xp,
    SUM(tu.estimated_minutes) as total_time
FROM training_levels tl
JOIN training_skills ts ON tl.id = ts.level_id
JOIN sub_skills ss ON ts.id = ss.skill_id
LEFT JOIN training_units tu ON ss.id = tu.sub_skill_id
WHERE tl.level_number IN (1, 2, 3)
GROUP BY tl.id, tl.level_number, tl.title, ts.skill_order, ts.skill_name, ss.sub_skill_order, ss.sub_skill_name
ORDER BY tl.level_number, ts.skill_order, ss.sub_skill_order;

-- 4. 每个子技能的训练单元详情
SELECT
    ss.sub_skill_name,
    tu.unit_order,
    tu.unit_type,
    tu.title,
    tu.xp_reward,
    tu.estimated_minutes
FROM sub_skills ss
JOIN training_units tu ON ss.id = tu.sub_skill_id
ORDER BY ss.id, tu.unit_order;

-- 5. 验证JSONB内容结构
SELECT
    title,
    unit_type,
    jsonb_typeof(content) as content_type,
    content->>'type' as content_subtype,
    CASE
        WHEN unit_type = 'theory' THEN (content->>'text') IS NOT NULL
        WHEN unit_type = 'practice' THEN (content->>'instructions') IS NOT NULL
        WHEN unit_type = 'challenge' THEN (content->>'description') IS NOT NULL
        ELSE false
    END as has_required_field
FROM training_units
ORDER BY id;
