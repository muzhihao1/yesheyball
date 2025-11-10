-- ============================================================================
-- 导入剩余3个子技能 (Sub-skills 2-4)
-- ============================================================================
-- 注意:需要先执行此SQL,获取sub_skill的ID后再导入训练单元
-- ============================================================================

-- Sub-skill 2: 笔直的出杆 (属于"基本功"技能)
INSERT INTO sub_skills (skill_id, sub_skill_name, sub_skill_order, description)
SELECT
    ts.id,
    '笔直的出杆',
    2,
    '训练稳定、笔直的出杆动作'
FROM training_skills ts
WHERE ts.skill_name = '基本功'
ON CONFLICT DO NOTHING;

-- Sub-skill 3: 发力基础 (属于"发力"技能)
INSERT INTO sub_skills (skill_id, sub_skill_name, sub_skill_order, description)
SELECT
    ts.id,
    '发力基础',
    1,
    '学习基本的发力原理和技巧'
FROM training_skills ts
WHERE ts.skill_name = '发力'
ON CONFLICT DO NOTHING;

-- Sub-skill 4: 五分点理论 (属于"高效五分点"技能)
INSERT INTO sub_skills (skill_id, sub_skill_name, sub_skill_order, description)
SELECT
    ts.id,
    '五分点理论',
    1,
    '理解五分点系统的原理'
FROM training_skills ts
WHERE ts.skill_name = '高效五分点'
ON CONFLICT DO NOTHING;

-- 验证插入结果
SELECT
    ss.sub_skill_name,
    ss.sub_skill_order,
    ts.skill_name,
    tl.title as level_title
FROM sub_skills ss
JOIN training_skills ts ON ss.skill_id = ts.id
JOIN training_levels tl ON ts.level_id = tl.id
ORDER BY tl.level_number, ts.skill_order, ss.sub_skill_order;
