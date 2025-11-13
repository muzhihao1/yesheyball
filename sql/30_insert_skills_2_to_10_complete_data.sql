-- ============================================================================
-- Migration 30: 插入技能2-10的完整数据
-- 包括：27个sub_skills、54个training_units
-- ============================================================================

-- ============================================================================
-- 第二招：发力 (skill_2)
-- ============================================================================

INSERT INTO sub_skills (id, skill_id, title, description, sub_skill_order) VALUES
('sub_skill_2_1', 'skill_2', '2.1 小臂发力', '学会用小臂带动球杆发力', 1),
('sub_skill_2_2', 'skill_2', '2.2 大臂固定', '保持大臂稳定，避免多余动作', 2),
('sub_skill_2_3', 'skill_2', '2.3 力度控制', '精确控制击球力度，实现不同距离的走位', 3)
ON CONFLICT (id) DO UPDATE SET
    skill_id = EXCLUDED.skill_id,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    sub_skill_order = EXCLUDED.sub_skill_order,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO training_units (id, sub_skill_id, unit_type, title, content, goal_description, xp_reward, unit_order, estimated_minutes) VALUES
('unit_2_1_1', 'sub_skill_2_1', 'theory', '理论：钟摆式发力原理', '{"text": "小臂发力如钟摆，大臂保持固定。发力点在小臂，通过加速度传递给球杆。", "keyPoints": ["小臂如钟摆", "大臂固定不动", "击球瞬间加速", "自然延伸"]}', '理解钟摆式小臂发力的核心原理', 5, 1, 5),
('unit_2_1_2', 'sub_skill_2_1', 'practice', '练习：空杆加速训练', '{"text": "进行空杆练习，感受小臂在击球瞬间的加速，持续10分钟。", "steps": ["站好姿势", "运杆准备", "小臂发力", "观察杆头速度", "重复练习"]}', '通过空杆练习掌握小臂发力的节奏', 10, 2, 10),
('unit_2_2_1', 'sub_skill_2_2', 'theory', '理论：大臂锁定技术', '{"text": "大臂应像固定在身体上一样，只允许小臂自由摆动。大臂稳定是出杆精准的关键。", "keyPoints": ["大臂贴近身体", "肩部放松", "肘部固定", "小臂自由"]}', '理解大臂固定对出杆稳定性的重要性', 5, 1, 5),
('unit_2_2_2', 'sub_skill_2_2', 'practice', '练习：大臂固定检测', '{"text": "请教练或朋友在你运杆时轻轻按住你的大臂，如果能正常出杆说明大臂已经足够固定。", "steps": ["摆好击球姿势", "让他人按住大臂", "尝试运杆", "检查是否受影响", "调整并重复"]}', '通过检测确保大臂在出杆过程中保持固定', 10, 2, 10),
('unit_2_3_1', 'sub_skill_2_3', 'theory', '理论：力度分级控制', '{"text": "击球力度可分为5个等级：轻推、软击、中击、重击、爆击。不同力度用于实现不同的走位效果。", "keyPoints": ["轻推：母球走1-2颗星", "软击：走2-4颗星", "中击：走4-6颗星", "重击：走6-8颗星", "爆击：全台奔跑"]}', '理解5个力度等级及其应用场景', 5, 1, 5),
('unit_2_3_2', 'sub_skill_2_3', 'practice', '练习：五级力度训练', '{"text": "将母球放在开球点，依次用5种不同力度击打对岸，感受力度与距离的关系。", "steps": ["母球放开球点", "第1次：轻推", "第2次：软击", "第3次：中击", "第4次：重击", "第5次：爆击"]}', '掌握5种不同力度的击球方式', 15, 2, 15)
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

-- ============================================================================
-- 第三招：高效五分点 (skill_3)
-- ============================================================================

INSERT INTO sub_skills (id, skill_id, title, description, sub_skill_order) VALUES
('sub_skill_3_1', 'skill_3', '3.1 五分点理论', '理解目标球五分点的位置和作用', 1),
('sub_skill_3_2', 'skill_3', '3.2 五分点瞄准', '精确瞄准目标球的五分点位置', 2),
('sub_skill_3_3', 'skill_3', '3.3 五分点进攻', '运用五分点技术进行高效进攻', 3)
ON CONFLICT (id) DO UPDATE SET
    skill_id = EXCLUDED.skill_id,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    sub_skill_order = EXCLUDED.sub_skill_order,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO training_units (id, sub_skill_id, unit_type, title, content, goal_description, xp_reward, unit_order, estimated_minutes) VALUES
('unit_3_1_1', 'sub_skill_3_1', 'theory', '理论：什么是五分点', '{"text": "五分点是目标球上最容易进球的击打点，位于球心与袋口连线的延长线上。击打五分点可以最大化进球角度。", "keyPoints": ["五分点定义", "最佳进球角度", "适用场景", "与其他击点对比"]}', '理解五分点的概念和重要性', 5, 1, 5),
('unit_3_1_2', 'sub_skill_3_1', 'practice', '练习：五分点识别', '{"text": "在球台上摆放10颗球，对每颗球标记出其对应底袋的五分点位置。", "steps": ["摆放目标球", "找袋口中心", "画球心连线", "标记五分点", "重复10次"]}', '快速识别任意位置目标球的五分点', 10, 2, 10),
('unit_3_2_1', 'sub_skill_3_2', 'theory', '理论：五分点瞄准法', '{"text": "瞄准五分点时，眼睛应在母球-五分点-袋口三点一线上。先看袋口，再找五分点，最后确定母球击打点。", "keyPoints": ["三点一线原则", "由袋口向后找", "确定母球击打点", "视线转移顺序"]}', '掌握五分点瞄准的正确方法', 5, 1, 5),
('unit_3_2_2', 'sub_skill_3_2', 'practice', '练习：五分点进球训练', '{"text": "将目标球放在中台不同位置，瞄准五分点击打，连续进10球。", "steps": ["摆放目标球", "识别五分点", "瞄准击打点", "执行击球", "记录成功率"]}', '通过五分点瞄准实现稳定进球', 15, 2, 15),
('unit_3_3_1', 'sub_skill_3_3', 'theory', '理论：五分点与走位', '{"text": "击打五分点不仅可以进球，还能同时控制母球走位。通过调整击打力度和杆法，实现进攻与走位的完美结合。", "keyPoints": ["进球与走位结合", "力度调整", "杆法配合", "连续进攻"]}', '理解五分点在进攻走位中的应用', 5, 1, 5),
('unit_3_3_2', 'sub_skill_3_3', 'practice', '练习：五分点连续进攻', '{"text": "摆放3颗球，使用五分点技术连续进球，同时控制母球走到下一颗球的理想击球位置。", "steps": ["摆放3颗球", "规划进攻顺序", "第1球五分点进攻", "控制走位", "完成连续进球"]}', '运用五分点实现连续进攻', 20, 2, 20)
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

-- ============================================================================
-- 第四招：准度 (skill_4)
-- ============================================================================

INSERT INTO sub_skills (id, skill_id, title, description, sub_skill_order) VALUES
('sub_skill_4_1', 'skill_4', '4.1 瞄准系统', '建立个人的瞄准参考系统', 1),
('sub_skill_4_2', 'skill_4', '4.2 视线对准', '训练视线与击球线的精确对准', 2),
('sub_skill_4_3', 'skill_4', '4.3 薄厚球判断', '准确判断不同角度的薄厚球', 3)
ON CONFLICT (id) DO UPDATE SET
    skill_id = EXCLUDED.skill_id,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    sub_skill_order = EXCLUDED.sub_skill_order,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO training_units (id, sub_skill_id, unit_type, title, content, goal_description, xp_reward, unit_order, estimated_minutes) VALUES
('unit_4_1_1', 'sub_skill_4_1', 'theory', '理论：瞄准系统的建立', '{"text": "瞄准系统包括：瞄点选择、视线路径、参考线、感觉记忆。每个人的瞄准系统略有不同，需要找到适合自己的方法。", "keyPoints": ["瞄点法", "重叠法", "角度法", "找到适合自己的"]}', '理解不同的瞄准系统及其特点', 5, 1, 5),
('unit_4_1_2', 'sub_skill_4_1', 'practice', '练习：建立个人瞄准法', '{"text": "尝试3种不同瞄准方法（瞄点法、重叠法、角度法），每种方法打10球，记录进球率，找出最适合自己的。", "steps": ["瞄点法10球", "记录进球数", "重叠法10球", "记录进球数", "角度法10球", "记录并对比"]}', '通过对比找到最适合自己的瞄准方法', 15, 2, 15),
('unit_4_2_1', 'sub_skill_4_2', 'theory', '理论：视线对准原理', '{"text": "视线对准是瞄准的核心。眼睛、杆头、目标球击打点、袋口应在一条直线上。正确的视线对准可以大幅提高进球率。", "keyPoints": ["四点一线", "主视眼识别", "视线固定", "击球前最后一看"]}', '理解视线对准在瞄准中的关键作用', 5, 1, 5),
('unit_4_2_2', 'sub_skill_4_2', 'practice', '练习：视线对准训练', '{"text": "在球台中心放置一颗球正对底袋，练习视线对准并击打进袋，连续成功20次。", "steps": ["摆放目标球", "俯身瞄准", "检查视线对准", "运杆击球", "重复20次"]}', '通过重复练习强化视线对准能力', 10, 2, 10),
('unit_4_3_1', 'sub_skill_4_3', 'theory', '理论：薄厚球的判断', '{"text": "薄厚球指母球击打目标球的接触面积。正面球：100%接触；半球：50%接触；薄球：小于30%接触。不同薄厚决定目标球运动方向。", "keyPoints": ["正面球", "半球", "厚球", "薄球", "超薄球"]}', '理解薄厚球的概念和判断方法', 5, 1, 5),
('unit_4_3_2', 'sub_skill_4_3', 'practice', '练习：薄厚球训练', '{"text": "摆放5个不同角度的球（正面、半球、厚球、薄球、超薄球），每种角度打10次，达到80%以上进球率。", "steps": ["摆正面球10次", "摆半球10次", "摆厚球10次", "摆薄球10次", "摆超薄球10次", "统计成功率"]}', '掌握不同薄厚球的瞄准和击打', 20, 2, 20)
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

-- ============================================================================
-- 第五招：杆法 (skill_5)
-- ============================================================================

INSERT INTO sub_skills (id, skill_id, title, description, sub_skill_order) VALUES
('sub_skill_5_1', 'skill_5', '5.1 高低杆', '掌握高杆和低杆的击打技术', 1),
('sub_skill_5_2', 'skill_5', '5.2 左右塞', '学会使用左塞和右塞控制母球旋转', 2),
('sub_skill_5_3', 'skill_5', '5.3 跳球与扎杆', '掌握跳球和扎杆特殊技术', 3)
ON CONFLICT (id) DO UPDATE SET
    skill_id = EXCLUDED.skill_id,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    sub_skill_order = EXCLUDED.sub_skill_order,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO training_units (id, sub_skill_id, unit_type, title, content, goal_description, xp_reward, unit_order, estimated_minutes) VALUES
('unit_5_1_1', 'sub_skill_5_1', 'theory', '理论：高低杆原理', '{"text": "高杆击打母球上部，使母球产生前旋，击打目标球后继续前进。低杆击打母球下部，使母球产生后旋，击打目标球后后退。", "keyPoints": ["高杆：上旋", "低杆：下旋", "击打位置", "力度配合"]}', '理解高低杆的物理原理和应用', 5, 1, 5),
('unit_5_1_2', 'sub_skill_5_1', 'practice', '练习：高低杆对比训练', '{"text": "母球与目标球相距一颗星，分别用高杆和低杆击打，观察母球击打后的运动轨迹。", "steps": ["摆放母球和目标球", "高杆击打", "观察母球前进", "低杆击打", "观察母球后退", "重复10次"]}', '通过对比练习掌握高低杆效果', 15, 2, 15),
('unit_5_2_1', 'sub_skill_5_2', 'theory', '理论：左右塞的作用', '{"text": "左塞（左旋）使母球碰库后向右偏转，右塞（右旋）使母球碰库后向左偏转。塞杆用于控制母球碰库后的走位。", "keyPoints": ["左塞右偏", "右塞左偏", "塞量控制", "反塞效应"]}', '理解左右塞对母球运动轨迹的影响', 5, 1, 5),
('unit_5_2_2', 'sub_skill_5_2', 'practice', '练习：左右塞碰库训练', '{"text": "将母球放在中台，用左塞击打顶库，观察反弹后向右偏转。然后用右塞重复，观察向左偏转。", "steps": ["母球放中台", "左塞击打顶库", "观察右偏", "右塞击打顶库", "观察左偏", "重复10次"]}', '掌握左右塞碰库后的偏转规律', 15, 2, 15),
('unit_5_3_1', 'sub_skill_5_3', 'theory', '理论：跳球技术', '{"text": "跳球用于跳过障碍球击打目标球。击打母球中下部并向下发力，使母球产生向上的力。杆头角度越大，跳得越高。", "keyPoints": ["击打中下部", "向下发力", "杆头抬起", "力度要大"]}', '理解跳球的技术原理和应用场景', 5, 1, 5),
('unit_5_3_2', 'sub_skill_5_3', 'practice', '练习：跳球基础训练', '{"text": "在母球前放置一颗障碍球，用跳球技术跳过障碍球击打后方目标球，连续成功5次。", "steps": ["摆放障碍球", "抬高杆头30度", "击打母球中下部", "母球跳起", "击中目标球", "重复直到成功5次"]}', '初步掌握跳球技术', 20, 2, 20)
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

-- ============================================================================
-- 第六招：分离角 (skill_6)
-- ============================================================================

INSERT INTO sub_skills (id, skill_id, title, description, sub_skill_order) VALUES
('sub_skill_6_1', 'skill_6', '6.1 分离角原理', '理解分离角的物理原理', 1),
('sub_skill_6_2', 'skill_6', '6.2 标准分离角', '掌握不同薄厚球的标准分离角', 2),
('sub_skill_6_3', 'skill_6', '6.3 分离角应用', '运用分离角进行精准走位', 3)
ON CONFLICT (id) DO UPDATE SET
    skill_id = EXCLUDED.skill_id,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    sub_skill_order = EXCLUDED.sub_skill_order,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO training_units (id, sub_skill_id, unit_type, title, content, goal_description, xp_reward, unit_order, estimated_minutes) VALUES
('unit_6_1_1', 'sub_skill_6_1', 'theory', '理论：什么是分离角', '{"text": "分离角是母球击打目标球后，母球与目标球运动方向之间的夹角。在无杆法的情况下，半球角度的分离角接近90度。", "keyPoints": ["分离角定义", "90度分离角", "杆法影响", "力度影响"]}', '理解分离角的基本概念', 5, 1, 5),
('unit_6_1_2', 'sub_skill_6_1', 'practice', '练习：90度分离角观察', '{"text": "摆放母球和目标球成半球角度，用中杆击打，观察母球和目标球的运动轨迹，验证90度分离角。", "steps": ["摆半球角度", "中杆击打", "观察分离角", "调整角度", "重复观察10次"]}', '通过实践观察理解90度分离角', 10, 2, 10),
('unit_6_2_1', 'sub_skill_6_2', 'theory', '理论：不同薄厚的分离角', '{"text": "正面球分离角0度，半球约90度，薄球可达170度。杆法会改变分离角：高杆减小，低杆增大。", "keyPoints": ["正面球0度", "半球90度", "薄球大角度", "杆法调整"]}', '掌握不同击球角度的分离角规律', 5, 1, 5),
('unit_6_2_2', 'sub_skill_6_2', 'practice', '练习：分离角预判训练', '{"text": "摆放5种不同薄厚的球，击打前先预判分离角，击打后验证预判是否准确。", "steps": ["摆正面球", "预判0度", "击打验证", "摆半球", "预判90度", "重复其他角度"]}', '训练对不同角度分离角的预判能力', 15, 2, 15),
('unit_6_3_1', 'sub_skill_6_3', 'theory', '理论：用分离角走位', '{"text": "利用分离角可以精确控制母球走位。通过选择击打角度和杆法，让母球按预期路线到达理想位置。", "keyPoints": ["选择角度", "配合杆法", "控制力度", "实现精准走位"]}', '理解如何运用分离角进行走位', 5, 1, 5),
('unit_6_3_2', 'sub_skill_6_3', 'practice', '练习：分离角走位应用', '{"text": "设置目标区域，通过调整击球角度利用分离角让母球停在目标区域内。", "steps": ["设定目标区域", "规划击球角度", "选择杆法", "执行击球", "检查走位", "重复10次"]}', '运用分离角实现精准走位', 20, 2, 20)
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

-- ============================================================================
-- 第七招：走位 (skill_7)
-- ============================================================================

INSERT INTO sub_skills (id, skill_id, title, description, sub_skill_order) VALUES
('sub_skill_7_1', 'skill_7', '7.1 走位规划', '学会提前规划母球走位路线', 1),
('sub_skill_7_2', 'skill_7', '7.2 区域控制', '将母球控制在理想击球区域', 2),
('sub_skill_7_3', 'skill_7', '7.3 连续走位', '实现多球连续进攻的走位', 3)
ON CONFLICT (id) DO UPDATE SET
    skill_id = EXCLUDED.skill_id,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    sub_skill_order = EXCLUDED.sub_skill_order,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO training_units (id, sub_skill_id, unit_type, title, content, goal_description, xp_reward, unit_order, estimated_minutes) VALUES
('unit_7_1_1', 'sub_skill_7_1', 'theory', '理论：走位规划思路', '{"text": "走位规划要遵循逆向思维：从最后一颗球开始规划，倒推每颗球的理想位置。好的走位应该轻松自然，避免困难球。", "keyPoints": ["逆向规划", "从终点开始", "避免困难球", "保持进攻节奏"]}', '理解走位规划的基本思路', 5, 1, 5),
('unit_7_1_2', 'sub_skill_7_1', 'practice', '练习：三球走位规划', '{"text": "摆放3颗球，在击打前规划完整走位路线，标记每次击球后母球应该到达的位置。", "steps": ["摆放3颗球", "确定击球顺序", "规划走位路线", "标记目标位置", "执行击球", "验证规划"]}', '训练多球走位的规划能力', 15, 2, 15),
('unit_7_2_1', 'sub_skill_7_2', 'theory', '理论：理想击球区域', '{"text": "每颗球都有理想击球区域，通常是正面30度角范围内。将母球控制在这个区域可以大幅提高进球成功率。", "keyPoints": ["30度区域", "正面最佳", "避开困难角", "考虑下一球"]}', '理解理想击球区域的概念', 5, 1, 5),
('unit_7_2_2', 'sub_skill_7_2', 'practice', '练习：区域控制训练', '{"text": "在球台上标记出目标球的理想击球区域，通过走位让母球停在这个区域内，重复10次。", "steps": ["标记理想区域", "摆放母球和目标球", "规划走位", "执行击球", "检查母球位置", "重复10次"]}', '训练将母球控制在理想区域的能力', 15, 2, 15),
('unit_7_3_1', 'sub_skill_7_3', 'theory', '理论：连续走位策略', '{"text": "连续走位的关键是每次击球都为下一杆创造好球。要考虑：下球难度、母球路线、力度控制、角度选择。", "keyPoints": ["为下一杆着想", "保持连续性", "力度微调", "角度优先"]}', '理解连续走位的策略', 5, 1, 5),
('unit_7_3_2', 'sub_skill_7_3', 'practice', '练习：五球连续清台', '{"text": "摆放5颗球在不同位置，要求连续进球且每次都将母球走到下一球的理想击球位置。", "steps": ["摆5颗球", "规划击球顺序", "第1球进+走位", "第2球进+走位", "连续完成5球", "记录成功次数"]}', '实现连续走位的实战应用', 25, 2, 25)
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

-- ============================================================================
-- 第八招：轻松清蛇彩 (skill_8)
-- ============================================================================

INSERT INTO sub_skills (id, skill_id, title, description, sub_skill_order) VALUES
('sub_skill_8_1', 'skill_8', '8.1 清台思路', '建立系统化的清台思维', 1),
('sub_skill_8_2', 'skill_8', '8.2 难球处理', '学会处理困难球位', 2),
('sub_skill_8_3', 'skill_8', '8.3 连续进攻', '提高连续进球能力', 3)
ON CONFLICT (id) DO UPDATE SET
    skill_id = EXCLUDED.skill_id,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    sub_skill_order = EXCLUDED.sub_skill_order,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO training_units (id, sub_skill_id, unit_type, title, content, goal_description, xp_reward, unit_order, estimated_minutes) VALUES
('unit_8_1_1', 'sub_skill_8_1', 'theory', '理论：清台基本原则', '{"text": "清台遵循：先易后难、避开风险球、保持节奏、预留黑八位置。每次击球前都要思考全局。", "keyPoints": ["先易后难", "避开陷阱", "节奏控制", "黑八规划"]}', '理解清台的基本原则和策略', 5, 1, 5),
('unit_8_1_2', 'sub_skill_8_1', 'practice', '练习：清台顺序规划', '{"text": "摆放全套彩球，在开始前规划清台顺序，标记每颗球的击打序号。", "steps": ["摆放8颗球", "观察球位", "规划击球顺序", "标记序号", "执行清台", "对比实际顺序"]}', '训练清台前的全局规划能力', 15, 2, 15),
('unit_8_2_1', 'sub_skill_8_2', 'theory', '理论：困难球的识别', '{"text": "困难球包括：贴库球、夹角球、远距离薄球、障碍球。识别困难球后，要么提前处理，要么创造机会避开。", "keyPoints": ["贴库球", "夹角球", "薄球", "障碍球", "提前处理"]}', '学会识别和评估困难球', 5, 1, 5),
('unit_8_2_2', 'sub_skill_8_2', 'practice', '练习：困难球处理训练', '{"text": "故意摆放4种困难球位，分别练习每种困难球的处理方法。", "steps": ["摆贴库球练习", "摆夹角球练习", "摆薄球练习", "摆障碍球练习", "记录每种成功率"]}', '掌握不同困难球的处理技巧', 20, 2, 20),
('unit_8_3_1', 'sub_skill_8_3', 'theory', '理论：连续进攻节奏', '{"text": "连续进攻要保持稳定节奏，不要急于求成。每次击球前都要充分观察，确保有把握后再出杆。", "keyPoints": ["稳定节奏", "充分观察", "确保把握", "避免失误"]}', '理解保持连续进攻的要点', 5, 1, 5),
('unit_8_3_2', 'sub_skill_8_3', 'practice', '练习：连续进攻挑战', '{"text": "从开球开始，尽可能连续进球直到失误。记录每次连续进球数，目标是达到连续进5球以上。", "steps": ["开球", "连续进攻", "记录进球数", "失误后重新开始", "挑战新纪录"]}', '提高连续进球的能力和稳定性', 25, 2, 25)
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

-- ============================================================================
-- 第九招：技能 (skill_9)
-- ============================================================================

INSERT INTO sub_skills (id, skill_id, title, description, sub_skill_order) VALUES
('sub_skill_9_1', 'skill_9', '9.1 安全球', '掌握防守性安全球技术', 1),
('sub_skill_9_2', 'skill_9', '9.2 解球', '学会解决被做障碍的球局', 2),
('sub_skill_9_3', 'skill_9', '9.3 特殊球', '掌握各种特殊球位的处理', 3)
ON CONFLICT (id) DO UPDATE SET
    skill_id = EXCLUDED.skill_id,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    sub_skill_order = EXCLUDED.sub_skill_order,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO training_units (id, sub_skill_id, unit_type, title, content, goal_description, xp_reward, unit_order, estimated_minutes) VALUES
('unit_9_1_1', 'sub_skill_9_1', 'theory', '理论：安全球原则', '{"text": "安全球的目的是让对手没有好球可打。要将母球和目标球都停在对手难以进攻的位置，最好是造成障碍球。", "keyPoints": ["双重困难", "造障碍", "贴库优先", "距离远"]}', '理解安全球的战术价值', 5, 1, 5),
('unit_9_1_2', 'sub_skill_9_1', 'practice', '练习：基础安全球', '{"text": "练习将母球和目标球分别停在四个不同的库边，形成最大距离的安全球局面。", "steps": ["规划安全球路线", "轻柔击打", "母球贴库", "目标球贴库", "检查距离", "重复10次"]}', '掌握基本的安全球技术', 15, 2, 15),
('unit_9_2_1', 'sub_skill_9_2', 'theory', '理论：解球技术', '{"text": "解球包括直接解球和间接解球。直接解球用跳球或弧线球，间接解球用碰库反弹。选择合适的解球方式很关键。", "keyPoints": ["跳球解", "弧线解", "碰库解", "风险评估"]}', '理解不同的解球方法', 5, 1, 5),
('unit_9_2_2', 'sub_skill_9_2', 'practice', '练习：碰库解球训练', '{"text": "设置障碍球局面，练习用碰库的方式解球并击中目标球。", "steps": ["设置障碍", "规划碰库路线", "选择击打点", "控制力度", "解球成功", "重复10次"]}', '掌握碰库解球技术', 20, 2, 20),
('unit_9_3_1', 'sub_skill_9_3', 'theory', '理论：特殊球位处理', '{"text": "特殊球位包括：双球贴库、三角区球、长台薄球等。每种特殊球位都有特定的处理技巧。", "keyPoints": ["双球贴库", "三角区", "长台薄球", "多球堆积"]}', '了解常见特殊球位及处理方法', 5, 1, 5),
('unit_9_3_2', 'sub_skill_9_3', 'practice', '练习：特殊球位综合', '{"text": "每种特殊球位练习5次，记录成功率，找出需要加强的类型。", "steps": ["双球贴库5次", "三角区5次", "长台薄球5次", "记录成功率", "针对性加强"]}', '提高处理各种特殊球位的能力', 20, 2, 20)
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

-- ============================================================================
-- 第十招：思路 (skill_10)
-- ============================================================================

INSERT INTO sub_skills (id, skill_id, title, description, sub_skill_order) VALUES
('sub_skill_10_1', 'skill_10', '10.1 战术思维', '培养战术层面的思考能力', 1),
('sub_skill_10_2', 'skill_10', '10.2 局势判断', '准确评估当前局势和优劣', 2),
('sub_skill_10_3', 'skill_10', '10.3 决策能力', '在不同情况下做出正确决策', 3)
ON CONFLICT (id) DO UPDATE SET
    skill_id = EXCLUDED.skill_id,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    sub_skill_order = EXCLUDED.sub_skill_order,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO training_units (id, sub_skill_id, unit_type, title, content, goal_description, xp_reward, unit_order, estimated_minutes) VALUES
('unit_10_1_1', 'sub_skill_10_1', 'theory', '理论：战术思维框架', '{"text": "战术思维包括：全局观察、风险评估、多步预判、灵活调整。每次击球前都要思考战术意图。", "keyPoints": ["全局观察", "风险评估", "多步预判", "灵活调整"]}', '建立完整的战术思维框架', 5, 1, 5),
('unit_10_1_2', 'sub_skill_10_1', 'practice', '练习：战术规划训练', '{"text": "观看职业比赛视频，暂停后预测球员的击球选择和理由，然后对比实际选择。", "steps": ["选择比赛视频", "暂停观察球局", "预测击球选择", "继续观看", "对比分析", "总结经验"]}', '通过观察学习提升战术思维', 20, 2, 20),
('unit_10_2_1', 'sub_skill_10_2', 'theory', '理论：局势评估要素', '{"text": "评估局势要考虑：剩余球数、球位分布、困难球数量、对手水平、自己状态。准确评估才能做出正确决策。", "keyPoints": ["球数对比", "球位分布", "难度评估", "对手分析", "状态评估"]}', '学会全面评估台面局势', 5, 1, 5),
('unit_10_2_2', 'sub_skill_10_2', 'practice', '练习：局势判断训练', '{"text": "摆放10种不同的球局，对每个球局进行优劣评估，判断应该进攻还是防守。", "steps": ["球局1评估", "判断策略", "球局2评估", "判断策略", "完成10个球局", "总结规律"]}', '训练快速准确的局势判断能力', 20, 2, 20),
('unit_10_3_1', 'sub_skill_10_3', 'theory', '理论：决策原则', '{"text": "决策要遵循：有把握优先进攻、不确定优先防守、困难球提前处理、保留好球。好的决策能显著提高胜率。", "keyPoints": ["进攻时机", "防守时机", "困难球", "保留好球"]}', '掌握击球决策的基本原则', 5, 1, 5),
('unit_10_3_2', 'sub_skill_10_3', 'practice', '练习：决策能力培养', '{"text": "实战对局中，每次击球前给自己10秒思考时间，明确这一杆的战术意图后再出杆。", "steps": ["观察球局", "10秒思考", "确定战术", "执行击球", "验证结果", "总结经验"]}', '在实战中培养良好的决策习惯', 25, 2, 25)
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

-- ============================================================================
-- 验证数据完整性
-- ============================================================================

-- 验证每个技能的子技能数量
SELECT
    s.id,
    s.title,
    COUNT(ss.id) as sub_skills_count
FROM skills s
LEFT JOIN sub_skills ss ON s.id = ss.skill_id
WHERE s.skill_order >= 2
GROUP BY s.id, s.title, s.skill_order
ORDER BY s.skill_order;

-- 验证每个子技能的训练单元数量
SELECT
    s.title as skill,
    ss.title as sub_skill,
    COUNT(tu.id) as units_count
FROM skills s
JOIN sub_skills ss ON s.id = ss.skill_id
LEFT JOIN training_units tu ON ss.id = tu.sub_skill_id
WHERE s.skill_order >= 2
GROUP BY s.title, ss.title, s.skill_order, ss.sub_skill_order
ORDER BY s.skill_order, ss.sub_skill_order;

-- 总体统计
SELECT
    '✅ 技能2-10数据插入完成' as status,
    (SELECT COUNT(*) FROM sub_skills WHERE skill_id LIKE 'skill_%' AND skill_id != 'skill_1') as total_sub_skills,
    (SELECT COUNT(*) FROM training_units WHERE sub_skill_id LIKE 'sub_skill_%' AND sub_skill_id NOT LIKE 'sub_skill_1_%') as total_training_units;
