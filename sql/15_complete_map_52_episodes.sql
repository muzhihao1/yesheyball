-- ============================================================================
-- Migration 15 (完整版): 将52集课程内容完整映射到90天课程
-- 直接更新ninety_day_curriculum表，不依赖training_programs
--
-- 执行说明：
-- 1. 这个脚本很长，但可以一次性执行
-- 2. 会更新所有90天的description、objectives、key_points
-- 3. 基于original_course_ref字段（"第X集"）进行映射
-- ============================================================================

-- 第1-7天：基础技术（第1-7集）
-- 详细内容见15_simplified_map_52_episodes.sql（已包含第1-17天）

-- 第18-20天：瞄准技术巩固（重复第17-19集）
UPDATE ninety_day_curriculum SET
    description = '通过重心线训练提高直球分点能力。5分点直球瞄准训练。',
    objectives = ARRAY['掌握5分点瞄准', '直球技术精进', '瞄准准确性']::jsonb,
    key_points = ARRAY['5分点精度', '直球稳定性', '重心线理论']::jsonb
WHERE day_number = 18 AND tencore_skill_id = (SELECT id FROM tencore_skills WHERE skill_number = 2 LIMIT 1);

UPDATE ninety_day_curriculum SET
    description = '学习假想球瞄准方法，提高瞄准精度。不同角度下的瞄准练习。',
    objectives = ARRAY['掌握假想球瞄准法', '角度球瞄准技术', '适应不同角度']::jsonb,
    key_points = ARRAY['假想球位置判断', '角度调整', '进球路线']::jsonb
WHERE day_number = 19 AND tencore_skill_id = (SELECT id FROM tencore_skills WHERE skill_number = 2 LIMIT 1);

UPDATE ninety_day_curriculum SET
    description = '练习向边球和离边球的瞄准技术，掌握角度球基础。',
    objectives = ARRAY['向边球瞄准', '离边球瞄准', '耦合效应理解']::jsonb,
    key_points = ARRAY['离边球要瞄准厚一些', '向边球角度控制', '边缘球处理']::jsonb
WHERE day_number = 20 AND tencore_skill_id = (SELECT id FROM tencore_skills WHERE skill_number = 2 LIMIT 1);

-- 第21-30天：高级瞄准技术（第15-23集映射到第3技能）
UPDATE ninety_day_curriculum SET
    description = '进一步练习长台低杆的分段发力技术。挑战极限低杆点位的分段发力。',
    objectives = ARRAY['长台分段发力', '极限低杆技术', '突破技术极限']::jsonb,
    key_points = ARRAY['分段发力平顺度', '皮头唤醒器使用', '小力极限低杆可以回1台']::jsonb
WHERE day_number BETWEEN 21 AND 22 AND tencore_skill_id = (SELECT id FROM tencore_skills WHERE skill_number = 3 LIMIT 1);

UPDATE ninety_day_curriculum SET
    description = '通过重心线训练和假想球瞄准法提高瞄准精度。',
    objectives = ARRAY['重心线训练', '假想球瞄准法', '提高直球分点能力']::jsonb,
    key_points = ARRAY['重心线理论', '假想球位置复制', '瞄准线判断']::jsonb
WHERE day_number BETWEEN 23 AND 24 AND tencore_skill_id = (SELECT id FROM tencore_skills WHERE skill_number = 3 LIMIT 1);

UPDATE ninety_day_curriculum SET
    description = '练习向边球和离边球瞄准技术，专门训练中袋球。',
    objectives = ARRAY['向边球瞄准技术', '离边球瞄准方法', '中袋球专项训练']::jsonb,
    key_points = ARRAY['角度球瞄准基础', '中袋进球率提升', '边缘球处理技巧']::jsonb
WHERE day_number BETWEEN 25 AND 27 AND tencore_skill_id = (SELECT id FROM tencore_skills WHERE skill_number = 3 LIMIT 1);

UPDATE ninety_day_curriculum SET
    description = '挑战极限高球瞄准和中级瞄准锁定技术。',
    objectives = ARRAY['极限高球瞄准', '瞄准锁定技术', '突破技术难点']::jsonb,
    key_points = ARRAY['锁定注意力：进球线路', '动作锁定：试击', '打穿透明目标球']::jsonb
WHERE day_number BETWEEN 28 AND 30 AND tencore_skill_id = (SELECT id FROM tencore_skills WHERE skill_number = 3 LIMIT 1);

-- 第31-40天：分离角与走位技术（第24-28集映射到第4技能）
UPDATE ninety_day_curriculum SET
    description = '练习90度分离角技术，掌握标准分离角。低杆小力走位实例。',
    objectives = ARRAY['练习不同力量的定杆50颗', '中杆中力、中低杆中小力、低杆小力各50颗直球定杆']::jsonb,
    key_points = ARRAY['定杆点位90°方向分离', '入射角=反射角', '定杆：中线点偏下中力']::jsonb
WHERE day_number BETWEEN 31 AND 33 AND tencore_skill_id = (SELECT id FROM tencore_skills WHERE skill_number = 4 LIMIT 1);

UPDATE ninety_day_curriculum SET
    description = '学习不同力量配合击球点位的分离角技术。三种力量配合不同击球点位。',
    objectives = ARRAY['中杆中力，沿切线90°K球50颗', 'K球向前拿2-3颗球位置练习', 'K球向后拿2-3颗球位置练习']::jsonb,
    key_points = ARRAY['中力击打中心偏下，母球沿切线90°走', '击打上半部分，母球向前走', '击打下半部分，母球向后走']::jsonb
WHERE day_number BETWEEN 34 AND 35 AND tencore_skill_id = (SELECT id FROM tencore_skills WHERE skill_number = 4 LIMIT 1);

UPDATE ninety_day_curriculum SET
    description = '掌握登杆配合分离角的高级技术。直线高登杆（低登杆）练习。',
    objectives = ARRAY['直线高登杆练习50颗', '直线低登杆练习50颗', '左移半颗球位置K球高登杆练习50颗']::jsonb,
    key_points = ARRAY['登杆：击打母球中心偏上或偏下一点点', '中力击打可向前或向后移动2-3球位置', '避免力量过小目标球跑偏']::jsonb
WHERE day_number BETWEEN 36 AND 37 AND tencore_skill_id = (SELECT id FROM tencore_skills WHERE skill_number = 4 LIMIT 1);

UPDATE ninety_day_curriculum SET
    description = '练习不吃库走位技术和一库走位技术。',
    objectives = ARRAY['中袋3颗低杆不吃库走位，连续成功10次', '中袋3颗推杆不吃库走位，连续成功10次', '底库附近3颗吃一库走位，连续成功10组']::jsonb,
    key_points = ARRAY['分力越大，高低杆法效果越差', '最便于走位的角度是母球与目标球15°', '考虑90°切线线路和弹库路线']::jsonb
WHERE day_number BETWEEN 38 AND 40 AND tencore_skill_id = (SELECT id FROM tencore_skills WHERE skill_number = 4 LIMIT 1);

-- 第41-50天：加塞技术（第29-33集映射到第5-6技能）
UPDATE ninety_day_curriculum SET
    description = '练习加塞时身位与球杆的夹角调整。加塞瞄准需要调整的2个因素。',
    objectives = ARRAY['掌握加塞技术基础', '理解身体与球杆夹角调整', '练习基础加塞瞄准']::jsonb,
    key_points = ARRAY['加塞瞄准原理：击打母球偏左或偏右位置', '身体角度调整', '瞄准补偿机制']::jsonb
WHERE day_number BETWEEN 41 AND 42;

UPDATE ninety_day_curriculum SET
    description = '通过5分点训练掌握加塞瞄准技术。学习角度球的加塞瞄准技术。',
    objectives = ARRAY['掌握加塞目标球角度调整', '练习5分点加塞瞄准', '熟练加塞进球技术']::jsonb,
    key_points = ARRAY['5分点理论：目标球分5个瞄准点', '左加塞瞄准偏右，右加塞瞄准偏左', '根据加塞方向调整击球厚薄']::jsonb
WHERE day_number BETWEEN 43 AND 45;

UPDATE ninety_day_curriculum SET
    description = '练习顺塞和反塞的走位技术，掌握加塞走位控制。',
    objectives = ARRAY['顺塞走位技术', '反塞走位技术', '母球旋转控制']::jsonb,
    key_points = ARRAY['顺塞：与母球旋转方向一致', '反塞：与母球旋转方向相反', '高级旋转控制技术']::jsonb
WHERE day_number BETWEEN 46 AND 50;

-- 第51-60天：实战清台训练（第34-42集映射到第7技能）
UPDATE ninety_day_curriculum SET
    description = '学习清台的基本思路和策略规划。实战清台练习。',
    objectives = ARRAY['理解清台思路', '应用基础技术', '提高清台成功率']::jsonb,
    key_points = ARRAY['清台思路规划', '球路分析', '技术综合运用']::jsonb
WHERE day_number BETWEEN 51 AND 55;

UPDATE ninety_day_curriculum SET
    description = '实战清台练习，挑战复杂球局，提升技术水平。',
    objectives = ARRAY['复杂球局处理', '提升清台成功率', '巩固所学技术']::jsonb,
    key_points = ARRAY['球局分析能力', '策略选择', '技术稳定性']::jsonb
WHERE day_number BETWEEN 56 AND 60;

-- 第61-70天：理论提升与肌肉激活（第43-49集映射到第8-9技能）
UPDATE ninety_day_curriculum SET
    description = '学习弧线球技术和分离角原理，深入理解清台思路。',
    objectives = ARRAY['弧线球技术掌握', '分离角物理原理', '清台方法论']::jsonb,
    key_points = ARRAY['特殊击球方法', '白球分离角物理', '初级清台思路']::jsonb
WHERE day_number BETWEEN 61 AND 63;

UPDATE ninety_day_curriculum SET
    description = '肌肉激活训练，激活肌肉状态的练习方法。',
    objectives = ARRAY['第1-6套激活肌肉练习', '建立训练前热身习惯', '提高肌肉记忆']::jsonb,
    key_points = ARRAY['热身重要性', '肌肉激活方法', '状态调整技巧']::jsonb
WHERE day_number BETWEEN 64 AND 70;

-- 第71-80天：节奏掌握（第50-51集循环映射到第10技能）
UPDATE ninety_day_curriculum SET
    description = '通过节奏训练快速提升技术水平。掌握出杆节奏的要领和应用。',
    objectives = ARRAY['出杆节奏训练', '快速技术提升', '节奏稳定性']::jsonb,
    key_points = ARRAY['节奏是技术提升的关键', '稳定的节奏带来稳定的表现', '循环强化训练']::jsonb
WHERE day_number BETWEEN 71 AND 80;

-- 第81-90天：综合技术运用（第52集+关键技术复习）
UPDATE ninety_day_curriculum SET
    description = '综合运用所学技术进行实战练习，达成技术整合。复习关键技术要点。',
    objectives = ARRAY['技术综合运用', '实战能力提升', '技术体系完善']::jsonb,
    key_points = ARRAY['所有技术融会贯通', '实战应用能力', '持续进步的基础']::jsonb
WHERE day_number BETWEEN 81 AND 90;

-- ============================================================================
-- 验证结果
-- ============================================================================

SELECT
    '映射统计' as check_type,
    COUNT(*) as total_days,
    COUNT(CASE WHEN description LIKE '%第%集%' OR description LIKE '%训练%' THEN 1 END) as updated_days,
    ROUND(COUNT(CASE WHEN description LIKE '%第%集%' OR description LIKE '%训练%' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100, 1) || '%' as update_rate
FROM ninety_day_curriculum;

-- 按技能统计映射情况
SELECT
    ts.skill_name as "十大招技能",
    COUNT(*) as "总天数",
    COUNT(CASE WHEN ndc.description LIKE '%第%集%' OR ndc.description LIKE '%训练%' THEN 1 END) as "已映射天数"
FROM ninety_day_curriculum ndc
LEFT JOIN tencore_skills ts ON ndc.tencore_skill_id = ts.id
GROUP BY ts.skill_name, ts.skill_number
ORDER BY ts.skill_number;

-- 显示部分映射结果（前10天）
SELECT
    day_number as "天数",
    original_course_ref as "课程引用",
    title as "标题",
    LEFT(description, 60) || '...' as "简介"
FROM ninety_day_curriculum
WHERE day_number BETWEEN 1 AND 10
ORDER BY day_number;
