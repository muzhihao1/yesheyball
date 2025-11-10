-- ============================================================================
-- V2.1 Training System: Level 6训练单元导入
-- ============================================================================
-- 导入6个Level 6训练单元 (实战演练 - 加塞与清台)
-- 作者: 耶氏台球学院
-- 日期: 2025-01-10
-- 前置条件: 必须先执行 11_create_subskills_level4_8.sql
-- ============================================================================

-- 开始事务
BEGIN;

-- ============================================================================
-- Level 6: 实战演练 - 加塞与清台 (6 units)
-- Skill: 加塞技术
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Sub-skill 6.1: 加塞瞄准与走位 (4 units)
-- ----------------------------------------------------------------------------

-- Unit 1: 加塞原理与身位调整 (theory)
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'theory',
    1,
    '加塞原理与身位调整',
    jsonb_build_object(
        'theory', '加塞（English/Side Spin）是指击打白球左侧或右侧，使白球带有横向旋转。加塞会改变白球的运动轨迹和反弹角度，是高级走位技术的核心。

加塞的物理原理：
- 加右塞：击打白球右侧（2-3点钟），白球顺时针旋转
- 加左塞：击打白球左侧（9-10点钟），白球逆时针旋转
- 塞量：击球点距离中心越远，旋转越强

加塞的效果：
1. 改变分离角：塞会使分离角发生偏转
2. 改变反弹角：吃库后反弹方向变化
3. 影响目标球进球线（需要瞄准修正）

身位调整的重要性：
- 加塞时，球杆与白球的夹角会改变
- 需要调整身体位置来保持瞄准线
- 身位不正确会导致瞄准偏差
- 专业术语：加塞身位补偿

加塞的难点：
- 瞄准偏移量的计算
- 身位调整的准确性
- 力量与塞量的配合
- 心理上的不确定感',
        'steps', ARRAY[
            '理解加塞的基本原理（物理旋转）',
            '学习加塞时的瞄准修正方法',
            '掌握身位调整的要领',
            '了解不同塞量对走位的影响',
            '认识加塞在实战中的应用场景'
        ],
        'tips', ARRAY[
            '初学者建议从小塞量开始（半杆塞）',
            '加塞时身体要跟着球杆走，不是球杆迁就身体',
            '可以用成角公式辅助计算瞄准偏移',
            '观察职业选手的身位调整动作',
            '理论理解后必须大量实践才能掌握'
        ],
        'common_mistakes', ARRAY[
            '加塞过猛，失去控制',
            '身位调整不到位',
            '瞄准修正错误',
            '塞量与力量不匹配',
            '在不需要加塞时也加塞'
        ],
        'practice_requirements', '理解加塞原理，能够描述加左塞和加右塞的效果差异，绘制加塞时的白球运动轨迹示意图',
        'success_criteria', '能够准确理解加塞原理，正确描述身位调整要领，识别需要加塞的球型场景',
        'related_courses', ARRAY[29, 30]
    ),
    10,
    10
FROM sub_skills ss
JOIN training_skills s ON ss.skill_id = s.id
WHERE s.skill_name = '加塞技术' AND ss.sub_skill_name = '加塞瞄准与走位'
ON CONFLICT DO NOTHING;

-- Unit 2: 5分点加塞瞄准 (practice)
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'practice',
    2,
    '5分点加塞瞄准',
    jsonb_build_object(
        'theory', '5分点加塞是傅家俊台球教学的核心技术之一，通过击打白球的5个标准点位来实现精确的走位控制。5分点包括：

中心点（0塞）：定杆，标准分离角
右1点（半杆右塞）：轻度右旋
右2点（一杆右塞）：标准右旋
左1点（半杆左塞）：轻度左旋
左2点（一杆左塞）：标准左旋

5分点的优势：
- 标准化击球点位，容易记忆
- 可预测的走位效果
- 减少瞄准的不确定性
- 适合系统训练

瞄准方法：
- 确定目标球进球点
- 根据走位需求选择塞量
- 调整身位和瞄准线
- 使用高效五分点瞄准体系

实战应用：
- 吃库走位时的角度控制
- 微调白球分离方向
- 长台走位的精确控制',
        'steps', ARRAY[
            '设置标准练习球型：白球距目标球50cm',
            '练习中心点（定杆）：建立基准',
            '练习右1点（半杆右塞）：观察分离角变化',
            '练习右2点（一杆右塞）：观察更大偏转',
            '练习左塞：重复右塞步骤',
            '对比5个点位的效果差异',
            '在不同角度球型中重复练习'
        ],
        'tips', ARRAY[
            '先在45度直球中熟练掌握5分点',
            '每个点位至少打10次，建立肌肉记忆',
            '使用粉笔在白球上标记5个点位（练习专用）',
            '记录每个点位的分离角度变化',
            '从半杆塞开始，逐步增加到一杆塞',
            '观察白球的spin方向和强度'
        ],
        'common_mistakes', ARRAY[
            '点位击打不准确，塞量不稳定',
            '身位调整不到位，瞄准偏差',
            '力量与塞量不匹配',
            '过度依赖加塞，忽略定杆',
            '在不熟练时就挑战大塞量'
        ],
        'practice_requirements', '完成50次5分点练习，每个点位（中、右1、右2、左1、左2）各10次，记录分离角度和成功率',
        'success_criteria', '能够稳定击打5个标准点位，半杆塞的成功率达到70%，一杆塞的成功率达到50%',
        'related_courses', ARRAY[30]
    ),
    20,
    25
FROM sub_skills ss
JOIN training_skills s ON ss.skill_id = s.id
WHERE s.skill_name = '加塞技术' AND ss.sub_skill_name = '加塞瞄准与走位'
ON CONFLICT DO NOTHING;

-- Unit 3: 顺塞与反塞走位 (practice)
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'practice',
    3,
    '顺塞与反塞走位',
    jsonb_build_object(
        'theory', '顺塞和反塞是加塞走位的两种基本应用：

顺塞（Running English）：
- 白球旋转方向与反弹后运动方向一致
- 效果：反弹角度变小，白球向前跑
- 用途：需要白球吃库后继续前进
- 特点：走位距离更长

反塞（Reverse English）：
- 白球旋转方向与反弹后运动方向相反
- 效果：反弹角度变大，白球向后拉
- 用途：需要白球吃库后向回走
- 特点：更容易控制停位

选择原则：
- 根据目标位置选择顺塞或反塞
- 顺塞用于远距离走位
- 反塞用于近距离控制
- 考虑力量和塞量的配合

实战应用：
- 长台一库走位（顺塞）
- 近台精确控制（反塞）
- 绕球走位（顺塞或反塞）
- 解球后的安全走位',
        'steps', ARRAY[
            '顺塞练习：',
            '  1. 摆放标准球型：白球在中台，目标位置在远端',
            '  2. 确定反弹点和入射角',
            '  3. 选择顺塞方向（右库边加右塞，左库边加左塞）',
            '  4. 击球并观察白球跑位距离',
            '  5. 调整塞量和力量',
            '反塞练习：',
            '  1. 摆放标准球型：白球在中台，目标位置在近端',
            '  2. 选择反塞方向（右库边加左塞，左库边加右塞）',
            '  3. 击球并观察白球回拉效果',
            '  4. 调整塞量和力量'
        ],
        'tips', ARRAY[
            '顺塞的塞量可以适当大一些',
            '反塞需要更精确的控制',
            '力量越大，塞的效果越明显',
            '观察白球吃库瞬间的旋转状态',
            '实战中优先考虑反塞，更容易控制',
            '记住常用球型的塞量和力量配合'
        ],
        'common_mistakes', ARRAY[
            '顺塞和反塞概念混淆',
            '塞的方向选择错误',
            '力量与塞量不匹配',
            '没有考虑库边弹性差异',
            '过度依赖加塞'
        ],
        'practice_requirements', '完成30次顺塞和反塞练习，各15次，在不同角度和距离的球型中练习',
        'success_criteria', '能够正确选择顺塞或反塞，在标准球型中让白球到达目标区域（直径30cm），成功率达到60%',
        'related_courses', ARRAY[32, 33]
    ),
    20,
    25
FROM sub_skills ss
JOIN training_skills s ON ss.skill_id = s.id
WHERE s.skill_name = '加塞技术' AND ss.sub_skill_name = '加塞瞄准与走位'
ON CONFLICT DO NOTHING;

-- Unit 4: 加塞综合应用 (challenge)
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'challenge',
    4,
    '加塞综合应用',
    jsonb_build_object(
        'theory', '加塞综合测试将检验你对加塞技术的全面掌握。测试包括10个实战球型，涵盖：
- 定杆 vs 加塞的选择
- 5分点的灵活运用
- 顺塞和反塞的实战应用
- 角度球的加塞瞄准
- 长台加塞走位

评分标准：
- 加塞方向选择正确：5分
- 塞量适当：5分
- 瞄准修正准确：5分
- 白球停位理想：10分
- 动作规范：5分',
        'steps', ARRAY[
            '球型1-2：5分点基础测试（中心、半杆塞、一杆塞）',
            '球型3-4：顺塞走位测试（长台一库走位）',
            '球型5-6：反塞走位测试（近台控制）',
            '球型7-8：角度球加塞（30度和60度角）',
            '球型9：自选加塞方案（复杂球型）',
            '球型10：限时加塞（90秒规划和执行）'
        ],
        'tips', ARRAY[
            '先判断是否必须加塞，能用定杆就不要加塞',
            '加塞前先明确走位目标',
            '身位调整要到位',
            '力量要稳定，避免突变',
            '观察白球旋转，验证塞量',
            '失败后分析：是塞量问题还是瞄准问题'
        ],
        'common_mistakes', ARRAY[
            '不该加塞时加塞',
            '塞量选择不当',
            '瞄准修正错误',
            '身位调整不足',
            '力量控制不稳',
            '心理紧张影响发挥'
        ],
        'practice_requirements', '完成10个标准测试球型，每个球型2次机会，记录得分和成功率',
        'success_criteria', '10个球型中至少成功6个（60%），总分达到200分（满分300分），能够熟练运用5分点和顺反塞技术',
        'related_courses', ARRAY[29, 30, 31, 32, 33]
    ),
    30,
    30
FROM sub_skills ss
JOIN training_skills s ON ss.skill_id = s.id
WHERE s.skill_name = '加塞技术' AND ss.sub_skill_name = '加塞瞄准与走位'
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- Sub-skill 6.2: 实战清台提升 (2 units)
-- ----------------------------------------------------------------------------

-- Unit 5: 中高级清台演练 (practice)
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'practice',
    5,
    '中高级清台演练',
    jsonb_build_object(
        'theory', '中高级清台在简单清台的基础上，增加了球的数量(8-10个)和复杂度。需要综合运用加塞、走位、思路规划等所有技术。重点培养：

1. 复杂球型分析能力
2. 多步骤路线规划
3. 加塞走位的实战运用
4. 问题球的创造性处理
5. 心态和节奏控制

中高级清台的难点：
- 问题球增多（贴库、角度差、距离远）
- 需要精确的走位控制
- 容错率降低
- 心理压力增大

清台策略：
- 识别关键球和转折球
- 为难打球创造机会
- 保持白球在有利位置
- 必要时使用防守策略',
        'steps', ARRAY[
            '摆放中高级球型：8-10个球，包含2-3个问题球',
            '用5分钟分析球型：',
            '  - 识别所有球的难度等级',
            '  - 找出关键球（决定清台成败的球）',
            '  - 规划大致打球顺序',
            '  - 确定需要加塞的球',
            '开始清台：',
            '  - 严格按照规划执行',
            '  - 每球打完重新评估',
            '  - 遇到困难及时调整',
            '  - 记录关键处理',
            '总结分析：',
            '  - 成功/失败的原因',
            '  - 哪些技术需要加强',
            '  - 思路规划是否合理'
        ],
        'tips', ARRAY[
            '不要急于求成，中高级清台成功率本来就较低',
            '重点培养分析思路，而非必须清台成功',
            '每次清台都要有完整规划',
            '记录每次尝试的杆数和关键球处理',
            '可以录像回看，分析得失',
            '和高手交流，学习他们的清台思路'
        ],
        'common_mistakes', ARRAY[
            '规划不够详细，打一杆看一杆',
            '问题球处理时机不当',
            '过度追求完美走位，浪费机会',
            '心态失衡，越打越急',
            '技术执行不到位'
        ],
        'practice_requirements', '完成10次中高级清台练习，每次8-10个球，记录成功次数、总杆数和关键处理',
        'success_criteria', '中高级清台（8个球）成功率达到40%，或者失败时能够准确分析失误原因',
        'related_courses', ARRAY[38, 39]
    ),
    20,
    30
FROM sub_skills ss
JOIN training_skills s ON ss.skill_id = s.id
WHERE s.skill_name = '加塞技术' AND ss.sub_skill_name = '实战清台提升'
ON CONFLICT DO NOTHING;

-- Unit 6: 实战清台考核 (challenge)
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'challenge',
    6,
    '实战清台考核',
    jsonb_build_object(
        'theory', '实战清台考核模拟真实比赛环境，测试你的综合实力。考核包括3局完整的清台挑战：

第一局：标准开球清台（9个球+黑八）
第二局：复杂局面清台（10个球+障碍）
第三局：限时清台（8个球，15分钟内完成）

评分体系（满分100分）：
- 清台成功：基础30分
- 杆数效率：少于12杆额外10分
- 关键球处理：15分
- 走位质量：15分
- 技术规范：10分
- 心态稳定：10分
- 时间管理：10分

通过标准：
- 3局中至少成功清台1局
- 总分达到60分
- 展现出清台思路和技术运用',
        'steps', ARRAY[
            '第一局：标准开球清台',
            '  1. 开球或摆放9个球',
            '  2. 完整分析球型（不限时）',
            '  3. 规划清台路线',
            '  4. 执行并记录结果',
            '第二局：复杂局面清台',
            '  1. 摆放10个球（包含难球）',
            '  2. 分析并规划（10分钟）',
            '  3. 执行清台',
            '  4. 记录关键处理',
            '第三局：限时清台',
            '  1. 摆放8个球',
            '  2. 15分钟内完成清台',
            '  3. 测试决策速度和执行力'
        ],
        'tips', ARRAY[
            '三局考核间隔休息5分钟，调整状态',
            '第一局要全力以赴，建立信心',
            '第二局重点展现思路和处理能力',
            '第三局注意时间分配，不要拖延',
            '失误不要灰心，专注当下',
            '记录整个考核过程，事后复盘'
        ],
        'common_mistakes', ARRAY[
            '第一局失败就失去信心',
            '过度紧张影响发挥',
            '时间管理不当',
            '关键球处理失误',
            '走位质量下降',
            '没有备选方案'
        ],
        'practice_requirements', '完成3局清台考核，每局记录详细数据：杆数、用时、成功/失败、关键处理、得分',
        'success_criteria', '3局中至少成功清台1局，总分达到60分，展现出清台思路、技术运用和心态稳定性',
        'related_courses', ARRAY[38, 39, 40]
    ),
    30,
    40
FROM sub_skills ss
JOIN training_skills s ON ss.skill_id = s.id
WHERE s.skill_name = '加塞技术' AND ss.sub_skill_name = '实战清台提升'
ON CONFLICT DO NOTHING;

-- 提交事务
COMMIT;

-- ============================================================================
-- 验证 Level 6 导入
-- ============================================================================

DO $$
DECLARE
    unit_count INTEGER;
    subskill1_count INTEGER;
    subskill2_count INTEGER;
BEGIN
    -- 统计Level 6总单元数
    SELECT COUNT(*) INTO unit_count
    FROM training_units tu
    JOIN sub_skills ss ON tu.sub_skill_id = ss.id
    JOIN training_skills s ON ss.skill_id = s.id
    WHERE s.skill_name = '加塞技术';

    -- 统计子技能1的单元数
    SELECT COUNT(*) INTO subskill1_count
    FROM training_units tu
    JOIN sub_skills ss ON tu.sub_skill_id = ss.id
    WHERE ss.sub_skill_name = '加塞瞄准与走位';

    -- 统计子技能2的单元数
    SELECT COUNT(*) INTO subskill2_count
    FROM training_units tu
    JOIN sub_skills ss ON tu.sub_skill_id = ss.id
    WHERE ss.sub_skill_name = '实战清台提升';

    -- 输出验证结果
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Level 6 (实战演练 - 加塞与清台) 导入验证';
    RAISE NOTICE '===========================================';
    RAISE NOTICE '子技能 6.1 (加塞瞄准与走位): % 个单元', subskill1_count;
    RAISE NOTICE '子技能 6.2 (实战清台提升): % 个单元', subskill2_count;
    RAISE NOTICE '-------------------------------------------';
    RAISE NOTICE '总计: % 个单元', unit_count;
    RAISE NOTICE '===========================================';

    IF unit_count = 6 THEN
        RAISE NOTICE '✅ Level 6 导入成功！';
    ELSE
        RAISE WARNING '⚠️  Level 6 导入不完整，期望6个，实际%个', unit_count;
    END IF;
END $$;

-- ============================================================================
-- 查询 Level 6 训练单元详细信息
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
WHERE s.skill_name = '加塞技术'
ORDER BY ss.sub_skill_order, tu.unit_order;

-- ============================================================================
-- 使用说明
-- ============================================================================
--
-- 执行顺序:
-- 1. 确保已执行 11_create_subskills_level4_8.sql（创建子技能）
-- 2. 执行本脚本导入Level 6训练单元
-- 3. 验证导入结果
--
-- 回滚方法:
-- DELETE FROM training_units tu
-- USING sub_skills ss, skills s
-- WHERE tu.sub_skill_id = ss.id
--   AND ss.skill_id = s.id
--   AND s.skill_name = '加塞技术';
--
-- ============================================================================
