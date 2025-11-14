-- ============================================================================
-- Migration 36: 更新 skills 表的详细内容
-- 基于傅家俊台球十大招，添加完整的训练内容
-- ============================================================================

-- Skill 1: 基本功
UPDATE skills
SET
  objectives = ARRAY['建立稳固、可重复的击球动作', '掌握正确的站位、握杆和手架', '形成平顺、具有穿透力的发力方式'],
  detailed_content = '{
    "coreIdea": "通过对动作和出杆两大模块的训练，建立一套扎实、稳定、可重复的击球动作",
    "modules": [
      {
        "title": "模块一：动作",
        "elements": ["手架", "握杆", "入位", "姿势"]
      },
      {
        "title": "模块二：出杆",
        "elements": ["定点", "运杆", "后停", "出杆"]
      }
    ]
  }'::jsonb
WHERE id = 'skill_1';

-- Skill 2: 发力
UPDATE skills
SET
  objectives = ARRAY['掌握四种基本发力方式', '学会控制大、中、小三种力度', '建立平顺的发力感觉'],
  detailed_content = '{
    "coreIdea": "发力是台球技术的核心，正确的发力方式能提升击球力度和稳定性",
    "techniques": ["打", "点", "推", "搓"],
    "powerLevels": ["小力 (0-30%)", "中力 (30-70%)", "大力 (70-100%)"]
  }'::jsonb
WHERE id = 'skill_2';

-- Skill 3: 高效五分点
UPDATE skills
SET
  objectives = ARRAY['掌握五分点精准瞄准', '提高进球成功率', '建立科学的瞄准体系'],
  detailed_content = '{
    "coreIdea": "五分点是傅家俊独创的瞄准体系，将目标球划分为5个精准的瞄准点",
    "trainingMethod": "通过大量的五分点训练，建立肌肉记忆",
    "benefits": ["提升进球精度", "快速识别瞄准点", "实战应用"]
  }'::jsonb
WHERE id = 'skill_3';

-- Skill 4: 准度
UPDATE skills
SET
  objectives = ARRAY['掌握四点两线瞄准法', '学会多种瞄准技巧', '提高各种角度球的进球率'],
  detailed_content = '{
    "coreIdea": "准度是台球的基础，通过系统的瞄准训练，建立科学的瞄准体系",
    "aimingPrinciple": "四点两线",
    "aimingMethods": ["假想球法", "五分点法", "重心线法"]
  }'::jsonb
WHERE id = 'skill_4';

-- Skill 5: 杆法
UPDATE skills
SET
  objectives = ARRAY['掌握高低杆、定杆等基础杆法', '学会加塞技术', '能够灵活运用各种杆法控制母球'],
  detailed_content = '{
    "coreIdea": "杆法是控制母球走位的关键技术，包括基础杆法和高级加塞技术",
    "basicCueTechniques": ["高杆", "中杆", "低杆", "定杆", "小低杆"],
    "advancedCueTechniques": ["左塞", "右塞", "顺塞", "反塞"]
  }'::jsonb
WHERE id = 'skill_5';

-- Skill 6: 分离角
UPDATE skills
SET
  objectives = ARRAY['理解分离角的物理原理', '掌握影响分离角的四大因素', '能够精确预判和控制母球走位'],
  detailed_content = '{
    "coreIdea": "分离角是母球击打目标球后的分离方向，理解分离角原理是精确走位的基础",
    "physicalPrinciple": "分离角由击球点、力量、杆法、速度共同决定",
    "fourFactors": ["击球点位", "击球力量", "杆法运用", "击球速度"]
  }'::jsonb
WHERE id = 'skill_6';

-- Skill 7: 走位
UPDATE skills
SET
  objectives = ARRAY['掌握走位的三个层次：点、线、面', '学会规划母球走位路线', '提高走位精度和成功率'],
  detailed_content = '{
    "coreIdea": "走位是台球的核心技能，通过精确的母球控制，为下一杆创造最佳击球条件",
    "threeLevels": ["点的走位", "线的走位", "面的走位"],
    "positioningTechniques": ["不吃库走位", "一库走位", "二库走位", "多库走位"]
  }'::jsonb
WHERE id = 'skill_7';

-- Skill 8: 轻松清蛇彩
UPDATE skills
SET
  objectives = ARRAY['掌握基础蛇彩训练方法', '提高连续进球能力', '培养全局规划能力'],
  detailed_content = '{
    "coreIdea": "通过不同难度的蛇彩训练，培养连续进攻能力和走位规划能力",
    "trainingModules": ["基础蛇彩", "线路规划"],
    "practiceTypes": ["蛇彩一到三", "中袋四球", "长台蛇彩", "横台蛇彩"]
  }'::jsonb
WHERE id = 'skill_8';

-- Skill 9: 技能
UPDATE skills
SET
  objectives = ARRAY['掌握开球、跳球等特殊技能', '学会解球、传球等实战技巧', '完善技能体系'],
  detailed_content = '{
    "coreIdea": "掌握各种高级击球技能，是解决实战中复杂、困难局面的关键",
    "advancedSkills": ["开球", "跳球", "翻袋", "架杆", "解球", "传球", "借下", "克拉克", "贴球"]
  }'::jsonb
WHERE id = 'skill_9';

-- Skill 10: 思路
UPDATE skills
SET
  objectives = ARRAY['建立正确的进攻和防守思路', '学会分析球局', '培养良好的比赛心态'],
  detailed_content = '{
    "coreIdea": "思路是台球的灵魂，正确的战术思维能让技术发挥最大效用",
    "strategicThinking": ["进攻思路", "防守思路", "心态调整"],
    "principles": ["评估进球难度", "规划清台路线", "控制比赛节奏"]
  }'::jsonb
WHERE id = 'skill_10';

-- 验证更新结果
SELECT
  id,
  title,
  array_length(objectives, 1) as objectives_count,
  CASE
    WHEN detailed_content IS NOT NULL AND detailed_content != '{}'::jsonb
    THEN '已更新'
    ELSE '未更新'
  END as content_status
FROM skills
ORDER BY skill_order;
