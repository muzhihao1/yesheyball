-- ============================================================================
-- Migration 15 (修复版): 直接将52集课程内容映射到90天课程
-- 修复: 使用正确的JSONB格式 (JSON字符串而不是ARRAY)
-- ============================================================================

-- 第1天：第1集 - 握杆基础训练
UPDATE ninety_day_curriculum
SET
    description = '学习正确的握杆姿势，建立良好的击球基础。重点掌握握杆的力度和位置。参照教学内容，左手扶杆，右手做钟摆状运动，直到握力掌握。',
    objectives = '["熟练掌握握力为止", "手握空拳，掌心贴合球杆", "不要刻意松指或握紧"]'::jsonb,
    key_points = '["握杆位置：后手握杆点距离杆尾30cm左右", "握力控制：既不太紧也不太松", "运杆平顺：钟摆状运动"]'::jsonb
WHERE day_number = 1 AND original_course_ref = '第1集';

-- 第2天：第2集 - 手架技术练习
UPDATE ninety_day_curriculum
SET
    description = '掌握稳定的手架技术，为精准击球做准备。练习不同距离的手架摆放。让每种手架稳定支撑为止。',
    objectives = '["掌握稳定手架技巧", "大拇指与食指关节紧紧相贴", "手架浮于台面，便于移动"]'::jsonb,
    key_points = '["手架稳定性是击球准确的基础", "身体重量不能压在手架上", "练习不同距离的手架调整"]'::jsonb
WHERE day_number = 2 AND original_course_ref = '第2集';

-- 第3天：第3集 - 站位与姿势调整
UPDATE ninety_day_curriculum
SET
    description = '学习正确的站位和身体姿势，建立稳定的击球平台。配合球杆去站位，以人就杆熟练分配重心比例为止。',
    objectives = '["掌握正确站位与姿势", "重心分配：右脚80%，左脚15%，手架5%", "移动手架时必须调整身体重心"]'::jsonb,
    key_points = '["以人就杆，不是以杆就人", "重心稳定是准确击球的前提", "练习一步入位"]'::jsonb
WHERE day_number = 3 AND original_course_ref = '第3集';

-- 第4天：第4集 - 入位与击球节奏
UPDATE ninety_day_curriculum
SET
    description = '培养良好的入位习惯和击球节奏，提高击球的一致性。确定进球线路，一步入位。',
    objectives = '["空杆与击球交替训练", "一步入位", "运杆平顺度"]'::jsonb,
    key_points = '["站着时候就瞄准", "节奏训练20组以上", "培养击球一致性"]'::jsonb
WHERE day_number = 4 AND original_course_ref = '第4集';

-- 第5天：第5集 - 空杆与节奏训练
UPDATE ninety_day_curriculum
SET
    description = '通过空杆练习建立稳定的击球节奏，培养肌肉记忆。感受提水桶时大臂的发力感觉。',
    objectives = '["掌握正确发力方式", "空杆训练20组", "注意大臂和手肘的配合练习"]'::jsonb,
    key_points = '["平顺度是关键", "站着时候就瞄准", "逐渐加速，力量穿过母球直达目标球"]'::jsonb
WHERE day_number = 5 AND original_course_ref = '第5集';

-- 第6天：第6集 - 初级瞄准技术
UPDATE ninety_day_curriculum
SET
    description = '学习基础瞄准技术，掌握瞄准线的概念和应用。空杆练习20次，击球练习20组。',
    objectives = '["掌握瞄准基础技术", "理解中心点：看母球最上方与最下方的连线", "击球时力量无需很大"]'::jsonb,
    key_points = '["出杆要逐渐加速，击打母球后要送出去", "力量要穿过母球直达目标球上", "瞄准线练习20组"]'::jsonb
WHERE day_number = 6 AND original_course_ref = '第6集';

-- 第7天：第7集 - 低杆发力平稳度
UPDATE ninety_day_curriculum
SET
    description = '练习低杆技术，重点掌握发力的平稳度和控制。低杆练习稍有角度。',
    objectives = '["空杆训练20次", "击球训练（球摆出一点角度）20次", "每杆均匀抹巧粉"]'::jsonb,
    key_points = '["低杆击打位置：母球最底下高约半颗皮头的位置", "回杆慢慢回，逐渐加速推出球杆", "低杆应至少拉回一台"]'::jsonb
WHERE day_number = 7 AND original_course_ref = '第7集';

-- 第11天：第8集 - 穿透力训练
UPDATE ninety_day_curriculum
SET
    description = '学习通过手肘动作增加穿透力，提高击球效果。低杆练习小臂加手肘。',
    objectives = '["空杆慢速训练20次", "稍稍加快出杆末端速度训练20次", "小力量击球训练20组，每组10颗"]'::jsonb,
    key_points = '["手肘用于衔接小臂摆动力量", "当小臂逐渐快用完力时，小臂继续摆动的同时手肘向前推", "握杆手避免碰胸"]'::jsonb
WHERE day_number = 11 AND original_course_ref = '第8集';

-- 第12天：第9集 - 初级预力控制
UPDATE ninety_day_curriculum
SET
    description = '掌握基础的力量控制技术，学会判断和调节击球力度。三段力量训练。',
    objectives = '["小臂力量用完（中力），连续5杆到中袋附近合格", "小臂加手腕连续5杆到中袋和底库中间合格", "小臂加手腕加手肘"]'::jsonb,
    key_points = '["三段力量：小臂60%，手腕20%，手肘20%", "小臂中力可以回到中袋附近", "小臂中力加手腕翻动可以回到中袋靠后"]'::jsonb
WHERE day_number = 12 AND original_course_ref = '第9集';

-- 第13天：第10集 - 中级预力锁定
UPDATE ninety_day_curriculum
SET
    description = '通过试杆练习锁定合适的击球力量，提高击球精度。母球停在洞口前方。',
    objectives = '["球杆拉回最后方再完全推出来，母球停在洞口前方却不能进袋", "任意位置将母球推至洞口", "眼睛要始终盯着母球要停到的位置"]'::jsonb,
    key_points = '["试击：更加精确的预力", "趴下后来回运杆进行尝试击打", "通过试击锁定力量"]'::jsonb
WHERE day_number = 13 AND original_course_ref = '第10集';

-- 第14天：第11集 - 低杆力量控制
UPDATE ninety_day_curriculum
SET
    description = '在低杆击球中运用力量控制技术，掌握精确的力度调节。量值：0的力量中级预力练习。',
    objectives = '["将小臂练出3个稳定的力量：5、10、15力量", "在小臂各力量等级下，一点点增加手腕的力量", "低杆回中袋：小臂5力量+手腕0力量"]'::jsonb,
    key_points = '["通过试击来控制母球低杆的距离", "试击时，先进行小臂的长试击，再进行手腕力量与方向的短试击", "精确控制低杆回球距离"]'::jsonb
WHERE day_number = 14 AND original_course_ref = '第11集';

-- 第15天：第12集 - 翻腕技术训练
UPDATE ninety_day_curriculum
SET
    description = '练习手腕翻转技术，提高击球的稳定性和精确性。高杆吸库（小角度）。',
    objectives = '["空杆加速训练，感觉小臂拖出来手腕很重", "高杆吸库，每组10颗球，练习10组", "训练手腕翻动的平顺度"]'::jsonb,
    key_points = '["要感受小臂拖出来时手腕很重的感觉", "由后面三指接触球杆到前面后掌心接触球杆", "高杆吸库：比中杆高出半颗皮头位置"]'::jsonb
WHERE day_number = 15 AND original_course_ref = '第12集';

-- 第16天：第13集 - 满弓发力训练
UPDATE ninety_day_curriculum
SET
    description = '学习满弓发力技术，掌握大力击球的要领。大臂-小臂-手腕-手肘分段发力训练。',
    objectives = '["掌握分段发力技术", "提升动作协调性", "理解力量传递顺序"]'::jsonb,
    key_points = '["分段发力顺序：大臂→小臂→手腕→手肘", "动作连贯性", "力量平顺传递"]'::jsonb
WHERE day_number = 16 AND original_course_ref = '第13集';

-- 第17天：第14集 - 长台分段发力1
UPDATE ninety_day_curriculum
SET
    description = '在长台球中练习分段发力，掌握中低杆的运用。动作平顺度最重要的练习，1-2个月。',
    objectives = '["长台低杆加速训练", "进行动作的加速训练", "重点在力量衔接平顺度感觉"]'::jsonb,
    key_points = '["大臂先缓慢把小臂拖出来，然后小臂加速，手腕加速，由手肘向前推", "动作不需太大也可以低杆一库", "根据掌握情况定，需要1-2个月"]'::jsonb
WHERE day_number = 17 AND original_course_ref = '第14集';

-- ============================================================================
-- 验证更新结果
-- ============================================================================

SELECT
    '更新验证' as check_type,
    COUNT(*) as total_updated,
    COUNT(CASE WHEN description LIKE '%第%集%' OR description LIKE '%学习%' OR description LIKE '%练习%' THEN 1 END) as has_content
FROM ninety_day_curriculum
WHERE day_number BETWEEN 1 AND 17;

-- 显示更新后的前17天内容
SELECT
    day_number as "天数",
    original_course_ref as "对应集数",
    title as "标题",
    LEFT(description, 50) || '...' as "简介",
    jsonb_array_length(objectives) as "训练目标数",
    jsonb_array_length(key_points) as "关键要点数"
FROM ninety_day_curriculum
WHERE day_number BETWEEN 1 AND 17
ORDER BY day_number;

-- 查看第1天的完整内容示例
SELECT
    day_number,
    title,
    description,
    objectives,
    key_points
FROM ninety_day_curriculum
WHERE day_number = 1;
