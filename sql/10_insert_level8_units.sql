-- ============================================================================
-- V2.1 Training System: Level 8 Training Units Import
-- ============================================================================
-- 导入Level 8 (大师之境 - 思路与心态) 的5个训练单元
-- 前置条件: 需要先执行 11_create_subskills_level4_8.sql 创建子技能
-- 作者: 耶氏台球学院
-- 日期: 2025-01-10
-- ============================================================================

-- 开始事务
BEGIN;

-- ============================================================================
-- 子技能 8.1: 系统化日常训练 (3单元)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Unit 1: 日常热身系统
-- ----------------------------------------------------------------------------
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'theory',
    1,
    '日常热身系统',
    jsonb_build_object(
        'theory', '专业球手都有一套系统的热身流程，通过科学的热身能够快速进入最佳状态，避免受伤，提高训练效率。日常热身系统包括：

1. 身体热身（10分钟）
   - 颈部、肩部、腰部、手腕拉伸
   - 激活核心肌群
   - 提高身体灵活性
   - 预防运动损伤

2. 技术热身（15分钟）
   - 直线球5个：唤醒瞄准感觉
   - 45度角度球5个：激活切球感
   - 定杆控制5个：找到击球力度
   - 低杆高杆各5个：恢复杆法手感

3. 心理热身（5分钟）
   - 深呼吸放松
   - 正向心理暗示
   - 回忆成功经验
   - 设定训练目标

热身的重要性：
- 降低受伤风险（颈椎、腰椎）
- 快速进入最佳状态
- 提高训练质量
- 建立训练仪式感

职业选手的热身时间通常是30-45分钟。',
        'steps', ARRAY[
            '第一阶段：身体准备（10分钟）',
            '  - 颈部左右转动各10次',
            '  - 肩部绕环前后各10次',
            '  - 腰部扭转左右各10次',
            '  - 手腕旋转各方向10次',
            '  - 深蹲10次激活腿部',
            '第二阶段：球感恢复（15分钟）',
            '  - 直线球：建立瞄准基准',
            '  - 角度球：唤醒切球手感',
            '  - 力量控制：找到击球节奏',
            '  - 杆法控制：恢复技术细节',
            '第三阶段：心理准备（5分钟）',
            '  - 深呼吸3次',
            '  - 正向暗示：''我状态很好''',
            '  - 设定目标：''今天重点练习XXX'''
        ],
        'tips', ARRAY[
            '热身不能省略，这是职业态度的体现',
            '每次训练开始前都要完整热身',
            '根据自己的身体状况调整热身时间',
            '热身也是检查状态的过程',
            '可以在热身中加入前一天的薄弱项目',
            '冬天需要更长的热身时间'
        ],
        'common_mistakes', ARRAY[
            '跳过热身直接训练',
            '热身时间过短',
            '只做技术热身不做身体热身',
            '热身强度过大',
            '没有固定的热身流程',
            '热身过程中聊天分心'
        ],
        'practice_requirements', '制定个人专属的30分钟热身计划，包括身体热身、技术热身和心理准备的详细步骤',
        'success_criteria', '能够独立完成标准热身流程，热身后能够快速进入训练状态，建立固定的热身习惯',
        'related_courses', ARRAY[44, 45, 46]
    ),
    10,
    10
FROM sub_skills ss
JOIN training_skills s ON ss.skill_id = s.id
WHERE s.skill_name = '竞技心态' AND ss.sub_skill_name = '系统化日常训练'
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- Unit 2: 肌肉激活套路
-- ----------------------------------------------------------------------------
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'practice',
    2,
    '肌肉激活套路',
    jsonb_build_object(
        'theory', '肌肉激活套路（Muscle Activation Routine）是通过一系列标准化的击球练习来激活台球所需的肌肉群和神经系统。这是职业选手的必备训练，能够让身体记住正确的发力模式。

核心肌肉群：
1. 手臂肌群：控制球杆运动
2. 肩部肌群：稳定出杆姿态
3. 腰腹核心：保持身体平衡
4. 腿部肌群：提供稳定支撑

激活套路（标准15球法）：
- 直线球5个：激活基础肌群
- 定杆5个：激活控制肌群
- 低杆5个：激活发力肌群
- 每种球型要求不同力量
- 全程保持技术规范

训练目标：
- 建立肌肉记忆
- 提高动作一致性
- 增强击球稳定性
- 形成训练仪式',
        'steps', ARRAY[
            '第一组：直线球激活（5球）',
            '  - 近距离直线球（30cm）2个',
            '  - 中距离直线球（50cm）2个',
            '  - 远距离直线球（70cm）1个',
            '  - 关注：手臂伸展，肩部稳定',
            '第二组：定杆激活（5球）',
            '  - 45度角定杆 3个',
            '  - 60度角定杆 2个',
            '  - 关注：腰部旋转，核心稳定',
            '第三组：低杆激活（5球）',
            '  - 近距离低杆 2个',
            '  - 中距离低杆 2个',
            '  - 远距离低杆 1个',
            '  - 关注：发力传递，手腕控制',
            '第四组：力量阶梯（5球）',
            '  - 极轻力量 1个',
            '  - 轻力量 1个',
            '  - 中力量 1个',
            '  - 中重力量 1个',
            '  - 重力量 1个'
        ],
        'tips', ARRAY[
            '每天训练前都要完成这套激活',
            '动作要规范，不求速度',
            '失败的球要重新打，直到成功',
            '感受每个肌群的参与',
            '可以增加难度（更远距离，更难角度）',
            '记录每天的完成时间和成功率',
            '逐渐将这套练习内化为习惯'
        ],
        'common_mistakes', ARRAY[
            '动作不规范，只追求进球',
            '速度过快，没有激活效果',
            '跳过失败的球',
            '力量分级不清晰',
            '没有专注感受肌肉',
            '缺乏耐心，急于进入正式训练'
        ],
        'practice_requirements', '连续7天，每天训练前完成标准15球激活套路，记录成功率和用时，形成固定习惯',
        'success_criteria', '能够独立完成激活套路，15球成功率达到90%，用时稳定在15-20分钟，形成肌肉记忆',
        'related_courses', ARRAY[44, 46, 47]
    ),
    20,
    20
FROM sub_skills ss
JOIN training_skills s ON ss.skill_id = s.id
WHERE s.skill_name = '竞技心态' AND ss.sub_skill_name = '系统化日常训练'
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- Unit 3: 节奏训练法
-- ----------------------------------------------------------------------------
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'practice',
    3,
    '节奏训练法',
    jsonb_build_object(
        'theory', '节奏是台球的灵魂。优秀的球手都有稳定的击球节奏，包括：试杆节奏、呼吸节奏、出杆节奏、走位节奏。节奏训练能够提高稳定性和临场发挥。

节奏的四个维度：

1. 试杆节奏（Pre-shot Routine）
   - 固定的试杆次数（3-5次）
   - 每次试杆相同的时间
   - 试杆到击球的时间间隔

2. 呼吸节奏
   - 瞄准时：深呼吸放松
   - 试杆时：平稳呼吸
   - 击球时：缓慢呼气

3. 出杆节奏
   - 后拉速度：慢
   - 前推速度：根据力量调整
   - 整体节奏：流畅不停顿

4. 走位节奏
   - 击球后观察：2秒
   - 走向下一球：稳步不急
   - 下一次瞄准：重新建立节奏

节奏训练方法：
- 节拍器辅助：设定固定BPM
- 录像分析：检查节奏一致性
- 冥想训练：内化节奏感',
        'steps', ARRAY[
            '基础节奏建立（10分钟）：',
            '  1. 选择5个简单直球',
            '  2. 设定节奏：试杆4次，每次3秒',
            '  3. 试杆到击球间隔2秒',
            '  4. 严格按照节奏执行',
            '  5. 不成功则重来',
            '角度球节奏（10分钟）：',
            '  1. 选择5个45度角度球',
            '  2. 保持相同的试杆节奏',
            '  3. 观察节奏对成功率的影响',
            '压力下的节奏（10分钟）：',
            '  1. 限时击球：每球30秒',
            '  2. 在压力下保持节奏',
            '  3. 5个连续球不能失误',
            '节奏一致性测试（5分钟）：',
            '  1. 10个球连续击打',
            '  2. 用手机录像',
            '  3. 回看检查节奏一致性'
        ],
        'tips', ARRAY[
            '节奏比速度更重要',
            '找到属于自己的节奏，不要模仿他人',
            '可以使用节拍器辅助训练（建议80-100 BPM）',
            '节奏稳定比节奏快更有价值',
            '压力下最容易失去节奏，要刻意练习',
            '职业选手都有高度一致的击球节奏',
            '节奏训练需要长期坚持才有效'
        ],
        'common_mistakes', ARRAY[
            '节奏时快时慢，不稳定',
            '压力下节奏加快',
            '没有固定的试杆次数',
            '击球前突然停顿',
            '忽略呼吸节奏',
            '模仿他人节奏而忽略自己的习惯'
        ],
        'practice_requirements', '完成30分钟节奏训练，包括基础建立、角度球、压力测试，录像分析自己的节奏一致性',
        'success_criteria', '建立稳定的击球节奏，在压力下能够保持节奏不变，试杆次数和时间保持一致（误差±0.5秒）',
        'related_courses', ARRAY[8, 9, 10, 46]
    ),
    20,
    25
FROM sub_skills ss
JOIN training_skills s ON ss.skill_id = s.id
WHERE s.skill_name = '竞技心态' AND ss.sub_skill_name = '系统化日常训练'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 子技能 8.2: 竞技心态培养 (2单元)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Unit 4: 比赛心态训练
-- ----------------------------------------------------------------------------
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'practice',
    4,
    '比赛心态训练',
    jsonb_build_object(
        'theory', '台球是心理游戏，技术只占50%，心态占50%。比赛心态训练能够帮助你在关键时刻发挥最佳水平。

比赛心态的三个层次：

1. 赛前心态
   - 积极心理暗示
   - 合理目标设定
   - 压力转化为动力
   - 充足的准备

2. 赛中心态
   - 专注当下这一杆
   - 不被领先或落后影响
   - 保持情绪稳定
   - 相信自己的能力

3. 赛后心态
   - 胜不骄败不馁
   - 客观分析得失
   - 总结经验教训
   - 规划下一步提升

常见心理问题及应对：

1. 紧张：深呼吸，专注技术动作
2. 急躁：放慢节奏，重建信心
3. 患得患失：只想这一杆，不想结果
4. 畏惧对手：专注自己，不看对手
5. 失误沮丧：接受失误，调整心态

心态训练方法：
- 压力模拟训练
- 心理暗示训练
- 冥想和放松训练
- 复盘和反思',
        'steps', ARRAY[
            '理论学习（5分钟）：',
            '  - 理解比赛心态的重要性',
            '  - 学习应对压力的方法',
            '  - 掌握心理调节技巧',
            '压力模拟训练（15分钟）：',
            '  1. 设定压力场景：''必须连续进5个球''',
            '  2. 限时完成：''10分钟内完成''',
            '  3. 失败惩罚：''失误则重来''',
            '  4. 记录心跳和心理感受',
            '  5. 分析压力下的表现',
            '心理调节练习（5分钟）：',
            '  - 深呼吸放松法：吸气4秒，呼气6秒',
            '  - 正向暗示：''我能做到，我准备好了''',
            '  - 压力释放：肌肉紧张-放松循环'
        ],
        'tips', ARRAY[
            '心态训练和技术训练同样重要',
            '压力是正常的，关键是如何应对',
            '建立自己的赛前仪式（听音乐、冥想等）',
            '多参加比赛积累经验',
            '向心理素质好的球手学习',
            '记录比赛日志，分析心理状态',
            '不要过度在意结果，享受过程'
        ],
        'common_mistakes', ARRAY[
            '忽视心态训练',
            '只在比赛时才重视心态',
            '压力下改变技术动作',
            '失误后心态崩溃',
            '过度在意对手和结果',
            '缺乏压力下的训练'
        ],
        'practice_requirements', '完成3次压力模拟训练，每次15分钟，记录心理感受和应对方法，制定个人心态调节方案',
        'success_criteria', '理解比赛心态的重要性，掌握基本的心理调节方法，在压力模拟中展现出心态控制能力',
        'related_courses', ARRAY[48, 49, 50]
    ),
    20,
    25
FROM sub_skills ss
JOIN training_skills s ON ss.skill_id = s.id
WHERE s.skill_name = '竞技心态' AND ss.sub_skill_name = '竞技心态培养'
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- Unit 5: 大师综合运用
-- ----------------------------------------------------------------------------
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'challenge',
    5,
    '大师综合运用',
    jsonb_build_object(
        'theory', '大师综合运用是Level 8的终极考核，将测试你在整个成长路径中学到的所有技能。这不仅是技术测试，更是思路、心态、习惯的综合检验。

考核内容：

第一部分：完整训练流程（20分钟）
- 标准热身（身体+技术+心理）
- 肌肉激活套路
- 节奏建立

第二部分：技术综合测试（25分钟）
- 基础技术：5个球
- 中级技术：5个球
- 高级技术：5个球
- 大师技术：5个球

第三部分：实战清台（15分钟）
- 完整清台1局（10个球）
- 展现思路、技术、心态

评分体系（满分200分）：
- 热身规范性：20分
- 基础技术：30分
- 中级技术：30分
- 高级技术：30分
- 大师技术：30分
- 实战清台：40分
- 综合表现：20分

通过标准：
- 完成完整训练流程
- 20个技术测试成功12个（60%）
- 清台成功或接近成功
- 总分达到120分
- 展现大师风范',
        'steps', ARRAY[
            '准备阶段（10分钟前）：',
            '  - 身体和心理准备',
            '  - 回顾训练要点',
            '  - 设定测试目标',
            '第一部分：完整训练流程（20分钟）',
            '  - 身体热身：10分钟',
            '  - 肌肉激活：15球',
            '  - 节奏建立：10球',
            '  - 评分标准：流程规范性',
            '第二部分：技术测试（25分钟）',
            '  - 基础：直线、定杆、低杆、高杆、走位',
            '  - 中级：加塞、清台思路、走位规划',
            '  - 高级：角度球、中袋球、极限高球',
            '  - 大师：综合球型、压力测试',
            '第三部分：实战清台（15分钟）',
            '  - 摆放10个球',
            '  - 完整分析（5分钟）',
            '  - 执行清台（10分钟）',
            '  - 展现Level 8水平'
        ],
        'tips', ARRAY[
            '这是对整个成长路径的总结',
            '重点不是成功率，而是展现完整能力',
            '保持冷静，享受过程',
            '每个环节都要认真对待',
            '失误后快速调整，不影响后续',
            '展现出大师的气质和风范',
            '相信自己的训练成果',
            '无论结果如何，都是成长的证明'
        ],
        'common_mistakes', ARRAY[
            '跳过热身直接测试',
            '过度紧张影响发挥',
            '某个环节失败就放弃',
            '没有展现完整流程',
            '忽视心态和思路展现',
            '只关注技术忽视整体'
        ],
        'practice_requirements', '完成完整的大师综合考核，记录每个环节的表现，总结整个Level 1-8的成长历程',
        'success_criteria', '完成完整流程，技术测试成功率60%以上，清台成功或接近成功，总分120分以上，展现出系统的训练习惯和大师心态',
        'related_courses', ARRAY[51, 52]
    ),
    30,
    60
FROM sub_skills ss
JOIN training_skills s ON ss.skill_id = s.id
WHERE s.skill_name = '竞技心态' AND ss.sub_skill_name = '竞技心态培养'
ON CONFLICT DO NOTHING;

-- 提交事务
COMMIT;

-- ============================================================================
-- 验证导入结果
-- ============================================================================

DO $$
DECLARE
    unit_count INTEGER;
    subskill1_count INTEGER;
    subskill2_count INTEGER;
BEGIN
    -- 统计Level 8总单元数
    SELECT COUNT(*) INTO unit_count
    FROM training_units tu
    JOIN sub_skills ss ON tu.sub_skill_id = ss.id
    JOIN training_skills s ON ss.skill_id = s.id
    WHERE s.skill_name = '竞技心态';

    -- 统计各子技能单元数
    SELECT COUNT(*) INTO subskill1_count
    FROM training_units tu
    JOIN sub_skills ss ON tu.sub_skill_id = ss.id
    WHERE ss.sub_skill_name = '系统化日常训练';

    SELECT COUNT(*) INTO subskill2_count
    FROM training_units tu
    JOIN sub_skills ss ON tu.sub_skill_id = ss.id
    WHERE ss.sub_skill_name = '竞技心态培养';

    -- 输出验证结果
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Level 8 训练单元导入验证';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Level 8 总单元数: %', unit_count;
    RAISE NOTICE '  - 子技能 8.1 (系统化日常训练): % 个单元', subskill1_count;
    RAISE NOTICE '  - 子技能 8.2 (竞技心态培养): % 个单元', subskill2_count;
    RAISE NOTICE '===========================================';

    IF unit_count = 5 THEN
        RAISE NOTICE '✅ Level 8 导入成功！';
    ELSE
        RAISE WARNING '⚠️  Level 8 导入不完整，期望5个单元，实际%个', unit_count;
    END IF;
END $$;

-- ============================================================================
-- Level 4-8 完整验证
-- ============================================================================

DO $$
DECLARE
    total_units INTEGER;
    level4_count INTEGER;
    level5_count INTEGER;
    level6_count INTEGER;
    level7_count INTEGER;
    level8_count INTEGER;
BEGIN
    -- 统计各级别单元数
    SELECT COUNT(*) INTO level4_count
    FROM training_units tu
    JOIN sub_skills ss ON tu.sub_skill_id = ss.id
    JOIN training_skills s ON ss.skill_id = s.id
    WHERE s.skill_name = '杆法技术';

    SELECT COUNT(*) INTO level5_count
    FROM training_units tu
    JOIN sub_skills ss ON tu.sub_skill_id = ss.id
    JOIN training_skills s ON ss.skill_id = s.id
    WHERE s.skill_name = '走位技术';

    SELECT COUNT(*) INTO level6_count
    FROM training_units tu
    JOIN sub_skills ss ON tu.sub_skill_id = ss.id
    JOIN training_skills s ON ss.skill_id = s.id
    WHERE s.skill_name = '加塞技术';

    SELECT COUNT(*) INTO level7_count
    FROM training_units tu
    JOIN sub_skills ss ON tu.sub_skill_id = ss.id
    JOIN training_skills s ON ss.skill_id = s.id
    WHERE s.skill_name = '高级技术';

    SELECT COUNT(*) INTO level8_count
    FROM training_units tu
    JOIN sub_skills ss ON tu.sub_skill_id = ss.id
    JOIN training_skills s ON ss.skill_id = s.id
    WHERE s.skill_name = '竞技心态';

    total_units := level4_count + level5_count + level6_count + level7_count + level8_count;

    -- 输出总结
    RAISE NOTICE '';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Fu Jiajun V2.1 训练系统导入完成';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Level 4 (杆法技术): % 个单元', level4_count;
    RAISE NOTICE 'Level 5 (走位技术): % 个单元', level5_count;
    RAISE NOTICE 'Level 6 (加塞技术): % 个单元', level6_count;
    RAISE NOTICE 'Level 7 (高级技术): % 个单元', level7_count;
    RAISE NOTICE 'Level 8 (竞技心态): % 个单元', level8_count;
    RAISE NOTICE '-------------------------------------------';
    RAISE NOTICE '总计: % 个训练单元', total_units;
    RAISE NOTICE '===========================================';

    IF total_units = 33 THEN
        RAISE NOTICE '🎉 Fu Jiajun V2.1 训练数据导入成功！';
        RAISE NOTICE '可以开始前端集成和API开发工作';
    ELSE
        RAISE WARNING '⚠️  导入不完整，期望33个单元，实际%个', total_units;
    END IF;
END $$;

-- ============================================================================
-- 查询Level 8训练单元详细信息
-- ============================================================================

SELECT
    s.skill_name AS "技能",
    ss.sub_skill_name AS "子技能",
    tu.unit_order AS "顺序",
    tu.title AS "单元标题",
    tu.unit_type AS "类型",
    tu.xp_reward AS "经验值",
    tu.estimated_minutes AS "时长(分钟)"
FROM training_units tu
JOIN sub_skills ss ON tu.sub_skill_id = ss.id
JOIN training_skills s ON ss.skill_id = s.id
WHERE s.skill_name = '竞技心态'
ORDER BY ss.sub_skill_order, tu.unit_order;

-- ============================================================================
-- 使用说明
-- ============================================================================
--
-- 执行顺序:
-- 1. 确保已执行 11_create_subskills_level4_8.sql 创建子技能
-- 2. 确保已执行 06-09_insert_level4_7_units.sql 导入Level 4-7
-- 3. 执行本脚本导入Level 8训练单元
--
-- 完整导入顺序:
-- 11_create_subskills_level4_8.sql
-- 06_insert_level4_units.sql (8 units)
-- 07_insert_level5_units.sql (8 units)
-- 08_insert_level6_units.sql (6 units)
-- 09_insert_level7_units.sql (6 units)
-- 10_insert_level8_units.sql (5 units) -- 本文件
--
-- 回滚方法:
-- DELETE FROM training_units
-- WHERE sub_skill_id IN (
--   SELECT ss.id FROM sub_skills ss
--   JOIN training_skills s ON ss.skill_id = s.id
--   WHERE s.skill_name = '竞技心态'
-- );
--
-- 注意事项:
-- - Level 8是大师之境，包含最终综合考核
-- - 使用 ON CONFLICT DO NOTHING 避免重复插入
-- - related_courses映射到52集王猛课程的最后部分
-- - 大师综合运用是整个成长路径的终极测试
-- ============================================================================
