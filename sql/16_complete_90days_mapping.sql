-- ============================================================================
-- Migration 16: 完整的90天课程映射 (所有90天)
-- 使用正确的JSONB格式: '["item1", "item2"]'::jsonb
-- ============================================================================

-- ============================================================================
-- 第1-7天：基础技术（第1-7集）
-- ============================================================================

-- Days 1-7已在15_fixed_map_52_episodes.sql中完成
-- 如果需要重新执行，取消下面的注释

-- ============================================================================
-- 第8-10天：基础技术巩固（重复第1-3集）
-- ============================================================================

UPDATE ninety_day_curriculum SET
    description = '巩固握杆基础，建立肌肉记忆。重点复习握杆力度控制。',
    objectives = '["熟练掌握握杆力度", "建立击球肌肉记忆", "保持动作一致性"]'::jsonb,
    key_points = '["握杆放松但不松懈", "钟摆运动要流畅", "每次握杆位置一致"]'::jsonb
WHERE day_number = 8;

UPDATE ninety_day_curriculum SET
    description = '巩固手架技术，提升手架稳定性。练习多种手架变化。',
    objectives = '["手架稳定性提升", "掌握多种手架形式", "快速调整手架位置"]'::jsonb,
    key_points = '["手架如同桥梁", "稳定性优先于舒适度", "根据球位灵活调整"]'::jsonb
WHERE day_number = 9;

UPDATE ninety_day_curriculum SET
    description = '巩固站位姿势，完善重心分配。一步入位练习。',
    objectives = '["重心分配精确化", "一步入位成功率提升", "站位调整速度加快"]'::jsonb,
    key_points = '["以人就杆原则", "重心80-15-5分配", "身体与球杆形成稳定三角"]'::jsonb
WHERE day_number = 10;

-- ============================================================================
-- 第11-20天：力量控制与穿透力（第8-14集）
-- ============================================================================

-- Days 11-17已在15_fixed_map_52_episodes.sql中完成

UPDATE ninety_day_curriculum SET
    description = '继续巩固翻腕技术和满弓发力。高杆吸库练习。',
    objectives = '["翻腕平顺度提升", "满弓发力稳定性", "高杆吸库命中率"]'::jsonb,
    key_points = '["手腕翻转时机", "力量衔接平顺", "发力完整性"]'::jsonb
WHERE day_number = 18;

UPDATE ninety_day_curriculum SET
    description = '长台分段发力综合练习。低杆一库技术强化。',
    objectives = '["长台低杆稳定性", "分段发力协调性", "低杆一库成功率"]'::jsonb,
    key_points = '["大臂带动小臂", "手肘向前推", "动作不需太大但要完整"]'::jsonb
WHERE day_number = 19;

UPDATE ninety_day_curriculum SET
    description = '极限低杆挑战训练。皮头唤醒器使用练习。',
    objectives = '["极限低杆技术突破", "小力低杆回一台", "皮头保养技巧"]'::jsonb,
    key_points = '["低杆点位精确性", "力量控制精细化", "皮头状态维护"]'::jsonb
WHERE day_number = 20;

-- ============================================================================
-- 第21-30天：高级瞄准技术（第15-23集映射到技能3）
-- ============================================================================

UPDATE ninety_day_curriculum SET
    description = '重心线训练提高直球分点能力。5分点瞄准法练习。',
    objectives = '["重心线理论理解", "5分点瞄准掌握", "直球分点精确度"]'::jsonb,
    key_points = '["重心线判断方法", "5分点位置识别", "瞄准线清晰度"]'::jsonb
WHERE day_number BETWEEN 21 AND 22;

UPDATE ninety_day_curriculum SET
    description = '假想球瞄准法系统学习。不同角度瞄准练习。',
    objectives = '["假想球位置复制", "角度球瞄准技术", "瞄准一致性提升"]'::jsonb,
    key_points = '["假想球体积感知", "根据距离调整假想球", "击球点精确定位"]'::jsonb
WHERE day_number BETWEEN 23 AND 25;

UPDATE ninety_day_curriculum SET
    description = '向边球和离边球瞄准技术。中袋球专项训练。',
    objectives = '["向边球瞄准掌握", "离边球耦合效应理解", "中袋球进球率提升"]'::jsonb,
    key_points = '["离边球瞄准厚一些", "向边球角度控制", "中袋角度特殊性"]'::jsonb
WHERE day_number BETWEEN 26 AND 28;

UPDATE ninety_day_curriculum SET
    description = '极限高球瞄准挑战。中级瞄准锁定技术练习。',
    objectives = '["极限高球瞄准突破", "注意力锁定方法", "动作锁定技术"]'::jsonb,
    key_points = '["看着进球线路", "试击锁定力量", "打穿透明目标球"]'::jsonb
WHERE day_number BETWEEN 29 AND 30;

-- ============================================================================
-- 第31-40天：分离角与走位技术（第24-28集映射到技能4）
-- ============================================================================

UPDATE ninety_day_curriculum SET
    description = '90度分离角标准训练。定杆点位90°K球练习。',
    objectives = '["90度分离角掌握", "定杆点位精确", "K球方向控制"]'::jsonb,
    key_points = '["中线点偏下中力", "入射角等于反射角", "力量与分离角关系"]'::jsonb
WHERE day_number BETWEEN 31 AND 33;

UPDATE ninety_day_curriculum SET
    description = '三种力量配合不同击球点位。K球前后移动练习。',
    objectives = '["力量与点位配合", "K球位置精确控制", "分离角灵活运用"]'::jsonb,
    key_points = '["击打上部球向前走", "击打下部球向后走", "中力击打沿切线90°"]'::jsonb
WHERE day_number BETWEEN 34 AND 36;

UPDATE ninety_day_curriculum SET
    description = '登杆分离角高级技术。高登杆和低登杆练习。',
    objectives = '["登杆技术掌握", "高低登杆灵活运用", "分离角精确控制"]'::jsonb,
    key_points = '["击打中心偏上/偏下一点点", "中力可移动2-3球位", "避免力量过小"]'::jsonb
WHERE day_number BETWEEN 37 AND 38;

UPDATE ninety_day_curriculum SET
    description = '不吃库走位和一库走位技术。走位路线规划练习。',
    objectives = '["不吃库走位掌握", "一库走位技术", "走位路线规划能力"]'::jsonb,
    key_points = '["15°角度最便于走位", "分力与杆法效果关系", "90°切线与弹库路线"]'::jsonb
WHERE day_number BETWEEN 39 AND 40;

-- ============================================================================
-- 第41-50天：加塞技术（第29-33集映射到技能5-6）
-- ============================================================================

UPDATE ninety_day_curriculum SET
    description = '加塞身位夹角调整。加塞瞄准基础理论学习。',
    objectives = '["身位夹角调整技巧", "加塞瞄准原理理解", "基础加塞练习"]'::jsonb,
    key_points = '["击打母球偏左/偏右", "身体角度调整方法", "瞄准补偿机制"]'::jsonb
WHERE day_number BETWEEN 41 AND 43;

UPDATE ninety_day_curriculum SET
    description = '5分点加塞训练。角度球加塞瞄准技术。',
    objectives = '["5分点加塞掌握", "角度球加塞技术", "加塞进球率提升"]'::jsonb,
    key_points = '["5分点位置识别", "左加塞瞄偏右，右加塞瞄偏左", "厚薄调整方法"]'::jsonb
WHERE day_number BETWEEN 44 AND 46;

UPDATE ninety_day_curriculum SET
    description = '顺塞和反塞走位技术。旋转控制练习。',
    objectives = '["顺塞走位技术", "反塞走位技术", "母球旋转精确控制"]'::jsonb,
    key_points = '["顺塞与旋转方向一致", "反塞与旋转方向相反", "高级旋转控制"]'::jsonb
WHERE day_number BETWEEN 47 AND 50;

-- ============================================================================
-- 第51-60天：实战清台训练（第34-42集映射到技能7）
-- ============================================================================

UPDATE ninety_day_curriculum SET
    description = '清台思路基础学习。实战清台第一阶段练习。',
    objectives = '["清台思路理解", "球路分析能力", "基础技术综合运用"]'::jsonb,
    key_points = '["清台前整体观察", "球路规划方法", "技术选择策略"]'::jsonb
WHERE day_number BETWEEN 51 AND 53;

UPDATE ninety_day_curriculum SET
    description = '实战清台进阶练习。复杂球局处理能力提升。',
    objectives = '["复杂球局分析", "清台成功率提升", "技术稳定性强化"]'::jsonb,
    key_points = '["多球路线规划", "困难球处理", "技术组合运用"]'::jsonb
WHERE day_number BETWEEN 54 AND 57;

UPDATE ninety_day_curriculum SET
    description = '弧线球技术学习。分离角原理深入理解。清台思路系统讲解。',
    objectives = '["弧线球技术掌握", "分离角物理原理", "系统清台方法论"]'::jsonb,
    key_points = '["特殊击球方法", "白球分离角物理", "初级清台完整思路"]'::jsonb
WHERE day_number BETWEEN 58 AND 60;

-- ============================================================================
-- 第61-70天：理论提升与肌肉激活（第43-49集映射到技能8-9）
-- ============================================================================

UPDATE ninety_day_curriculum SET
    description = '清台思路理论深化。肌肉激活训练方法学习。',
    objectives = '["清台理论体系", "肌肉激活重要性", "训练前热身方法"]'::jsonb,
    key_points = '["系统思维培养", "肌肉记忆建立", "状态调整技巧"]'::jsonb
WHERE day_number BETWEEN 61 AND 63;

UPDATE ninety_day_curriculum SET
    description = '肌肉激活训练第1-6套练习。建立训练前热身习惯。',
    objectives = '["6套肌肉激活掌握", "热身习惯建立", "肌肉状态快速激活"]'::jsonb,
    key_points = '["每套练习目的", "热身时长控制", "激活效果检验"]'::jsonb
WHERE day_number BETWEEN 64 AND 70;

-- ============================================================================
-- 第71-80天：节奏掌握（第50-51集循环映射到技能10）
-- ============================================================================

UPDATE ninety_day_curriculum SET
    description = '出杆节奏训练。通过节奏训练快速提升技术水平。',
    objectives = '["出杆节奏稳定性", "节奏与技术的关系", "节奏训练方法"]'::jsonb,
    key_points = '["节奏是技术提升关键", "稳定节奏带来稳定表现", "循环强化训练"]'::jsonb
WHERE day_number BETWEEN 71 AND 80;

-- ============================================================================
-- 第81-90天：综合技术运用（第52集+关键技术复习）
-- ============================================================================

UPDATE ninety_day_curriculum SET
    description = '综合运用所学技术进行实战练习，达成技术整合。第81-85天重点训练综合技术运用。',
    objectives = '["所有技术融会贯通", "实战应用能力提升", "技术体系完善"]'::jsonb,
    key_points = '["技术选择灵活性", "球局整体把控", "持续进步基础"]'::jsonb
WHERE day_number BETWEEN 81 AND 85;

-- 第86-90天：关键技术复习
UPDATE ninety_day_curriculum SET
    description = '复习关键技术：瞄准锁定、走位技术、加塞技术、分离角原理、综合运用。最后冲刺阶段。',
    objectives = '["关键技术巩固", "薄弱环节强化", "整体水平提升"]'::jsonb,
    key_points = '["瞄准精确度", "走位流畅性", "加塞运用灵活性"]'::jsonb
WHERE day_number BETWEEN 86 AND 90;

-- ============================================================================
-- 验证结果
-- ============================================================================

-- 检查总体映射情况
SELECT
    '总体映射统计' as check_type,
    COUNT(*) as total_days,
    COUNT(CASE WHEN LENGTH(description) > 50 THEN 1 END) as updated_days,
    ROUND(COUNT(CASE WHEN LENGTH(description) > 50 THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100, 1) || '%' as update_rate
FROM ninety_day_curriculum;

-- 按技能统计映射情况
SELECT
    ts.skill_name as "十大招技能",
    COUNT(*) as "总天数",
    COUNT(CASE WHEN LENGTH(ndc.description) > 50 THEN 1 END) as "已更新天数",
    ROUND(AVG(jsonb_array_length(ndc.objectives)), 1) as "平均目标数",
    ROUND(AVG(jsonb_array_length(ndc.key_points)), 1) as "平均要点数"
FROM ninety_day_curriculum ndc
LEFT JOIN tencore_skills ts ON ndc.tencore_skill_id = ts.id
GROUP BY ts.skill_name, ts.skill_number
ORDER BY ts.skill_number;

-- 显示每10天的映射示例
SELECT
    day_number as "天数",
    original_course_ref as "课程引用",
    LEFT(title, 30) as "标题",
    LEFT(description, 40) || '...' as "简介",
    jsonb_array_length(objectives) as "目标数",
    jsonb_array_length(key_points) as "要点数"
FROM ninety_day_curriculum
WHERE day_number IN (1, 10, 20, 30, 40, 50, 60, 70, 80, 90)
ORDER BY day_number;

-- 检查是否有未更新的天数
SELECT
    day_number as "未完整更新的天数",
    title,
    CASE
        WHEN LENGTH(description) < 50 THEN '❌ description过短'
        WHEN objectives IS NULL OR jsonb_array_length(objectives) = 0 THEN '❌ 缺少objectives'
        WHEN key_points IS NULL OR jsonb_array_length(key_points) = 0 THEN '❌ 缺少key_points'
        ELSE '✅ 完整'
    END as status
FROM ninety_day_curriculum
WHERE LENGTH(description) < 50
    OR objectives IS NULL
    OR jsonb_array_length(objectives) = 0
    OR key_points IS NULL
    OR jsonb_array_length(key_points) = 0
ORDER BY day_number;
