-- ============================================================================
-- Migration 27A: 先插入十大招的基础信息
-- 必须在映射90天课程之前执行
-- ============================================================================

-- 插入十大招基础信息（详细内容后续补充）
INSERT INTO skills (id, title, description, skill_order, icon_name, is_active) VALUES
('skill_1', '第一招：基本功', '掌握最核心的台球动作基础：站位、手架、出杆', 1, 'basics.svg', true),
('skill_2', '第二招：发力', '学会正确的发力方式，提升击球力度和稳定性', 2, 'power.svg', true),
('skill_3', '第三招：高效五分点', '精准掌握五分点击球技术，提升进攻效率', 3, 'five-point.svg', true),
('skill_4', '第四招：准度', '系统训练瞄准技术，提高进球成功率', 4, 'accuracy.svg', true),
('skill_5', '第五招：杆法', '掌握各种杆法技巧：高低杆、左右塞、跳球等', 5, 'cue-technique.svg', true),
('skill_6', '第六招：分离角', '理解并运用分离角原理，精确控制母球走位', 6, 'separation-angle.svg', true),
('skill_7', '第七招：走位', '学会全局走位规划，实现连续进球', 7, 'positioning.svg', true),
('skill_8', '第八招：轻松清蛇彩', '掌握清台技巧，提升连续进球能力', 8, 'clearing.svg', true),
('skill_9', '第九招：技能', '综合运用各种技术，应对复杂球局', 9, 'skills.svg', true),
('skill_10', '第十招：思路', '培养战术思维，制定最优进攻路线', 10, 'strategy.svg', true)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    skill_order = EXCLUDED.skill_order,
    icon_name = EXCLUDED.icon_name,
    updated_at = CURRENT_TIMESTAMP;

-- 验证插入结果
SELECT
    id,
    title,
    skill_order,
    is_active
FROM skills
ORDER BY skill_order;

-- 统计
SELECT
    '✅ 十大招基础信息已插入' as status,
    COUNT(*) as skill_count
FROM skills;
