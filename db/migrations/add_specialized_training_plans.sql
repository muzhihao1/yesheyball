-- Migration: Add training plans for all 8 specialized training dojos
-- This provides actual repeatable practice content for each skill category

-- ============================================================================
-- 1. 基本功道场 (Basic Fundamentals Dojo)
-- ============================================================================

INSERT INTO specialized_training_plans (id, training_id, title, description, difficulty, estimated_time_minutes, xp_reward, metadata, content)
VALUES
(
  'plan_basic_1',
  'st_basic',
  '中点直线球练习',
  '练习精确击打母球中心，掌握稳定的出杆动作。在台面中心位置放置目标球，与中袋成直线，要求连续进球。',
  'easy',
  15,
  20,
  '{"trainingType": "accuracy", "primarySkill": "基本功", "recordConfig": {"metrics": ["successRate", "consistency"], "scoringMethod": "percentage", "targetSuccessRate": 90}}'::jsonb,
  '{"sets": 5, "repsPerSet": 10, "successCriteria": "连续10次中有9次以上成功进球", "keyPoints": ["保持出杆稳定", "精确击打母球中心", "控制力度均匀"]}'::jsonb
),
(
  'plan_basic_2',
  'st_basic',
  '远距离直线球练习',
  '增加击球距离，训练长台直线球的准确性和稳定性。目标球距离母球3个球台长度以上。',
  'medium',
  20,
  30,
  '{"trainingType": "accuracy", "primarySkill": "基本功", "recordConfig": {"metrics": ["successRate", "powerControl"], "scoringMethod": "percentage", "targetSuccessRate": 80}}'::jsonb,
  '{"sets": 5, "repsPerSet": 10, "successCriteria": "连续10次中有8次以上成功进球", "keyPoints": ["保持瞄准线稳定", "适度发力", "跟进动作完整"]}'::jsonb
),
(
  'plan_basic_3',
  'st_basic',
  '击球点校准练习',
  '精确练习击打母球的不同位置（九分点），建立击球点位感觉。使用练习球或标记辅助。',
  'medium',
  25,
  30,
  '{"trainingType": "technique", "primarySkill": "基本功", "recordConfig": {"metrics": ["accuracy", "pointControl"], "scoringMethod": "points", "targetSuccessRate": 85}}'::jsonb,
  '{"sets": 3, "repsPerSet": 9, "successCriteria": "能够准确击打母球九分点中的8个点以上", "keyPoints": ["瞄准击球点", "控制球杆角度", "保持稳定击球"]}'::jsonb
);

-- ============================================================================
-- 2. 发力训练营 (Power Control Training Camp)
-- ============================================================================

INSERT INTO specialized_training_plans (id, training_id, title, description, difficulty, estimated_time_minutes, xp_reward, metadata, content)
VALUES
(
  'plan_power_1',
  'st_power',
  '定杆练习',
  '练习定杆技术，使母球在击打目标球后原地停止或小范围移动。掌握力度和击球点的配合。',
  'medium',
  20,
  30,
  '{"trainingType": "technique", "primarySkill": "发力", "recordConfig": {"metrics": ["stunAccuracy", "distanceControl"], "scoringMethod": "distance", "targetSuccessRate": 85}}'::jsonb,
  '{"sets": 4, "repsPerSet": 10, "successCriteria": "母球停留在半个球位范围内", "distances": ["1球台", "2球台", "3球台"], "keyPoints": ["击打母球中下部", "力度适中", "杆头保持水平"]}'::jsonb
),
(
  'plan_power_2',
  'st_power',
  '推杆练习',
  '练习推杆（高杆）技术，控制母球跟进的距离。分别练习不同距离的推进效果。',
  'medium',
  20,
  30,
  '{"trainingType": "technique", "primarySkill": "发力", "recordConfig": {"metrics": ["followDistance", "control"], "scoringMethod": "distance", "targetSuccessRate": 80}}'::jsonb,
  '{"sets": 4, "repsPerSet": 10, "successCriteria": "母球跟进到目标位置1球位范围内", "targetDistances": ["半球台", "1球台", "2球台"], "keyPoints": ["击打母球中上部", "跟进动作完整", "力度与击球点配合"]}'::jsonb
),
(
  'plan_power_3',
  'st_power',
  '拉杆练习',
  '练习拉杆（低杆）技术，控制母球回拉的距离。掌握不同力度下的回拉效果。',
  'hard',
  25,
  40,
  '{"trainingType": "technique", "primarySkill": "发力", "recordConfig": {"metrics": ["drawDistance", "backspinControl"], "scoringMethod": "distance", "targetSuccessRate": 75}}'::jsonb,
  '{"sets": 4, "repsPerSet": 10, "successCriteria": "母球回拉到目标位置1球位范围内", "targetDistances": ["半球台", "1球台", "1.5球台"], "keyPoints": ["击打母球最下点", "发力集中爆发", "杆头保持稳定"]}'::jsonb
);

-- ============================================================================
-- 3. 准度射击场 (Accuracy Shooting Range)
-- ============================================================================

INSERT INTO specialized_training_plans (id, training_id, title, description, difficulty, estimated_time_minutes, xp_reward, metadata, content)
VALUES
(
  'plan_accuracy_1',
  'st_accuracy',
  '角度球练习',
  '系统练习不同角度的切球，从15度到75度，每15度一个档位。建立角度球的肌肉记忆。',
  'medium',
  30,
  35,
  '{"trainingType": "accuracy", "primarySkill": "准度", "recordConfig": {"metrics": ["successRate", "angleAccuracy"], "scoringMethod": "percentage", "targetSuccessRate": 80}}'::jsonb,
  '{"sets": 5, "repsPerSet": 5, "angles": ["15°", "30°", "45°", "60°", "75°"], "successCriteria": "每个角度5次中成功4次以上", "keyPoints": ["准确瞄准切点", "保持出杆直线", "不同角度调整力度"]}'::jsonb
),
(
  'plan_accuracy_2',
  'st_accuracy',
  '远台球练习',
  '练习长距离击球的准确性，提升远台进攻能力。目标球距离母球4个球台长度以上。',
  'hard',
  25,
  40,
  '{"trainingType": "accuracy", "primarySkill": "准度", "recordConfig": {"metrics": ["longShotAccuracy", "powerControl"], "scoringMethod": "percentage", "targetSuccessRate": 70}}'::jsonb,
  '{"sets": 5, "repsPerSet": 10, "successCriteria": "远台球成功率达到70%以上", "distances": ["对角线全台", "直线全台"], "keyPoints": ["瞄准更加仔细", "出杆更加稳定", "适度发力"]}'::jsonb
),
(
  'plan_accuracy_3',
  'st_accuracy',
  '薄球练习',
  '专门训练需要极高准确度的薄切球，提升在复杂球局下的进攻能力。',
  'expert',
  25,
  50,
  '{"trainingType": "accuracy", "primarySkill": "准度", "recordConfig": {"metrics": ["thinCutAccuracy", "precision"], "scoringMethod": "percentage", "targetSuccessRate": 60}}'::jsonb,
  '{"sets": 5, "repsPerSet": 10, "cutAngles": ["10°", "5°", "极薄"], "successCriteria": "薄球成功率达到60%以上", "keyPoints": ["精确瞄准薄边", "出杆极度稳定", "心理专注度"]}'::jsonb
);

-- ============================================================================
-- 4. 杆法实验室 (Cue Technique Laboratory)
-- ============================================================================

INSERT INTO specialized_training_plans (id, training_id, title, description, difficulty, estimated_time_minutes, xp_reward, metadata, content)
VALUES
(
  'plan_spin_1',
  'st_spin',
  '高低杆控制练习',
  '在有障碍球的情况下，使用高杆或低杆绕过障碍并走到理想位置。',
  'medium',
  25,
  35,
  '{"trainingType": "technique", "primarySkill": "杆法", "recordConfig": {"metrics": ["techniqueAccuracy", "positioningSuccess"], "scoringMethod": "percentage", "targetSuccessRate": 75}}'::jsonb,
  '{"sets": 4, "repsPerSet": 10, "scenarios": ["高杆绕球", "低杆绕球", "混合使用"], "successCriteria": "成功绕过障碍并走到目标位置", "keyPoints": ["准确判断线路", "精确击球点", "力度与杆法配合"]}'::jsonb
),
(
  'plan_spin_2',
  'st_spin',
  '左右塞练习',
  '练习使用左塞和右塞改变母球吃库后的反弹线路，掌握塞的应用。',
  'hard',
  25,
  40,
  '{"trainingType": "technique", "primarySkill": "杆法", "recordConfig": {"metrics": ["sideSpinControl", "bankAccuracy"], "scoringMethod": "percentage", "targetSuccessRate": 70}}'::jsonb,
  '{"sets": 4, "repsPerSet": 10, "techniques": ["左塞反弹", "右塞反弹", "不同角度塞"], "successCriteria": "成功控制反弹线路到达目标", "keyPoints": ["理解塞的原理", "控制塞的量", "配合击球点和力度"]}'::jsonb
),
(
  'plan_spin_3',
  'st_spin',
  '混合杆法练习',
  '综合运用高低杆和左右塞，完成复杂的走位要求。这是杆法的高级应用。',
  'expert',
  30,
  50,
  '{"trainingType": "technique", "primarySkill": "杆法", "recordConfig": {"metrics": ["advancedTechnique", "complexPositioning"], "scoringMethod": "points", "targetSuccessRate": 65}}'::jsonb,
  '{"sets": 3, "repsPerSet": 10, "combinations": ["高杆+左塞", "低杆+右塞", "定杆+塞"], "successCriteria": "完成复杂走位要求", "keyPoints": ["杆法组合理解", "精确控制", "预判效果"]}'::jsonb
);

-- ============================================================================
-- 5. 分离角计算器 (Separation Angle Calculator)
-- ============================================================================

INSERT INTO specialized_training_plans (id, training_id, title, description, difficulty, estimated_time_minutes, xp_reward, metadata, content)
VALUES
(
  'plan_angle_1',
  'st_angle',
  '90度分离角练习',
  '练习定杆时母球90度分离的基本规律，建立对分离角的直觉认知。',
  'easy',
  20,
  25,
  '{"trainingType": "knowledge", "primarySkill": "走位", "recordConfig": {"metrics": ["angleAccuracy", "understanding"], "scoringMethod": "percentage", "targetSuccessRate": 85}}'::jsonb,
  '{"sets": 4, "repsPerSet": 10, "angles": ["不同切角下的90度分离"], "successCriteria": "准确预判并实现90度分离", "keyPoints": ["理解90度分离原理", "观察分离角度", "定杆技术应用"]}'::jsonb
),
(
  'plan_angle_2',
  'st_angle',
  '小于90度分离角练习',
  '练习推杆时母球前进产生的小于90度分离角，掌握推杆力度与分离角的关系。',
  'medium',
  20,
  30,
  '{"trainingType": "knowledge", "primarySkill": "走位", "recordConfig": {"metrics": ["angleControl", "powerRelation"], "scoringMethod": "percentage", "targetSuccessRate": 80}}'::jsonb,
  '{"sets": 4, "repsPerSet": 10, "targetAngles": ["60°", "45°", "30°"], "successCriteria": "通过力度控制分离角度", "keyPoints": ["力度与分离角关系", "推杆技术应用", "预判母球路径"]}'::jsonb
),
(
  'plan_angle_3',
  'st_angle',
  '大于90度分离角练习',
  '练习拉杆时母球回拉产生的大于90度分离角，掌握拉杆力度与分离角的关系。',
  'hard',
  25,
  40,
  '{"trainingType": "knowledge", "primarySkill": "走位", "recordConfig": {"metrics": ["drawAngleControl", "backspinEffect"], "scoringMethod": "percentage", "targetSuccessRate": 75}}'::jsonb,
  '{"sets": 4, "repsPerSet": 10, "targetAngles": ["120°", "135°", "150°"], "successCriteria": "通过拉杆控制大角度分离", "keyPoints": ["拉杆与分离角", "力度精确控制", "预判回拉路径"]}'::jsonb
);

-- ============================================================================
-- 6. 走位规划室 (Positioning Planning Room)
-- ============================================================================

INSERT INTO specialized_training_plans (id, training_id, title, description, difficulty, estimated_time_minutes, xp_reward, metadata, content)
VALUES
(
  'plan_positioning_1',
  'st_positioning',
  '两球连接练习',
  '摆放A、B两个目标球，要求打进A球后母球走到B球的最佳进攻位置。',
  'medium',
  20,
  30,
  '{"trainingType": "strategy", "primarySkill": "走位", "recordConfig": {"metrics": ["positioningAccuracy", "routePlanning"], "scoringMethod": "percentage", "targetSuccessRate": 80}}'::jsonb,
  '{"sets": 5, "repsPerSet": 10, "scenarios": ["直线连接", "角度连接", "远台连接"], "successCriteria": "成功走到B球最佳位置", "keyPoints": ["规划走位路线", "控制分离角", "力度精确控制"]}'::jsonb
),
(
  'plan_positioning_2',
  'st_positioning',
  '三球清台练习',
  '摆放3个球，要求规划完整路线并连续打进，训练连续走位能力。',
  'hard',
  25,
  40,
  '{"trainingType": "strategy", "primarySkill": "走位", "recordConfig": {"metrics": ["clearanceSuccess", "routeOptimization"], "scoringMethod": "percentage", "targetSuccessRate": 70}}'::jsonb,
  '{"sets": 4, "repsPerSet": 5, "ballCounts": 3, "successCriteria": "一杆连续打进3球", "keyPoints": ["整体路线规划", "每杆走位预判", "应变能力"]}'::jsonb
),
(
  'plan_positioning_3',
  'st_positioning',
  'K球练习',
  '练习将紧贴的球堆（Problem Balls）K开并形成良好局面，掌握K球技巧。',
  'expert',
  30,
  50,
  '{"trainingType": "strategy", "primarySkill": "走位", "recordConfig": {"metrics": ["breakSuccess", "clusterResolution"], "scoringMethod": "points", "targetSuccessRate": 65}}'::jsonb,
  '{"sets": 3, "repsPerSet": 10, "clusterTypes": ["双球叠", "三球堆", "复杂球堆"], "successCriteria": "成功K开并完成后续清台", "keyPoints": ["判断K球时机", "控制K球力度", "预判K开效果"]}'::jsonb
);

-- ============================================================================
-- 7. 清台挑战赛 (Clearance Challenge Arena)
-- ============================================================================

INSERT INTO specialized_training_plans (id, training_id, title, description, difficulty, estimated_time_minutes, xp_reward, metadata, content)
VALUES
(
  'plan_clearance_1',
  'st_clearance',
  '6球清台挑战',
  '随机摆放6个球，要求在规定杆数内完成清台。综合考察准度、走位和策略。',
  'hard',
  30,
  45,
  '{"trainingType": "comprehensive", "primarySkill": "综合", "recordConfig": {"metrics": ["clearanceRate", "strokesUsed"], "scoringMethod": "points", "targetSuccessRate": 70}}'::jsonb,
  '{"sets": 3, "repsPerSet": 5, "ballCount": 6, "strokeLimit": 10, "successCriteria": "在10杆内完成清台", "keyPoints": ["整体规划", "准度控制", "走位精确"]}'::jsonb
),
(
  'plan_clearance_2',
  'st_clearance',
  '9球清台挑战',
  '标准9球摆球后，从自由球开始，挑战一杆清台能力。',
  'expert',
  35,
  60,
  '{"trainingType": "comprehensive", "primarySkill": "综合", "recordConfig": {"metrics": ["nineBallClearance", "runOut"], "scoringMethod": "success", "targetSuccessRate": 50}}'::jsonb,
  '{"sets": 3, "repsPerSet": 3, "ballCount": 9, "gameType": "9-ball", "successCriteria": "一杆清台", "keyPoints": ["开球选择", "路线规划", "关键球处理"]}'::jsonb
),
(
  'plan_clearance_3',
  'st_clearance',
  '计时清台挑战',
  '在限定时间内清完指定数量的球，训练在压力下的清台能力和速度。',
  'expert',
  25,
  55,
  '{"trainingType": "comprehensive", "primarySkill": "综合", "recordConfig": {"metrics": ["speedClearance", "timeManagement"], "scoringMethod": "time", "targetSuccessRate": 60}}'::jsonb,
  '{"sets": 3, "repsPerSet": 5, "ballCounts": [4, 6, 8], "timeLimits": [120, 180, 240], "successCriteria": "在限定时间内完成清台", "keyPoints": ["速度与准度平衡", "时间管理", "心理抗压"]}'::jsonb
);

-- ============================================================================
-- 8. 五分点速成班 (Five-Point System Express Course)
-- ============================================================================

INSERT INTO specialized_training_plans (id, training_id, title, description, difficulty, estimated_time_minutes, xp_reward, metadata, content)
VALUES
(
  'plan_five_points_1',
  'st_five_points',
  '五分点理论教学',
  '交互式教程，详细解释五分点系统的基本原理和计算方法。理解数字系统的应用。',
  'easy',
  20,
  25,
  '{"trainingType": "knowledge", "primarySkill": "防守", "recordConfig": {"metrics": ["understanding", "theoreticalKnowledge"], "scoringMethod": "quiz", "targetSuccessRate": 90}}'::jsonb,
  '{"lessonParts": ["五分点原理", "计算方法", "实例演示"], "interactiveQuiz": true, "successCriteria": "理论测试达到90分以上", "keyPoints": ["数字系统理解", "入射角度计算", "反弹线路预判"]}'::jsonb
),
(
  'plan_five_points_2',
  'st_five_points',
  '一库解球练习',
  '给出被障碍的球形，要求使用五分点系统计算并完成一库解球（踢球）。',
  'medium',
  25,
  35,
  '{"trainingType": "application", "primarySkill": "防守", "recordConfig": {"metrics": ["kickAccuracy", "systemApplication"], "scoringMethod": "percentage", "targetSuccessRate": 75}}'::jsonb,
  '{"sets": 5, "repsPerSet": 10, "scenarios": ["不同角度障碍球"], "successCriteria": "成功解到目标球或完成安全球", "keyPoints": ["快速计算分点", "准确击球", "力度控制"]}'::jsonb
),
(
  'plan_five_points_3',
  'st_five_points',
  '两库解球练习',
  '进阶练习，使用五分点系统计算两库解球线路，应对更复杂的障碍情况。',
  'hard',
  30,
  45,
  '{"trainingType": "application", "primarySkill": "防守", "recordConfig": {"metrics": ["multiRailAccuracy", "advancedCalculation"], "scoringMethod": "percentage", "targetSuccessRate": 65}}'::jsonb,
  '{"sets": 4, "repsPerSet": 10, "scenarios": ["两库解球", "复杂障碍"], "successCriteria": "成功完成两库解球", "keyPoints": ["两库线路计算", "精确控制", "系统灵活应用"]}'::jsonb
);

-- ============================================================================
-- Update metadata for completion tracking
-- ============================================================================

-- This migration adds 24 training plans (3 plans × 8 dojos)
-- Each plan is designed to be repeatable and trackable
-- Users can practice each plan multiple times to improve their skills
