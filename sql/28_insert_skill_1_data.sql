-- ============================================================================
-- Migration 28: 插入第一招完整数据（基本功）
-- 包括：skill主记录、3个sub_skills、9个training_units
-- ============================================================================

-- 1. 插入第一招：基本功
INSERT INTO skills (id, title, description, skill_order, icon_name) VALUES
('skill_1', '第一招：基本功', '掌握最核心的台球动作基础', 1, 'basics.svg')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    skill_order = EXCLUDED.skill_order,
    icon_name = EXCLUDED.icon_name,
    updated_at = CURRENT_TIMESTAMP;

-- 2. 插入第一招的子技能
INSERT INTO sub_skills (id, skill_id, title, description, sub_skill_order) VALUES
('sub_skill_1_1', 'skill_1', '1.1 站位与姿势', '找到最稳固的身体姿态', 1),
('sub_skill_1_2', 'skill_1', '1.2 手架', '让每杆手架稳定支撑为止', 2),
('sub_skill_1_3', 'skill_1', '1.3 出杆', '保证出杆的平、直、稳', 3)
ON CONFLICT (id) DO UPDATE SET
    skill_id = EXCLUDED.skill_id,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    sub_skill_order = EXCLUDED.sub_skill_order,
    updated_at = CURRENT_TIMESTAMP;

-- 3. 插入1.1 站位与姿势的训练单元
INSERT INTO training_units (id, sub_skill_id, unit_type, title, content, goal_description, xp_reward, unit_order, estimated_minutes) VALUES
(
    'unit_1_1_1',
    'sub_skill_1_1',
    'theory',
    '理论：核心站位要点',
    '{
        "text": "正确的站位是稳定击球的基石。核心要点包括：\n1. 双脚与肩同宽，主力腿（通常是后手侧的腿）稍稍靠后。\n2. 身体重心均匀分布在双脚上。\n3. 上半身俯身，下巴靠近球杆，保持水平视线。",
        "image": "/images/skills/stance_diagram.png",
        "keyPoints": [
            "双脚与肩同宽",
            "重心分配80-15-5原则",
            "下巴靠近球杆",
            "保持水平视线"
        ]
    }'::jsonb,
    '阅读并理解核心站位要点',
    5,
    1,
    5
),
(
    'unit_1_1_2',
    'sub_skill_1_1',
    'practice',
    '练习：站位重复性训练',
    '{
        "text": "重复20次从站立到俯身准备的动作，每次都感受重心和视线的位置。",
        "steps": [
            "自然站立，放松全身",
            "俯身到击球姿势",
            "感受重心分布",
            "检查视线是否水平",
            "起身，重复"
        ]
    }'::jsonb,
    '重复20次从站立到俯身准备的动作，每次都感受重心和视线的位置',
    10,
    2,
    10
)
ON CONFLICT (id) DO UPDATE SET
    sub_skill_id = EXCLUDED.sub_skill_id,
    unit_type = EXCLUDED.unit_type,
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    goal_description = EXCLUDED.goal_description,
    xp_reward = EXCLUDED.xp_reward,
    unit_order = EXCLUDED.unit_order,
    estimated_minutes = EXCLUDED.estimated_minutes,
    updated_at = CURRENT_TIMESTAMP;

-- 4. 插入1.2 手架的训练单元
INSERT INTO training_units (id, sub_skill_id, unit_type, title, content, goal_description, xp_reward, unit_order, estimated_minutes) VALUES
(
    'unit_1_2_1',
    'sub_skill_1_2',
    'theory',
    '理论：开放式与封闭式手架',
    '{
        "text": "开放式手架（V型手架）适用于大部分击球，提供良好视野。封闭式手架（环形手架）在需要强力击球或精确控制时使用，能提供更强的稳定性。",
        "video": "/videos/skills/bridge_types.mp4",
        "keyPoints": [
            "V型手架：拇指与食指形成V字",
            "环形手架：食指扣住球杆",
            "根据球位选择手架类型",
            "手架如桥梁般稳固"
        ]
    }'::jsonb,
    '理解两种基本手架的区别和应用场景',
    5,
    1,
    8
),
(
    'unit_1_2_2',
    'sub_skill_1_2',
    'practice',
    '练习：V型手架稳定性',
    '{
        "text": "使用V型手架，将母球沿直线从底库击打到顶库并返回，连续10次母球不碰到左右库边。",
        "steps": [
            "摆放V型手架",
            "确保手指贴合台面",
            "将球杆放在V字槽内",
            "直线击打母球",
            "观察母球轨迹"
        ],
        "difficulty": "medium"
    }'::jsonb,
    '使用V型手架，将母球沿直线从底库击打到顶库并返回，连续10次母球不碰到左右库边',
    15,
    2,
    15
),
(
    'unit_1_2_3',
    'sub_skill_1_2',
    'challenge',
    '挑战：高低杆手架切换',
    '{
        "text": "交替进行一次高杆和一次低杆击球，连续完成5组（10次击球）手架不变形。",
        "steps": [
            "第1次：高杆击球",
            "第2次：低杆击球",
            "重复5组",
            "保持手架稳定性",
            "记录成功率"
        ],
        "difficulty": "hard",
        "successCriteria": "手架始终稳定，母球控制精准"
    }'::jsonb,
    '交替进行一次高杆和一次低杆击球，连续完成5组（10次击球）手架不变形',
    25,
    3,
    20
)
ON CONFLICT (id) DO UPDATE SET
    sub_skill_id = EXCLUDED.sub_skill_id,
    unit_type = EXCLUDED.unit_type,
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    goal_description = EXCLUDED.goal_description,
    xp_reward = EXCLUDED.xp_reward,
    unit_order = EXCLUDED.unit_order,
    estimated_minutes = EXCLUDED.estimated_minutes,
    updated_at = CURRENT_TIMESTAMP;

-- 5. 插入1.3 出杆的训练单元
INSERT INTO training_units (id, sub_skill_id, unit_type, title, content, goal_description, xp_reward, unit_order, estimated_minutes) VALUES
(
    'unit_1_3_1',
    'sub_skill_1_3',
    'theory',
    '理论：钟摆式出杆',
    '{
        "text": "出杆应像钟摆一样，只有小臂在动，大臂和手腕保持稳定。运杆要平顺，出杆要果断，击球后有自然的延伸动作。",
        "keyPoints": [
            "小臂如钟摆",
            "大臂固定不动",
            "回杆慢送杆快",
            "击球后自然延伸"
        ]
    }'::jsonb,
    '理解钟摆式出杆的核心原理',
    5,
    1,
    5
),
(
    'unit_1_3_2',
    'sub_skill_1_3',
    'practice',
    '练习：空杆直线训练',
    '{
        "text": "不放球，沿着开球线进行空杆练习，感受球杆的直线运动，持续5分钟。",
        "steps": [
            "站在开球线",
            "进行空杆练习",
            "观察杆头运动轨迹",
            "感受小臂发力",
            "保持5分钟连续练习"
        ],
        "tips": "可以在球杆下方放一根粉笔，确保杆头不偏离直线"
    }'::jsonb,
    '不放球，沿着开球线进行空杆练习，感受球杆的直线运动，持续5分钟',
    10,
    2,
    10
),
(
    'unit_1_3_3',
    'sub_skill_1_3',
    'practice',
    '练习：瓶口穿越训练',
    '{
        "text": "在球台一端放置一个瓶口向上的空瓶子，从另一端出杆，杆头需能穿过瓶口而不碰到瓶壁。",
        "steps": [
            "在球台顶库放置空瓶",
            "站在底库开球线",
            "瞄准瓶口",
            "缓慢出杆",
            "杆头穿过瓶口"
        ],
        "difficulty": "hard",
        "goal": "连续成功10次"
    }'::jsonb,
    '杆头穿过瓶口而不碰到瓶壁，连续成功10次',
    20,
    3,
    15
),
(
    'unit_1_3_4',
    'sub_skill_1_3',
    'challenge',
    '挑战：长台直线击球',
    '{
        "text": "从底库击打对岸的底袋目标球，要求母球运行轨迹始终在中线上，连续成功5次。",
        "steps": [
            "在对岸底袋放置目标球",
            "母球放在底库开球线",
            "瞄准目标球",
            "直线击打",
            "观察母球轨迹"
        ],
        "difficulty": "hard",
        "successCriteria": "母球轨迹不偏离中线超过一个球直径"
    }'::jsonb,
    '长台击打对岸底袋目标球，连续成功5次进球',
    30,
    4,
    20
)
ON CONFLICT (id) DO UPDATE SET
    sub_skill_id = EXCLUDED.sub_skill_id,
    unit_type = EXCLUDED.unit_type,
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    goal_description = EXCLUDED.goal_description,
    xp_reward = EXCLUDED.xp_reward,
    unit_order = EXCLUDED.unit_order,
    estimated_minutes = EXCLUDED.estimated_minutes,
    updated_at = CURRENT_TIMESTAMP;

-- 6. 验证插入结果
SELECT
    s.title as skill_title,
    COUNT(DISTINCT ss.id) as sub_skills_count,
    COUNT(tu.id) as training_units_count
FROM skills s
LEFT JOIN sub_skills ss ON s.id = ss.skill_id
LEFT JOIN training_units tu ON ss.id = tu.sub_skill_id
WHERE s.id = 'skill_1'
GROUP BY s.title;

-- 7. 查看第一招的完整结构
SELECT
    s.title as 招式,
    ss.title as 子技能,
    tu.unit_type as 类型,
    tu.title as 训练单元,
    tu.xp_reward as 经验值,
    tu.estimated_minutes as 预计时长
FROM skills s
JOIN sub_skills ss ON s.id = ss.skill_id
JOIN training_units tu ON ss.id = tu.sub_skill_id
WHERE s.id = 'skill_1'
ORDER BY ss.sub_skill_order, tu.unit_order;
