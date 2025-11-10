-- ============================================================================
-- V2.1 Training System: Level 5训练单元导入
-- ============================================================================
-- 导入8个Level 5训练单元 (战术运用 - 走位与布局)
-- 作者: 耶氏台球学院
-- 日期: 2025-01-10
-- 前置条件: 必须先执行 11_create_subskills_level4_8.sql
-- ============================================================================

-- 开始事务
BEGIN;

-- ============================================================================
-- Level 5: 战术运用 - 走位与布局 (8 units)
-- Skill: 走位技术
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Sub-skill 5.1: 基础走位技术 (5 units)
-- ----------------------------------------------------------------------------

-- Unit 1: 走位的三种方式 (theory)
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'theory',
    1,
    '走位的三种方式',
    jsonb_build_object(
        'theory', '走位是台球进攻的灵魂，指的是通过控制白球的运动轨迹，让白球停在理想位置以便击打下一个目标球。走位主要有三种方式：

1. 不吃库走位（Direct Position）
直接通过杆法和力量控制，让白球沿着分离角方向到达目标位置，不碰任何库边。这是最基础也是最常用的走位方式。

2. 一库走位（One Rail Position）
让白球击打目标球后反弹到一个库边，再到达目标位置。增加了走位的可控性和距离。

3. 多库走位（Multi-rail Position）
白球经过两个或更多库边后到达目标位置。用于复杂局面或长距离走位。

选择走位方式的原则：
- 优先选择最简单直接的方式
- 考虑下一杆的角度和距离
- 评估自己对不同方式的掌握程度
- 球型不允许时才选择复杂方式',
        'steps', ARRAY[
            '分析当前球型和下一个目标球的位置',
            '确定理想的白球停位区域',
            '评估三种走位方式的可行性',
            '选择最合适的走位方式',
            '确定需要的杆法、力量和击球角度'
        ],
        'tips', ARRAY[
            '走位规划要考虑后手球，不只是下一杆',
            '简单的走位往往是最有效的',
            '多观察职业选手的走位选择',
            '在脑海中模拟白球运动轨迹',
            '记住几个常用的走位套路'
        ],
        'common_mistakes', ARRAY[
            '过度追求复杂走位',
            '没有提前规划走位',
            '忽略了下下一杆的位置',
            '走位目标区域设定过小',
            '没有备选方案'
        ],
        'practice_requirements', '在10个不同球型中，分别画出三种走位方式的路线图，并标注优劣分析',
        'success_criteria', '能够准确分析球型，识别三种走位方式的应用场景，并选择最优方案',
        'related_courses', ARRAY[27, 28, 34]
    ),
    10,
    10
FROM sub_skills ss
JOIN training_skills s ON ss.skill_id = s.id
WHERE s.skill_name = '走位技术' AND ss.sub_skill_name = '基础走位技术'
ON CONFLICT DO NOTHING;

-- Unit 2: 不吃库直接走位 (practice)
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'practice',
    2,
    '不吃库直接走位',
    jsonb_build_object(
        'theory', '不吃库走位是最基础的走位技术，完全依靠分离角、杆法和力量控制来实现。这种走位方式最直接、最可控，是初中级球员的主要走位手段。掌握不吃库走位需要：

1. 准确的分离角判断
2. 稳定的杆法运用
3. 精确的力量控制
4. 对白球滚动距离的预判

不吃库走位的优势：
- 路线最短，最节省力量
- 变数最少，成功率最高
- 容易掌握和运用

适用场景：
- 目标位置在分离角方向附近
- 距离适中（不太远也不太近）
- 没有障碍球阻挡',
        'steps', ARRAY[
            '摆放练习球型：目标球、白球和下一个球形成合适角度',
            '确定理想的白球停位（画一个圆圈作为目标区域）',
            '判断需要的杆法：定杆、轻低杆、轻高杆',
            '估算需要的力量档位',
            '试杆2-3次，在脑海中模拟白球路线',
            '击球，观察白球实际走位',
            '根据偏差调整杆法或力量，再次尝试'
        ],
        'tips', ARRAY[
            '目标区域不要设定得太小，直径20-30cm是合理范围',
            '先练习中等距离（40-60cm），再练习近距离和远距离',
            '建立力量和距离的对应关系',
            '轻低杆和轻高杆是微调的好方法',
            '多练习常见角度：30度、45度、60度'
        ],
        'common_mistakes', ARRAY[
            '目标区域过小，给自己太大压力',
            '力量过大，白球走位过远',
            '只关注进球，忽略走位',
            '没有根据实际效果调整方法',
            '缺乏耐心，没有充分练习'
        ],
        'practice_requirements', '完成30次不吃库走位练习，设置5个不同的球型，每个球型练习6次，目标是让白球停在直径25cm的目标区域内',
        'success_criteria', '在5个标准球型中，至少有3个能够稳定地让白球停在目标区域，每个球型的成功率达到60%',
        'related_courses', ARRAY[27]
    ),
    20,
    20
FROM sub_skills ss
JOIN training_skills s ON ss.skill_id = s.id
WHERE s.skill_name = '走位技术' AND ss.sub_skill_name = '基础走位技术'
ON CONFLICT DO NOTHING;

-- Unit 3: 一库反弹走位 (practice)
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'practice',
    3,
    '一库反弹走位',
    jsonb_build_object(
        'theory', '一库走位通过让白球反弹一次库边来到达目标位置，相比不吃库走位增加了可控性和距离范围。一库走位的关键是掌握反弹角度和力量衰减。

一库走位的优势：
- 可以到达不吃库无法到达的位置
- 增加走位距离
- 利用库边减速，更容易控制停位

反弹角度规律（简化版）：
- 定杆：入射角≈反射角
- 加右塞：反射角小于入射角（向右偏）
- 加左塞：反射角大于入射角（向左偏）

实战要点：
- 确定反弹点位置
- 计算需要的入射角度
- 考虑力量衰减
- 选择合适的击球点位',
        'steps', ARRAY[
            '设置练习球型：白球在中台，目标球靠近库边',
            '规划走位路线：确定反弹点和目标停位',
            '估算入射角度（用平行瞄准法）',
            '选择杆法：定杆或轻加塞',
            '估算力量：考虑库边吸收的能量',
            '试杆3次，在脑海中模拟轨迹',
            '击球并观察白球路线',
            '调整角度或力量再次尝试'
        ],
        'tips', ARRAY[
            '初学者建议用定杆练习，避免加塞增加难度',
            '反弹点选择在库边中间区域最稳定',
            '力量要适中，过大会导致反弹角度失真',
            '可以用巧粉在库边标记预计反弹点',
            '观察职业选手的一库走位，学习路线选择'
        ],
        'common_mistakes', ARRAY[
            '入射角度计算错误',
            '力量过大导致白球失控',
            '没有考虑库边的弹性系数',
            '过早使用加塞，增加难度',
            '反弹点选择在库边角落，不稳定'
        ],
        'practice_requirements', '完成25次一库走位练习，在5个不同球型中各练习5次，要求白球经过一库后停在目标区域（直径30cm）',
        'success_criteria', '在标准一库走位球型中，成功率达到60%，能够基本预判反弹路线',
        'related_courses', ARRAY[28]
    ),
    20,
    20
FROM sub_skills ss
JOIN training_skills s ON ss.skill_id = s.id
WHERE s.skill_name = '走位技术' AND ss.sub_skill_name = '基础走位技术'
ON CONFLICT DO NOTHING;

-- Unit 4: 多库走位技巧 (practice)
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'practice',
    4,
    '多库走位技巧',
    jsonb_build_object(
        'theory', '多库走位是指白球经过两个或以上库边后到达目标位置。这是高级走位技术，主要用于长距离走位或绕过障碍。多库走位的难点在于多次反弹会累积误差，需要更精确的计算和控制。

常用的多库走位：
- 两库走位：用于长台走位
- 三库走位：用于解球或特殊角度
- 四库走位：极少使用，主要用于show shot

多库走位要点：
- 每次反弹都会损失能量（约20-30%）
- 加塞可以改变反弹角度
- 力量控制比角度控制更重要
- 需要考虑台面的倾斜和库边弹性差异',
        'steps', ARRAY[
            '分析球型，确定是否必须用多库走位',
            '规划走位路线：标记每个反弹点',
            '计算第一个入射角度',
            '估算整体需要的力量（考虑能量损失）',
            '选择是否加塞（高级技术）',
            '多次试杆，感受击球力度',
            '击球并仔细观察每个反弹点',
            '根据实际效果调整方案'
        ],
        'tips', ARRAY[
            '多库走位的成功率本身就较低，不要过度追求精确',
            '两库走位是最实用的，先重点练习',
            '力量分档：轻力（两库短距离）、中力（两库中距离）、重力（三库及以上）',
            '可以将复杂的多库走位简化为分段思考',
            '实战中优先考虑简单走位，多库是不得已的选择'
        ],
        'common_mistakes', ARRAY[
            '路线规划过于复杂',
            '力量估算不准确',
            '没有考虑能量衰减',
            '过度依赖加塞而忽略基础',
            '在有简单走位选择时仍选择多库'
        ],
        'practice_requirements', '完成20次两库走位练习和10次三库走位练习，重点练习两库长台走位（白球从近台到远台）',
        'success_criteria', '两库走位成功率达到50%，三库走位能够完成基本轨迹（不要求精确停位）',
        'related_courses', ARRAY[28, 43]
    ),
    20,
    25
FROM sub_skills ss
JOIN training_skills s ON ss.skill_id = s.id
WHERE s.skill_name = '走位技术' AND ss.sub_skill_name = '基础走位技术'
ON CONFLICT DO NOTHING;

-- Unit 5: 走位综合练习 (challenge)
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'challenge',
    5,
    '走位综合练习',
    jsonb_build_object(
        'theory', '走位综合练习将测试你对三种走位方式的理解和运用。在8个标准球型中，你需要自主选择最合适的走位方式，并成功让白球到达目标位置。这个挑战考验的是：

1. 球型分析能力
2. 走位方式选择
3. 技术执行能力
4. 应变调整能力

评分标准：
- 走位方式选择正确：10分
- 白球停在大目标区域（直径40cm）：10分
- 白球停在精确区域（直径20cm）：额外5分',
        'steps', ARRAY[
            '球型1-2：不吃库走位（近距离和中距离）',
            '球型3-4：一库走位（顺库和斜库）',
            '球型5-6：两库走位（长台和绕球）',
            '球型7：自选走位方式（复杂球型）',
            '球型8：限时走位（60秒内完成规划和击球）'
        ],
        'tips', ARRAY[
            '先快速浏览所有球型，合理分配时间',
            '每个球型先分析3种走位方式的可行性',
            '选择你最有把握的方式，不要冒险',
            '如果第一次失败，分析原因后再试',
            '记录每个球型的表现，找出薄弱环节'
        ],
        'common_mistakes', ARRAY[
            '没有充分分析就急于击球',
            '选择了不合适的走位方式',
            '技术执行不到位',
            '时间管理不当',
            '心理压力影响发挥'
        ],
        'practice_requirements', '完成8个标准球型，每个球型有2次机会，记录成功数和得分',
        'success_criteria', '8个球型中至少成功5个（62.5%），总分达到80分（满分120分）',
        'related_courses', ARRAY[27, 28]
    ),
    30,
    25
FROM sub_skills ss
JOIN training_skills s ON ss.skill_id = s.id
WHERE s.skill_name = '走位技术' AND ss.sub_skill_name = '基础走位技术'
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- Sub-skill 5.2: 清台思路初探 (3 units)
-- ----------------------------------------------------------------------------

-- Unit 6: 清台基础思路 (theory)
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'theory',
    6,
    '清台基础思路',
    jsonb_build_object(
        'theory', '清台（Run Out）是台球的最终目标，指连续击打所有目标球直到清空台面。清台不仅需要技术，更需要思路。基础清台思路包括：

1. 球型分析
   - 识别难打的球（问题球）
   - 找出容易打的球（机会球）
   - 规划打球顺序

2. 走位规划
   - 每一杆要考虑下一杆的角度
   - 避免留下困难球型
   - 为问题球创造好角度

3. 节奏控制
   - 不要急于进攻
   - 保持连贯的走位
   - 出现失误及时调整

清台三原则：
- 从易到难（先打容易的球）
- 保持角度（每杆都有好角度）
- 解决问题（提前处理难打的球）

常见清台顺序：
1. 开球后评估球型
2. 识别问题球和顺序球
3. 制定清台路线
4. 执行并调整',
        'steps', ARRAY[
            '观察台面所有球的位置',
            '识别哪些球容易打（好角度、近距离）',
            '识别哪些球难打（贴库、角度差、距离远）',
            '规划大致的打球顺序',
            '确定如何处理问题球',
            '开始执行，每一杆都重新评估'
        ],
        'tips', ARRAY[
            '不要只看下一杆，至少要看后三杆',
            '问题球越早处理越好，但要在有把握时处理',
            '保持白球在台面中心区域，选择面更多',
            '遇到困难不要勉强，安全解球也是策略',
            '观看职业比赛，学习他们的清台思路'
        ],
        'common_mistakes', ARRAY[
            '没有整体规划，走一步看一步',
            '把问题球留到最后',
            '过度追求完美走位',
            '不敢打难度球',
            '忽略了黑八的位置'
        ],
        'practice_requirements', '观看5局职业比赛视频，分析选手的清台思路，写出每局的球序规划和关键处理',
        'success_criteria', '能够准确描述清台三原则，并在简单球局中规划出合理的打球顺序',
        'related_courses', ARRAY[34, 43]
    ),
    10,
    10
FROM sub_skills ss
JOIN training_skills s ON ss.skill_id = s.id
WHERE s.skill_name = '走位技术' AND ss.sub_skill_name = '清台思路初探'
ON CONFLICT DO NOTHING;

-- Unit 7: 简单球型清台实战 (practice)
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'practice',
    7,
    '简单球型清台实战',
    jsonb_build_object(
        'theory', '在简单球型（5-6个球，分布相对规律）中练习清台。简单球型的特点是没有明显的问题球，大部分球都有合理角度。这是建立清台信心和培养思路的最佳训练。

简单清台要点：
- 顺序合理：不要跳跃式打球
- 走位稳定：每杆都留好角度
- 节奏流畅：不停顿、不犹豫
- 心态平稳：不因简单而大意

训练目标：
- 提高清台成功率
- 培养连续击球的节奏感
- 建立走位规划的习惯
- 积累清台经验',
        'steps', ARRAY[
            '摆放简单球型：5-6个球，分布在台面中心区域',
            '用2分钟时间分析球型，规划打球顺序',
            '在纸上或脑海中记下大致顺序',
            '开始清台，严格按照规划执行',
            '每打完一球，重新评估下一球',
            '如果出现失误，分析原因',
            '调整规划，继续尝试'
        ],
        'tips', ARRAY[
            '初期可以用简单的直线球型练习',
            '逐步增加球的数量和分散程度',
            '每次清台都要有完整规划，不能随意',
            '记录成功率，设定阶段目标',
            '可以和球友一起练习，互相分析'
        ],
        'common_mistakes', ARRAY[
            '认为简单而不认真规划',
            '走位不到位就勉强击球',
            '打完一个球才想下一个球',
            '成功一次就满足，没有持续练习',
            '球型摆放过于简单，没有挑战'
        ],
        'practice_requirements', '完成10次简单球型清台练习，每次5-6个球，记录成功次数和失误原因',
        'success_criteria', '简单球型（5个球）清台成功率达到70%，能够流畅完成清台过程',
        'related_courses', ARRAY[35, 36]
    ),
    20,
    25
FROM sub_skills ss
JOIN training_skills s ON ss.skill_id = s.id
WHERE s.skill_name = '走位技术' AND ss.sub_skill_name = '清台思路初探'
ON CONFLICT DO NOTHING;

-- Unit 8: 复杂局面分析 (challenge)
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'challenge',
    8,
    '复杂局面分析',
    jsonb_build_object(
        'theory', '复杂球型（7-10个球，包含问题球和障碍）的清台需要更高的思路和技术。这个挑战将测试你的：

1. 球型分析能力：快速识别问题和机会
2. 路线规划能力：制定多步骤计划
3. 技术执行能力：完成复杂走位
4. 应变能力：根据实际情况调整

测试包括3个复杂球型：
- 球型A：7个球，包含1个贴库球（问题球）
- 球型B：8个球，包含1个障碍球组
- 球型C：9个球，自由摆放（模拟实战）

评分标准：
- 清台成功：30分
- 处理问题球得当：10分
- 走位流畅：10分
- 总杆数少于目标：额外10分',
        'steps', ARRAY[
            '球型A测试：',
            '  1. 分析7个球的位置和难度',
            '  2. 确定贴库球的处理时机',
            '  3. 制定清台路线',
            '  4. 执行并记录结果',
            '球型B测试：',
            '  1. 识别障碍球组',
            '  2. 规划如何拆开障碍',
            '  3. 制定整体清台路线',
            '  4. 执行并记录结果',
            '球型C测试：',
            '  1. 自由摆放9个球（模拟开球后球型）',
            '  2. 完整分析并规划',
            '  3. 执行清台',
            '  4. 总结经验'
        ],
        'tips', ARRAY[
            '复杂球型成功率本身就低，不要有过高期望',
            '重点是培养分析思路，而非一定要成功清台',
            '每次尝试后都要详细分析得失',
            '可以在规划阶段请教教练或高手',
            '记录每个球型的杆数和关键处理',
            '失败后总结：是技术问题还是思路问题'
        ],
        'common_mistakes', ARRAY[
            '急于求成，没有充分分析',
            '遇到问题球就放弃',
            '路线规划不合理',
            '技术执行不到位',
            '缺乏应变能力'
        ],
        'practice_requirements', '完成3个复杂球型测试，每个球型有3次机会，记录最好成绩和经验总结',
        'success_criteria', '3个球型中至少成功清台1个，或者在失败案例中能够准确分析失误原因并提出改进方案',
        'related_courses', ARRAY[37, 38, 39, 43]
    ),
    30,
    30
FROM sub_skills ss
JOIN training_skills s ON ss.skill_id = s.id
WHERE s.skill_name = '走位技术' AND ss.sub_skill_name = '清台思路初探'
ON CONFLICT DO NOTHING;

-- 提交事务
COMMIT;

-- ============================================================================
-- 验证 Level 5 导入
-- ============================================================================

DO $$
DECLARE
    unit_count INTEGER;
    subskill1_count INTEGER;
    subskill2_count INTEGER;
BEGIN
    -- 统计Level 5总单元数
    SELECT COUNT(*) INTO unit_count
    FROM training_units tu
    JOIN sub_skills ss ON tu.sub_skill_id = ss.id
    JOIN training_skills s ON ss.skill_id = s.id
    WHERE s.skill_name = '走位技术';

    -- 统计子技能1的单元数
    SELECT COUNT(*) INTO subskill1_count
    FROM training_units tu
    JOIN sub_skills ss ON tu.sub_skill_id = ss.id
    WHERE ss.sub_skill_name = '基础走位技术';

    -- 统计子技能2的单元数
    SELECT COUNT(*) INTO subskill2_count
    FROM training_units tu
    JOIN sub_skills ss ON tu.sub_skill_id = ss.id
    WHERE ss.sub_skill_name = '清台思路初探';

    -- 输出验证结果
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Level 5 (战术运用 - 走位与布局) 导入验证';
    RAISE NOTICE '===========================================';
    RAISE NOTICE '子技能 5.1 (基础走位技术): % 个单元', subskill1_count;
    RAISE NOTICE '子技能 5.2 (清台思路初探): % 个单元', subskill2_count;
    RAISE NOTICE '-------------------------------------------';
    RAISE NOTICE '总计: % 个单元', unit_count;
    RAISE NOTICE '===========================================';

    IF unit_count = 8 THEN
        RAISE NOTICE '✅ Level 5 导入成功！';
    ELSE
        RAISE WARNING '⚠️  Level 5 导入不完整，期望8个，实际%个', unit_count;
    END IF;
END $$;

-- ============================================================================
-- 查询 Level 5 训练单元详细信息
-- ============================================================================

SELECT
    ss.sub_skill_name AS "子技能",
    tu.unit_order AS "顺序",
    tu.title AS "单元标题",
    tu.unit_type AS "类型",
    tu.xp_reward AS "经验值",
    tu.estimated_minutes AS "时长(分钟)",
    tu.id AS "单元ID"
FROM training_units tu
JOIN sub_skills ss ON tu.sub_skill_id = ss.id
JOIN training_skills s ON ss.skill_id = s.id
WHERE s.skill_name = '走位技术'
ORDER BY ss.sub_skill_order, tu.unit_order;

-- ============================================================================
-- 使用说明
-- ============================================================================
--
-- 执行顺序:
-- 1. 确保已执行 11_create_subskills_level4_8.sql（创建子技能）
-- 2. 执行本脚本导入Level 5训练单元
-- 3. 验证导入结果
--
-- 回滚方法:
-- DELETE FROM training_units tu
-- USING sub_skills ss, skills s
-- WHERE tu.sub_skill_id = ss.id
--   AND ss.skill_id = s.id
--   AND s.skill_name = '走位技术';
--
-- 注意事项:
-- - 使用事务确保原子性操作
-- - ON CONFLICT DO NOTHING 避免重复插入
-- - 单引号在字符串中需要转义为两个单引号
-- ============================================================================
