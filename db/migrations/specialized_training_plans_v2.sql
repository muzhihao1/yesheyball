-- Migration: Specialized Training Plans V2
-- Integrates the three-level difficulty system (入门、进阶、大师)
-- Based on the reference design document

-- Clear existing plans if any
DELETE FROM specialized_training_plans WHERE id LIKE 'plan_%';

-- ============================================================================
-- 1. 基本功训练道场 (Basic Fundamentals Dojo)
-- ============================================================================

INSERT INTO specialized_training_plans (id, training_id, title, description, difficulty, estimated_time_minutes, xp_reward, metadata, content)
VALUES
(
  'plan_basic_beginner',
  'st_basic',
  '站位与姿势练习',
  '入门级基本功训练：反复练习标准的站位和姿势，做到稳定、舒适。形成标准的击球姿势。',
  'easy',
  30,
  20,
  '{"trainingType": "fundamentals", "primarySkill": "基本功", "level": "入门", "recordConfig": {"metrics": ["stability", "consistency"], "scoringMethod": "performance", "targetSuccessRate": 85}}'::jsonb,
  '{"duration": 30, "goal": "形成标准的击球姿势", "evaluation": "每次击球都能保持稳定的姿势", "keyPoints": ["站位稳定", "重心平衡", "姿势舒适", "视线正确"], "practice": ["镜前练习站位", "空杆练习", "观察专业选手姿势"]}'::jsonb
),
(
  'plan_basic_intermediate',
  'st_basic',
  '握杆与手架练习',
  '进阶级基本功训练：练习正确的握杆方法和稳固的手架，能够根据不同球形变换手架。',
  'medium',
  45,
  30,
  '{"trainingType": "fundamentals", "primarySkill": "基本功", "level": "进阶", "recordConfig": {"metrics": ["gripControl", "bridgeStability"], "scoringMethod": "performance", "targetSuccessRate": 80}}'::jsonb,
  '{"duration": 45, "goal": "掌握稳固的握杆和手架", "evaluation": "能够根据不同球形变换手架", "keyPoints": ["握杆松紧适度", "手架稳固", "能变换不同手架", "远台手架"], "practice": ["标准握杆练习", "凤眼手架", "V形手架", "远台手架"]}'::jsonb
),
(
  'plan_basic_master',
  'st_basic',
  '出杆精准度练习',
  '大师级基本功训练：做到出杆笔直、平顺，能够长时间保持出杆的稳定性。',
  'hard',
  60,
  40,
  '{"trainingType": "fundamentals", "primarySkill": "基本功", "level": "大师", "recordConfig": {"metrics": ["strokeAccuracy", "consistency"], "scoringMethod": "performance", "targetSuccessRate": 90}}'::jsonb,
  '{"duration": 60, "goal": "做到出杆笔直、平顺", "evaluation": "能够长时间保持出杆的稳定性", "keyPoints": ["出杆笔直", "运杆平顺", "延伸完整", "回杆稳定"], "practice": ["空杆练习200次", "瓶颈练习", "摆球练习", "长时间练习"]}'::jsonb
);

-- ============================================================================
-- 2. 准度训练道场 (Accuracy Training Dojo)
-- ============================================================================

INSERT INTO specialized_training_plans (id, training_id, title, description, difficulty, estimated_time_minutes, xp_reward, metadata, content)
VALUES
(
  'plan_accuracy_beginner',
  'st_accuracy',
  '直线球练习（短、中距离）',
  '入门级准度训练：练习不同距离下的直线球击打，掌握直线球的稳定击打。',
  'easy',
  30,
  20,
  '{"trainingType": "accuracy", "primarySkill": "准度", "level": "入门", "recordConfig": {"metrics": ["successRate"], "scoringMethod": "percentage", "targetSuccessRate": 80}}'::jsonb,
  '{"duration": 30, "goal": "掌握直线球的稳定击打", "evaluation": "10颗球进8颗为合格", "sets": 5, "repsPerSet": 10, "keyPoints": ["瞄准球心", "出杆稳定", "力度均匀", "延伸完整"], "distances": ["近台(1球台)", "中台(2球台)", "远台(3球台)"]}'::jsonb
),
(
  'plan_accuracy_intermediate',
  'st_accuracy',
  '角度球练习（15、30度）',
  '进阶级准度训练：练习15、30度等常见角度的击打，建立角度球的初步感觉。',
  'medium',
  45,
  30,
  '{"trainingType": "accuracy", "primarySkill": "准度", "level": "进阶", "recordConfig": {"metrics": ["angleAccuracy"], "scoringMethod": "percentage", "targetSuccessRate": 60}}'::jsonb,
  '{"duration": 45, "goal": "建立角度球的初步感觉", "evaluation": "10颗球进6颗为合格", "sets": 5, "repsPerSet": 10, "angles": ["15度", "30度", "45度"], "keyPoints": ["找准切点", "瞄准修正", "力度控制", "杆法配合"]}'::jsonb
),
(
  'plan_accuracy_master',
  'st_accuracy',
  '贴库球与翻袋练习',
  '大师级准度训练：克服特殊球形的心理障碍，掌握贴库球和翻袋技巧。',
  'hard',
  60,
  50,
  '{"trainingType": "accuracy", "primarySkill": "准度", "level": "大师", "recordConfig": {"metrics": ["specialShotAccuracy"], "scoringMethod": "percentage", "targetSuccessRate": 50}}'::jsonb,
  '{"duration": 60, "goal": "克服特殊球形的心理障碍", "evaluation": "10颗球进5颗为合格", "sets": 5, "repsPerSet": 10, "shotTypes": ["贴库球", "中袋翻袋", "底袋翻袋"], "keyPoints": ["克服心理压力", "精确瞄准", "力度把控", "杆法运用"]}'::jsonb
);

-- ============================================================================
-- 3. 杆法训练道场 (Cue Technique Dojo)
-- ============================================================================

INSERT INTO specialized_training_plans (id, training_id, title, description, difficulty, estimated_time_minutes, xp_reward, metadata, content)
VALUES
(
  'plan_spin_beginner',
  'st_spin',
  '基础杆法练习（高、中、低）',
  '入门级杆法训练：掌握不同杆法的击球点和效果，能够稳定打出三种基础杆法。',
  'easy',
  30,
  20,
  '{"trainingType": "technique", "primarySkill": "杆法", "level": "入门", "recordConfig": {"metrics": ["techniqueControl"], "scoringMethod": "performance", "targetSuccessRate": 85}}'::jsonb,
  '{"duration": 30, "goal": "掌握不同杆法的击球点和效果", "evaluation": "能够稳定打出三种杆法", "sets": 4, "repsPerSet": 10, "techniques": ["高杆(推杆)", "中杆(定杆)", "低杆(拉杆)"], "keyPoints": ["击球点准确", "力度适当", "观察效果", "分离角理解"]}'::jsonb
),
(
  'plan_spin_intermediate',
  'st_spin',
  '加塞练习（左、右塞）',
  '进阶级杆法训练：掌握加塞的瞄准修正和走位控制，能够控制母球的横向走位。',
  'medium',
  45,
  35,
  '{"trainingType": "technique", "primarySkill": "杆法", "level": "进阶", "recordConfig": {"metrics": ["sideSpinControl"], "scoringMethod": "performance", "targetSuccessRate": 75}}'::jsonb,
  '{"duration": 45, "goal": "掌握加塞的瞄准修正", "evaluation": "能够控制母球的横向走位", "sets": 4, "repsPerSet": 10, "techniques": ["左塞", "右塞", "不同力度的塞"], "keyPoints": ["瞄准修正", "塞量控制", "反弹线路", "实战应用"]}'::jsonb
),
(
  'plan_spin_master',
  'st_spin',
  '高级杆法练习（推、拉、顿）',
  '大师级杆法训练：应对复杂球形，能够根据需要使用高级杆法。',
  'hard',
  60,
  50,
  '{"trainingType": "technique", "primarySkill": "杆法", "level": "大师", "recordConfig": {"metrics": ["advancedTechnique"], "scoringMethod": "performance", "targetSuccessRate": 70}}'::jsonb,
  '{"duration": 60, "goal": "应对复杂球形", "evaluation": "能够根据需要使用高级杆法", "sets": 3, "repsPerSet": 10, "techniques": ["推杆", "拉杆", "顿杆", "混合杆法"], "keyPoints": ["杆法组合", "精确控制", "效果预判", "实战运用"]}'::jsonb
);

-- ============================================================================
-- 4. 走位训练道场 (Positioning Training Dojo)
-- ============================================================================

INSERT INTO specialized_training_plans (id, training_id, title, description, difficulty, estimated_time_minutes, xp_reward, metadata, content)
VALUES
(
  'plan_positioning_beginner',
  'st_positioning',
  '分离角练习',
  '入门级走位训练：理解母球与目标球的分离规律，能够预测母球的大致走向。',
  'easy',
  30,
  20,
  '{"trainingType": "positioning", "primarySkill": "走位", "level": "入门", "recordConfig": {"metrics": ["angleUnderstanding"], "scoringMethod": "performance", "targetSuccessRate": 80}}'::jsonb,
  '{"duration": 30, "goal": "理解母球与目标球的分离规律", "evaluation": "能够预测母球的大致走向", "sets": 5, "repsPerSet": 10, "angles": ["90度分离(定杆)", "<90度分离(推杆)", ">90度分离(拉杆)"], "keyPoints": ["观察分离角", "理解分离规律", "杆法影响", "力度影响"]}'::jsonb
),
(
  'plan_positioning_intermediate',
  'st_positioning',
  '叫位练习',
  '进阶级走位训练：练习将母球走到指定区域，能够将母球控制在目标区域内。',
  'medium',
  45,
  35,
  '{"trainingType": "positioning", "primarySkill": "走位", "level": "进阶", "recordConfig": {"metrics": ["positioningAccuracy"], "scoringMethod": "performance", "targetSuccessRate": 70}}'::jsonb,
  '{"duration": 45, "goal": "练习将母球走到指定区域", "evaluation": "能够将母球控制在目标区域内", "sets": 4, "repsPerSet": 10, "targets": ["近台区域", "中台区域", "远台区域"], "keyPoints": ["规划走位路线", "力度控制", "杆法选择", "分离角运用"]}'::jsonb
),
(
  'plan_positioning_master',
  'st_positioning',
  'K球与蛇彩练习',
  '大师级走位训练：综合运用走位技巧，能够完成一次完整的蛇彩练习。',
  'hard',
  60,
  50,
  '{"trainingType": "positioning", "primarySkill": "走位", "level": "大师", "recordConfig": {"metrics": ["advancedPositioning"], "scoringMethod": "success", "targetSuccessRate": 60}}'::jsonb,
  '{"duration": 60, "goal": "综合运用走位技巧", "evaluation": "能够完成一次完整的蛇彩练习", "sets": 3, "repsPerSet": 5, "scenarios": ["K球练习", "蛇彩练习", "组合球练习"], "keyPoints": ["K球时机", "K球力度", "连续走位", "整体规划"]}'::jsonb
);

-- ============================================================================
-- 5. 发力训练道场 (Power Control Dojo)
-- ============================================================================

INSERT INTO specialized_training_plans (id, training_id, title, description, difficulty, estimated_time_minutes, xp_reward, metadata, content)
VALUES
(
  'plan_power_beginner',
  'st_power',
  '空杆与力量控制练习',
  '入门级发力训练：掌握正确的发力动作，出杆平顺、稳定。',
  'easy',
  30,
  20,
  '{"trainingType": "power", "primarySkill": "发力", "level": "入门", "recordConfig": {"metrics": ["strokeSmooth"], "scoringMethod": "performance", "targetSuccessRate": 85}}'::jsonb,
  '{"duration": 30, "goal": "掌握正确的发力动作", "evaluation": "出杆平顺、稳定", "sets": 5, "repsPerSet": 20, "powerLevels": ["小力", "中力", "大力"], "keyPoints": ["发力通透", "出杆稳定", "力量传导", "身体协调"]}'::jsonb
),
(
  'plan_power_intermediate',
  'st_power',
  '发力节奏练习',
  '进阶级发力训练：培养稳定的发力节奏，能够在大力和小力之间自如切换。',
  'medium',
  45,
  35,
  '{"trainingType": "power", "primarySkill": "发力", "level": "进阶", "recordConfig": {"metrics": ["powerControl"], "scoringMethod": "performance", "targetSuccessRate": 80}}'::jsonb,
  '{"duration": 45, "goal": "培养稳定的发力节奏", "evaluation": "能够在大力和小力之间自如切换", "sets": 4, "repsPerSet": 15, "rhythms": ["慢节奏", "快节奏", "节奏变换"], "keyPoints": ["稳定节奏", "力度控制", "心态平稳", "避免变形"]}'::jsonb
),
(
  'plan_power_master',
  'st_power',
  '实战发力应用',
  '大师级发力训练：在实战中运用不同的发力技巧，能够根据球形需要选择合适的发力。',
  'hard',
  60,
  50,
  '{"trainingType": "power", "primarySkill": "发力", "level": "大师", "recordConfig": {"metrics": ["practicalApplication"], "scoringMethod": "performance", "targetSuccessRate": 75}}'::jsonb,
  '{"duration": 60, "goal": "在实战中运用不同的发力技巧", "evaluation": "能够根据球形需要选择合适的发力", "sets": 3, "repsPerSet": 10, "scenarios": ["轻柔球", "中力球", "爆发球", "连续变化"], "keyPoints": ["因球制宜", "发力精确", "效果预判", "实战应用"]}'::jsonb
);

-- ============================================================================
-- 6. 策略训练道场 (Strategy Training Dojo)
-- Note: This replaces st_angle in the original design
-- ============================================================================

INSERT INTO specialized_training_plans (id, training_id, title, description, difficulty, estimated_time_minutes, xp_reward, metadata, content)
VALUES
(
  'plan_angle_beginner',
  'st_angle',
  '清台思路练习',
  '入门级策略训练：培养基本的清台规划能力，能够规划出2-3颗球的清台路线。',
  'easy',
  30,
  25,
  '{"trainingType": "strategy", "primarySkill": "策略", "level": "入门", "recordConfig": {"metrics": ["planningAbility"], "scoringMethod": "performance", "targetSuccessRate": 75}}'::jsonb,
  '{"duration": 30, "goal": "培养基本的清台规划能力", "evaluation": "能够规划出2-3颗球的清台路线", "sets": 5, "repsPerSet": 5, "ballCounts": [2, 3], "keyPoints": ["观察球形", "规划路线", "先难后易", "确保成功"]}'::jsonb
),
(
  'plan_angle_intermediate',
  'st_angle',
  '防守练习',
  '进阶级策略训练：学习制作斯诺克和安全球，能够做出有效的防守。',
  'medium',
  45,
  35,
  '{"trainingType": "strategy", "primarySkill": "策略", "level": "进阶", "recordConfig": {"metrics": ["defensiveSkill"], "scoringMethod": "performance", "targetSuccessRate": 70}}'::jsonb,
  '{"duration": 45, "goal": "学习制作斯诺克和安全球", "evaluation": "能够做出有效的防守", "sets": 4, "repsPerSet": 10, "techniques": ["制造斯诺克", "做安全球", "交换球权"], "keyPoints": ["防守意识", "障碍制造", "降低对手机会", "战术运用"]}'::jsonb
),
(
  'plan_angle_master',
  'st_angle',
  '特殊球形处理',
  '大师级策略训练：练习处理贴库球、组合球等复杂球形，能够应对各种复杂球形。',
  'hard',
  60,
  50,
  '{"trainingType": "strategy", "primarySkill": "策略", "level": "大师", "recordConfig": {"metrics": ["complexHandling"], "scoringMethod": "performance", "targetSuccessRate": 65}}'::jsonb,
  '{"duration": 60, "goal": "练习处理贴库球、组合球等", "evaluation": "能够应对各种复杂球形", "sets": 3, "repsPerSet": 10, "scenarios": ["贴库球", "组合球", "借球", "连击球"], "keyPoints": ["球形分析", "解决方案", "技术运用", "随机应变"]}'::jsonb
);

-- ============================================================================
-- 7. 清台挑战道场 (Clearance Challenge Dojo)
-- ============================================================================

INSERT INTO specialized_training_plans (id, training_id, title, description, difficulty, estimated_time_minutes, xp_reward, metadata, content)
VALUES
(
  'plan_clearance_beginner',
  'st_clearance',
  '顺序清彩',
  '入门级清台训练：掌握基本的清彩流程，能够完成一次完整的顺序清彩。',
  'easy',
  30,
  25,
  '{"trainingType": "comprehensive", "primarySkill": "清台", "level": "入门", "recordConfig": {"metrics": ["clearanceSuccess"], "scoringMethod": "success", "targetSuccessRate": 70}}'::jsonb,
  '{"duration": 30, "goal": "掌握基本的清彩流程", "evaluation": "能够完成一次完整的顺序清彩", "sets": 5, "repsPerSet": 1, "ballCounts": [3, 4, 5], "keyPoints": ["按序清彩", "走位规划", "稳定心态", "完成清台"]}'::jsonb
),
(
  'plan_clearance_intermediate',
  'st_clearance',
  '乱序清彩',
  '进阶级清台训练：培养根据球形规划路线的能力，能够根据球形选择最优清彩路线。',
  'medium',
  45,
  40,
  '{"trainingType": "comprehensive", "primarySkill": "清台", "level": "进阶", "recordConfig": {"metrics": ["routeOptimization"], "scoringMethod": "success", "targetSuccessRate": 60}}'::jsonb,
  '{"duration": 45, "goal": "培养根据球形规划路线的能力", "evaluation": "能够根据球形选择最优清彩路线", "sets": 4, "repsPerSet": 1, "ballCounts": [5, 6], "keyPoints": ["整体规划", "灵活调整", "优化路线", "完成清台"]}'::jsonb
),
(
  'plan_clearance_master',
  'st_clearance',
  '计时清彩',
  '大师级清台训练：提升压力下的清台能力，在规定时间内完成清彩。',
  'hard',
  60,
  60,
  '{"trainingType": "comprehensive", "primarySkill": "清台", "level": "大师", "recordConfig": {"metrics": ["speedClearance"], "scoringMethod": "time", "targetSuccessRate": 50}}'::jsonb,
  '{"duration": 60, "goal": "提升压力下的清台能力", "evaluation": "在规定时间内完成清彩", "sets": 3, "repsPerSet": 1, "ballCounts": [6, 7, 8], "timeLimits": [180, 240, 300], "keyPoints": ["速度与准度", "时间管理", "抗压能力", "稳定发挥"]}'::jsonb
);

-- ============================================================================
-- 8. 五分点速成道场 (Five-Point System Express Course)
-- ============================================================================

INSERT INTO specialized_training_plans (id, training_id, title, description, difficulty, estimated_time_minutes, xp_reward, metadata, content)
VALUES
(
  'plan_five_points_beginner',
  'st_five_points',
  '五分点叫位',
  '入门级五分点训练：熟悉五分点区域，能够将母球走到五分点附近。',
  'easy',
  30,
  20,
  '{"trainingType": "positioning", "primarySkill": "五分点", "level": "入门", "recordConfig": {"metrics": ["fivePointAccuracy"], "scoringMethod": "performance", "targetSuccessRate": 75}}'::jsonb,
  '{"duration": 30, "goal": "熟悉五分点区域", "evaluation": "能够将母球走到五分点附近", "sets": 5, "repsPerSet": 10, "positions": ["不同起点到五分点"], "keyPoints": ["五分点位置", "走位路线", "力度控制", "杆法运用"]}'::jsonb
),
(
  'plan_five_points_intermediate',
  'st_five_points',
  '五分点发散',
  '进阶级五分点训练：掌握从五分点到全台的走位，能够从五分点精确叫位到目标球。',
  'medium',
  45,
  35,
  '{"trainingType": "positioning", "primarySkill": "五分点", "level": "进阶", "recordConfig": {"metrics": ["positioningPrecision"], "scoringMethod": "performance", "targetSuccessRate": 70}}'::jsonb,
  '{"duration": 45, "goal": "掌握从五分点到全台的走位", "evaluation": "能够从五分点精确叫位到目标球", "sets": 4, "repsPerSet": 10, "targets": ["全台各位置"], "keyPoints": ["精确控制", "分离角运用", "力度把握", "实战应用"]}'::jsonb
),
(
  'plan_five_points_master',
  'st_five_points',
  '五分点实战应用',
  '大师级五分点训练：在实战中灵活运用五分点，能够利用五分点完成连续进攻。',
  'hard',
  60,
  50,
  '{"trainingType": "positioning", "primarySkill": "五分点", "level": "大师", "recordConfig": {"metrics": ["practicalMastery"], "scoringMethod": "success", "targetSuccessRate": 65}}'::jsonb,
  '{"duration": 60, "goal": "在实战中灵活运用五分点", "evaluation": "能够利用五分点完成连续进攻", "sets": 3, "repsPerSet": 5, "scenarios": ["连续进攻", "复杂球形", "清台实战"], "keyPoints": ["灵活运用", "整体规划", "连续走位", "清台完成"]}'::jsonb
);
