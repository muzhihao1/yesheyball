-- ============================================================================
-- Migration 18: 批量更新所有90天课程（通用版本）
-- 策略：根据day_number顺序，统一赋予详细的训练内容
-- ============================================================================

-- 第2-10天：基础技术巩固
UPDATE ninety_day_curriculum SET
    description = '巩固基础技术，建立稳固的击球基础。重点练习握杆、手架、站位、节奏等核心技术。通过反复练习建立肌肉记忆。',
    objectives = '["巩固基础技术", "建立肌肉记忆", "提高动作一致性", "增强基本功稳定性"]'::jsonb,
    key_points = '["重复是精通的关键", "每次练习保持标准动作", "注重细节和准确性", "建立正确的肌肉记忆"]'::jsonb
WHERE day_number >= 2 AND day_number <= 10;

-- 第11-20天：力量控制训练
UPDATE ninety_day_curriculum SET
    description = '系统学习力量控制技术，掌握穿透力、预力控制、低杆力量等关键技术。通过手肘、手腕、小臂的协调配合，实现精确的力量控制。',
    objectives = '["掌握力量控制技术", "学习三段发力法", "提高击球穿透力", "精确控制力度"]'::jsonb,
    key_points = '["小臂60%、手腕20%、手肘20%的力量分配", "大臂带动小臂发力", "手肘向前推增加穿透力", "通过试击锁定力量"]'::jsonb
WHERE day_number >= 11 AND day_number <= 20;

-- 第21-30天：高级瞄准技术
UPDATE ninety_day_curriculum SET
    description = '深入学习高级瞄准技术，包括5分点瞄准法、重心线训练、假想球瞄准法等。提高瞄准精度和进球稳定性。',
    objectives = '["掌握5分点瞄准法", "学习假想球瞄准", "提高瞄准精确度", "增强进球稳定性"]'::jsonb,
    key_points = '["5分点位置识别", "重心线判断方法", "假想球体积感知", "瞄准注意力锁定"]'::jsonb
WHERE day_number >= 21 AND day_number <= 30;

-- 第31-37天：五分点系统训练
UPDATE ninety_day_curriculum SET
    description = '系统学习五分点理论，从1分点到5分点逐一掌握。通过专项训练提高在不同角度下的进球能力。',
    objectives = '["掌握五分点理论", "熟练识别各分点位置", "提高角度球进球率", "建立完整瞄准体系"]'::jsonb,
    key_points = '["1分点：薄球", "2分点：半球", "3分点：中心", "4分点：厚球", "5分点：超厚球"]'::jsonb
WHERE day_number >= 31 AND day_number <= 37;

-- 第38-48天：瞄准系统深化
UPDATE ninety_day_curriculum SET
    description = '深化瞄准技术，学习向边球、离边球、极限高球等特殊角度的瞄准方法。掌握瞄准锁定技术，提升准度。',
    objectives = '["掌握特殊角度瞄准", "学习瞄准锁定技术", "提高准度稳定性", "完善瞄准体系"]'::jsonb,
    key_points = '["离边球瞄厚一些", "向边球角度控制", "注意力锁定方法", "平行法与重合法"]'::jsonb
WHERE day_number >= 38 AND day_number <= 48;

-- 第49-60天：杆法与分离角
UPDATE ninety_day_curriculum SET
    description = '系统学习杆法技术和分离角原理。掌握高杆、中杆、低杆的应用，理解90度分离角及力量与分离角的关系。',
    objectives = '["掌握三种基本杆法", "理解分离角原理", "学会力量配合击球点", "提高走位能力"]'::jsonb,
    key_points = '["90度标准分离角", "力量越大分离角越小", "击打上部向前走", "击打下部向后走", "登杆技术要点"]'::jsonb
WHERE day_number >= 49 AND day_number <= 60;

-- 第61-67天：分离角深化
UPDATE ninety_day_curriculum SET
    description = '深入学习分离角技术，掌握不同力量下的分离角控制。通过专项训练提高走位的精确度。',
    objectives = '["精确控制分离角", "掌握力量与角度关系", "提高走位精确度", "完善走位体系"]'::jsonb,
    key_points = '["小力分离角大于90度", "大力分离角小于90度", "中力标准90度", "K球位置精确控制"]'::jsonb
WHERE day_number >= 61 AND day_number <= 67;

-- 第68-76天：走位技术系统
UPDATE ninety_day_curriculum SET
    description = '系统学习走位技术，包括不吃库走位、一库走位、顺塞走位、反塞走位等。掌握点走位、线走位、面走位的不同应用。',
    objectives = '["掌握多种走位技术", "学会顺塞反塞运用", "提高走位路线规划能力", "完善走位控制"]'::jsonb,
    key_points = '["15度角最便于走位", "顺塞与旋转方向一致", "反塞与旋转方向相反", "点线面走位应用场景"]'::jsonb
WHERE day_number >= 68 AND day_number <= 76;

-- 第77-83天：实战清台训练
UPDATE ninety_day_curriculum SET
    description = '实战清台训练，学习清台思路和策略规划。通过实战练习提高清台成功率和技术综合运用能力。',
    objectives = '["学习清台思路", "提高清台成功率", "增强球路分析能力", "完善技术综合运用"]'::jsonb,
    key_points = '["清台前整体观察", "球路规划方法", "困难球处理策略", "技术选择与组合"]'::jsonb
WHERE day_number >= 77 AND day_number <= 83;

-- 第84-90天：综合提升与测试
UPDATE ninety_day_curriculum SET
    description = '最后阶段的综合训练和技能测试。复习和巩固所有学过的技术，进行十大招终极考核。全面提升台球技术水平。',
    objectives = '["综合运用所有技术", "通过十大招考核", "达到技术整合", "完成90天系统训练"]'::jsonb,
    key_points = '["所有技术融会贯通", "实战应用能力", "技术稳定性", "持续进步的基础"]'::jsonb
WHERE day_number >= 84 AND day_number <= 90;

-- ============================================================================
-- 验证结果
-- ============================================================================

SELECT
    '批量更新验证' as check_type,
    COUNT(*) as total_days,
    COUNT(CASE WHEN LENGTH(description) > 50 THEN 1 END) as updated_days,
    COUNT(CASE WHEN LENGTH(description) <= 50 THEN 1 END) as remaining_days,
    ROUND(COUNT(CASE WHEN LENGTH(description) > 50 THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100, 1) || '%' as update_rate
FROM ninety_day_curriculum;

-- 显示每个范围的示例
SELECT
    day_number,
    LEFT(title, 40) as title,
    LEFT(description, 60) || '...' as description,
    jsonb_array_length(objectives) as obj_count,
    jsonb_array_length(key_points) as kp_count
FROM ninety_day_curriculum
WHERE day_number IN (1, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90)
ORDER BY day_number;

-- 检查是否还有未更新的
SELECT COUNT(*) as remaining_short_descriptions
FROM ninety_day_curriculum
WHERE LENGTH(description) <= 50;
