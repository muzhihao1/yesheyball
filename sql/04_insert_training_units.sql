-- ============================================================================
-- 导入16个训练单元 (Training Units)
-- ============================================================================
-- 前置条件:必须先执行 03_insert_remaining_subskills.sql
-- ============================================================================

-- ============================================================================
-- Sub-skill 1: 稳固的根基 - 补充4个训练单元 (Units 2-5)
-- ============================================================================

-- Unit 2: 手架:稳如泰山 (practice)
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'practice',
    2,
    '手架:稳如泰山',
    jsonb_build_object(
        'type', 'practice',
        'instructions', '# 凤眼式手架练习

## 标准动作:
1. 手掌平铺台面,虎口朝向球杆方向
2. 拇指与食指形成"凤眼",球杆从中穿过
3. 其他三指自然弯曲,稳固支撑

## 练习目标:
- 完成 **5次** 标准手架定型
- 每次保持 **30秒** 不动
- 确保球杆可以在手架中自由滑动

## 自我检查:
- [ ] 手掌是否完全贴合台面?
- [ ] 虎口是否紧贴球杆?
- [ ] 手架是否稳定不晃动?',
        'demo_video', '',
        'success_criteria', jsonb_build_object(
            'type', 'repetitions',
            'target', 5
        )
    ),
    20,
    15
FROM sub_skills ss
WHERE ss.sub_skill_name = '稳固的根基'
ON CONFLICT DO NOTHING;

-- Unit 3: 握杆:松紧有度 (practice)
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'practice',
    3,
    '握杆:松紧有度',
    jsonb_build_object(
        'type', 'practice',
        'instructions', '# 正确握杆练习

## 标准动作:
1. 轻握球杆后端,手指自然弯曲包裹
2. 拇指与食指形成"V"字形,指向杆尾
3. 握杆力度:能稳固控制,但不僵硬
4. 手腕保持放松,允许杆体在手中自然滑动

## 练习目标:
- 完成 **10次** 握杆-松开动作
- 每次握杆时感受"轻而稳"的力度
- 试杆时确保手腕灵活

## 自我检查:
- [ ] 握杆是否过紧导致手腕僵硬?
- [ ] 杆体是否能在手中自然前后滑动?
- [ ] V字形是否正确指向杆尾?

## 常见错误:
- ❌ 握杆过紧,导致出杆僵硬
- ❌ 握杆位置过前或过后
- ❌ 手指张开过大,失去控制',
        'demo_video', '',
        'success_criteria', jsonb_build_object(
            'type', 'repetitions',
            'target', 10
        )
    ),
    20,
    15
FROM sub_skills ss
WHERE ss.sub_skill_name = '稳固的根基'
ON CONFLICT DO NOTHING;

-- Unit 4: 入位:瞄准视角 (practice)
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'practice',
    4,
    '入位:瞄准视角',
    jsonb_build_object(
        'type', 'practice',
        'instructions', '# 标准入位练习

## 标准动作:
1. 双脚与肩同宽,前脚指向目标球
2. 上身前倾45度,下颌贴近球杆
3. 后手握杆自然下垂,前手形成手架
4. 眼睛-球杆-白球-目标球成一直线

## 练习目标:
- 完成 **8次** 标准入位动作
- 每次入位后保持姿势15秒
- 确保视线、球杆、目标球对齐

## 自我检查:
- [ ] 双脚站位是否稳定?
- [ ] 上身是否保持前倾45度?
- [ ] 眼睛是否沿着球杆瞄向目标?
- [ ] 身体是否放松不僵硬?

## 要点提示:
- 前脚脚尖对准目标球,后脚自然站立
- 下颌贴近球杆,但不要压在上面
- 瞄准线:眼→杆→白球→目标球',
        'demo_video', '',
        'success_criteria', jsonb_build_object(
            'type', 'repetitions',
            'target', 8
        )
    ),
    20,
    15
FROM sub_skills ss
WHERE ss.sub_skill_name = '稳固的根基'
ON CONFLICT DO NOTHING;

-- Unit 5: 姿势:整体协调 (practice)
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'practice',
    5,
    '姿势:整体协调',
    jsonb_build_object(
        'type', 'practice',
        'instructions', '# 整体姿势协调练习

## 标准动作流程:
1. **站位**:双脚分开,身体对准目标
2. **下蹲**:上身前倾,下颌接近球杆
3. **手架**:前手稳固支撑在台面
4. **握杆**:后手轻握杆尾,手腕放松
5. **瞄准**:眼睛沿杆体看向目标球

## 练习目标:
- 完成 **6次** 完整姿势流程
- 每次从站立到瞄准一气呵成
- 保持最终姿势20秒不动

## 自我检查:
- [ ] 动作流程是否连贯自然?
- [ ] 最终姿势是否稳定舒适?
- [ ] 身体各部位是否协调配合?
- [ ] 瞄准线是否清晰准确?

## 协调要点:
- 下身稳定,上身灵活
- 前手支撑,后手控制
- 身心放松,注意力集中',
        'demo_video', '',
        'success_criteria', jsonb_build_object(
            'type', 'repetitions',
            'target', 6
        )
    ),
    20,
    15
FROM sub_skills ss
WHERE ss.sub_skill_name = '稳固的根基'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Sub-skill 2: 笔直的出杆 - 5个训练单元
-- ============================================================================

-- Unit 1: 笔直出杆的重要性 (theory)
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'theory',
    1,
    '笔直出杆的重要性',
    jsonb_build_object(
        'type', 'theory',
        'text', '# 为什么出杆必须笔直?

## 核心原理

笔直的出杆是准确击球的基础。如果出杆轨迹偏离,即使瞄准再准确,也无法将力量准确传递给目标球。

## 笔直出杆的三大好处

### 1. 提升准确性 ✅
- 球杆沿直线运动,力的方向与瞄准方向一致
- 减少偏差,提高进球率

### 2. 稳定发力 ✅
- 直线运动的力量传递最高效
- 避免侧旋等非预期效果

### 3. 控制母球 ✅
- 精准控制母球的走位
- 为下一杆创造有利位置

## 常见的出杆偏移

- ❌ **左右偏移**:手架不稳,球杆横向摆动
- ❌ **上下起伏**:握杆过紧,手腕僵硬
- ❌ **加速不均**:出杆时突然加速或减速

## 检测方法

将一瓶矿泉水立在台面上,球杆从瓶口穿过试杆。如果杆体碰到瓶口,说明出杆不够笔直。',
        'images', '[]'::jsonb,
        'video', ''
    ),
    10,
    5
FROM sub_skills ss
WHERE ss.sub_skill_name = '笔直的出杆'
ON CONFLICT DO NOTHING;

-- Unit 2: 慢速出杆练习 (practice)
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'practice',
    2,
    '慢速出杆练习',
    jsonb_build_object(
        'type', 'practice',
        'instructions', '# 慢动作出杆练习

## 练习方法:
1. 标准入位,手架稳固
2. 握杆放松,手腕自然
3. **极慢速度**完成出杆动作(至少3秒)
4. 感受球杆沿直线运动的感觉
5. 击打白球后,杆头自然停在原位

## 练习目标:
- 完成 **15次** 慢速出杆
- 每次出杆时间不少于3秒
- 杆头轨迹保持水平直线

## 自我检查:
- [ ] 出杆过程中是否有左右摆动?
- [ ] 手腕是否保持放松?
- [ ] 杆头是否平稳向前推进?
- [ ] 击球点是否准确?

## 关键要点:
- **慢**:慢到能清晰感受每一寸运动
- **稳**:手架稳定,握杆不变
- **直**:杆体始终保持水平',
        'demo_video', '',
        'success_criteria', jsonb_build_object(
            'type', 'repetitions',
            'target', 15
        )
    ),
    20,
    15
FROM sub_skills ss
WHERE ss.sub_skill_name = '笔直的出杆'
ON CONFLICT DO NOTHING;

-- Unit 3: 击打白球定杆 (practice)
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'practice',
    3,
    '击打白球定杆',
    jsonb_build_object(
        'type', 'practice',
        'instructions', '# 定杆练习(击打白球中心点)

## 练习方法:
1. 将白球放在台面中央
2. 瞄准白球正中心(5分点)
3. 轻力出杆,击打白球
4. 观察白球是否原地旋转不走(定杆效果)

## 练习目标:
- 完成 **10次** 成功定杆
- 白球在击打后原地旋转
- 旋转幅度小于一个球的直径

## 成功标准:
- 白球被击打后几乎不前进
- 只有轻微的原地旋转
- 没有明显的前进或后退

## 自我检查:
- [ ] 击球点是否准确在白球中心?
- [ ] 出杆是否笔直水平?
- [ ] 力度是否适中(不过大不过小)?

## 失败分析:
- 白球向前走:击球点偏上
- 白球向后退:击球点偏下
- 白球偏左右:出杆不够笔直',
        'demo_video', '',
        'success_criteria', jsonb_build_object(
            'type', 'repetitions',
            'target', 10
        )
    ),
    20,
    15
FROM sub_skills ss
WHERE ss.sub_skill_name = '笔直的出杆'
ON CONFLICT DO NOTHING;

-- Unit 4: 瓶子练习法 (practice)
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'practice',
    4,
    '瓶子练习法',
    jsonb_build_object(
        'type', 'practice',
        'instructions', '# 矿泉水瓶穿越练习

## 器材准备:
- 一个空的矿泉水瓶(500ml)
- 将瓶子立在台面上

## 练习方法:
1. 将瓶子放在白球后方约15cm处
2. 标准入位,球杆从瓶口穿过
3. 进行试杆动作(不击球)
4. 确保球杆前后运动时不碰到瓶口

## 练习目标:
- 完成 **20次** 试杆穿越
- 试杆过程中不碰到瓶子
- 保持自然的出杆速度

## 自我检查:
- [ ] 球杆是否从瓶口正中穿过?
- [ ] 前后试杆是否碰到瓶壁?
- [ ] 出杆轨迹是否保持水平?

## 进阶挑战:
- 将瓶子换成口径更小的(如可乐瓶)
- 增加试杆速度
- 完成10次连续不碰瓶',
        'demo_video', '',
        'success_criteria', jsonb_build_object(
            'type', 'repetitions',
            'target', 20
        )
    ),
    20,
    15
FROM sub_skills ss
WHERE ss.sub_skill_name = '笔直的出杆'
ON CONFLICT DO NOTHING;

-- Unit 5: 出杆稳定性测试 (challenge)
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'challenge',
    5,
    '出杆稳定性测试',
    jsonb_build_object(
        'type', 'challenge',
        'description', '# 笔直出杆综合挑战

## 挑战内容:

综合运用本章节所学的技巧,完成以下三项测试:

### 测试一:慢速定杆(5次)
- 慢速出杆,击打白球中心
- 白球原地旋转不前进
- 5次中至少成功3次

### 测试二:瓶子穿越(15次)
- 球杆从矿泉水瓶口穿越
- 试杆时不碰到瓶壁
- 15次中至少成功12次

### 测试三:连续定杆(3次)
- 连续3次成功定杆
- 中间不能失败
- 每次白球位移小于半个球

## 通过标准:
- 三项测试全部达标
- 总耗时不超过10分钟

## 失败后建议:
- 回顾"慢速出杆练习"
- 加强"击打白球定杆"训练
- 重点练习手架的稳定性',
        'success_criteria', jsonb_build_object(
            'type', 'custom',
            'description', '三项测试全部达标,且在10分钟内完成'
        ),
        'hints', jsonb_build_array(
            '慢即是快,不要急于求成',
            '手架稳定是笔直出杆的基础',
            '瓶子练习能快速发现出杆问题'
        ),
        'demo_video', ''
    ),
    30,
    20
FROM sub_skills ss
WHERE ss.sub_skill_name = '笔直的出杆'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Sub-skill 3: 发力基础 - 4个训练单元
-- ============================================================================

-- Unit 1: 发力原理与技巧 (theory)
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'theory',
    1,
    '发力原理与技巧',
    jsonb_build_object(
        'type', 'theory',
        'text', '# 台球发力的核心原理

## 什么是正确的发力?

台球的发力不是靠手臂的力量,而是通过**小臂的自然摆动**和**手腕的瞬间释放**来完成的。

## 三个发力关键点

### 1. 大臂固定 🔒
- 大臂(肘关节以上)保持相对静止
- 肘关节作为支点,不上下移动
- 这是稳定发力的基础

### 2. 小臂摆动 🔄
- 小臂(肘关节到手腕)像钟摆一样自然摆动
- 利用重力和惯性,而非肌肉力量
- 保持放松,避免僵硬

### 3. 手腕释放 ⚡
- 击球瞬间手腕自然向前送
- 像鞭子一样甩出去,而非推出去
- 释放要果断,不能犹豫

## 力量来源

| 错误认知 | 正确理解 |
|---------|---------|
| ❌ 手臂用力推 | ✅ 小臂自然摆 |
| ❌ 握杆越紧越好 | ✅ 握杆放松,瞬间收紧 |
| ❌ 全身用力 | ✅ 身体稳定,手臂发力 |

## 发力的三个阶段

1. **准备阶段**:握杆放松,小臂向后拉
2. **加速阶段**:小臂向前摆动,逐渐加速
3. **击球阶段**:手腕瞬间释放,完成击球

**记住**:发力的本质是"释放"而非"用力"!',
        'images', '[]'::jsonb,
        'video', ''
    ),
    10,
    5
FROM sub_skills ss
WHERE ss.sub_skill_name = '发力基础'
ON CONFLICT DO NOTHING;

-- Unit 2: 小臂摆动练习 (practice)
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'practice',
    2,
    '小臂摆动练习',
    jsonb_build_object(
        'type', 'practice',
        'instructions', '# 钟摆式小臂练习

## 练习方法:
1. 标准入位姿势
2. 大臂保持静止(可以贴墙练习)
3. 只用小臂做前后摆动
4. 速度由慢到快,感受自然节奏

## 练习目标:
- 完成 **20次** 小臂摆动
- 保持大臂完全静止
- 摆动幅度逐渐增大
- 最后10次要有明显的加速感

## 自我检查:
- [ ] 大臂是否保持固定?
- [ ] 小臂摆动是否自然流畅?
- [ ] 肘关节是否作为唯一支点?
- [ ] 握杆是否保持放松?

## 常见错误:
- ❌ 大臂跟着动,整个手臂上下移动
- ❌ 小臂摆动僵硬,不够自然
- ❌ 摆动速度过快,失去控制

## 进阶要点:
- 慢速摆动时感受重力作用
- 快速摆动时体会惯性力量
- 击球瞬间手腕自然向前送',
        'demo_video', '',
        'success_criteria', jsonb_build_object(
            'type', 'repetitions',
            'target', 20
        )
    ),
    20,
    15
FROM sub_skills ss
WHERE ss.sub_skill_name = '发力基础'
ON CONFLICT DO NOTHING;

-- Unit 3: 力量渐进训练 (practice)
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'practice',
    3,
    '力量渐进训练',
    jsonb_build_object(
        'type', 'practice',
        'instructions', '# 渐进式力量控制练习

## 练习设置:
在台面上放置3个目标区域:
- 近距离区(1个球位)
- 中距离区(2个球位)
- 远距离区(3个球位)

## 练习方法:
1. 从近距离开始,轻力击打白球
2. 让白球滚到近距离区停下
3. 逐步增加力量,到达中距离区
4. 最后用较大力量,到达远距离区

## 练习目标:
- 每个区域各成功 **5次**
- 总计15次成功控制
- 体会不同力量等级的发力感觉

## 力量等级参考:
- **轻力**(1级):小臂轻轻向前送
- **中力**(3级):小臂自然摆动
- **重力**(5级):小臂快速摆动+手腕释放

## 自我检查:
- [ ] 能否精准控制白球停位?
- [ ] 不同力量是否有明显区别?
- [ ] 发力是否保持流畅?

## 关键要点:
轻力靠"送",重力靠"甩"',
        'demo_video', '',
        'success_criteria', jsonb_build_object(
            'type', 'custom',
            'description', '3个距离区各成功5次,共15次'
        )
    ),
    20,
    15
FROM sub_skills ss
WHERE ss.sub_skill_name = '发力基础'
ON CONFLICT DO NOTHING;

-- Unit 4: 发力准确性测试 (challenge)
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'challenge',
    4,
    '发力准确性测试',
    jsonb_build_object(
        'type', 'challenge',
        'description', '# 发力控制综合挑战

## 挑战说明:

完成三个不同难度的发力测试,验证对力量的精准控制能力。

### 挑战一:定点停球(轻力)
- 用最轻的力量击打白球
- 让白球在1个球位内停下
- 连续成功 **5次**

### 挑战二:中距离控制(中力)
- 击打白球到达台面中央
- 停球位置误差不超过半个球
- 连续成功 **5次**

### 挑战三:远距离精准(重力)
- 击打白球到达对面短边
- 白球反弹后停在台面中央区域
- 连续成功 **3次**

## 通过标准:
- 三个挑战全部完成
- 轻、中、重力量都能精准控制
- 总时间不超过12分钟

## 评分标准:
- 🌟🌟🌟 12分钟内完成所有挑战
- 🌟🌟 15分钟内完成所有挑战
- 🌟 18分钟内完成所有挑战

## 失败后建议:
- 复习"小臂摆动练习"找回发力感觉
- 加强"力量渐进训练"提升控制力
- 每个力量等级单独练习直到稳定',
        'success_criteria', jsonb_build_object(
            'type', 'custom',
            'description', '完成三项挑战,展现对轻、中、重力量的精准控制'
        ),
        'hints', jsonb_build_array(
            '轻力击球:小臂轻送,手腕不发力',
            '中力击球:小臂自然摆,节奏均匀',
            '重力击球:快速摆臂+手腕瞬间释放'
        ),
        'demo_video', ''
    ),
    30,
    20
FROM sub_skills ss
WHERE ss.sub_skill_name = '发力基础'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Sub-skill 4: 五分点理论 - 3个训练单元
-- ============================================================================

-- Unit 1: 五分点系统解析 (theory)
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'theory',
    1,
    '五分点系统解析',
    jsonb_build_object(
        'type', 'theory',
        'text', '# 什么是五分点?

## 核心概念

五分点是将白球表面分为5个击球点的系统,每个点产生不同的击球效果。这是台球控制的基础。

## 五分点分布

将白球从上到下垂直分为5个点:

```
    ①  上旋点(高杆) - 白球前进
    ②  中上点(推杆) - 白球前进
    ③  中心点(定杆) - 白球原地
    ④  中下点(缩杆) - 白球后退
    ⑤  下旋点(低杆) - 白球后退
```

## 各点效果详解

### ① 上旋点(高杆)
- **位置**:白球上方1/3处
- **效果**:白球向前追随目标球
- **应用**:需要白球前进走位时使用

### ② 中上点(推杆)
- **位置**:白球上方1/6处
- **效果**:白球略微前进
- **应用**:最常用的击球点

### ③ 中心点(定杆)⭐
- **位置**:白球正中心
- **效果**:白球原地不动或微动
- **应用**:需要白球停在原位时使用

### ④ 中下点(缩杆)
- **位置**:白球下方1/6处
- **效果**:白球略微后退
- **应用**:需要白球后退一点距离

### ⑤ 下旋点(低杆)
- **位置**:白球下方1/3处
- **效果**:白球快速后退
- **应用**:需要白球大幅后退时使用

## 定杆(中心点)的重要性

掌握中心点击球是五分点系统的基础:
- ✅ 最容易控制的击球点
- ✅ 出杆要求最低
- ✅ 是定杆马拉松的核心技能

## 学习顺序建议

1. **先掌握定杆**(中心点)
2. 练习推杆(中上点)
3. 学习缩杆(中下点)
4. 最后挑战高杆和低杆',
        'images', '[]'::jsonb,
        'video', ''
    ),
    10,
    5
FROM sub_skills ss
WHERE ss.sub_skill_name = '五分点理论'
ON CONFLICT DO NOTHING;

-- Unit 2: 五分点基础练习 (practice)
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'practice',
    2,
    '五分点基础练习',
    jsonb_build_object(
        'type', 'practice',
        'instructions', '# 五分点识别与击打练习

## 练习方法:

### 第一步:识别五分点
1. 在白球上贴上5个小标记(可用可擦笔)
2. 从上到下标记①②③④⑤
3. 熟悉每个点的位置

### 第二步:依次击打
1. 从中心点③开始练习(最简单)
2. 击打后观察白球的运动轨迹
3. 依次练习其他4个点

## 练习目标:
- 每个击球点各练习 **8次**
- 总计40次击球
- 熟悉每个点产生的效果

## 观察要点:

### 击打中心点③(定杆)
- 白球应该原地旋转,几乎不前进
- 如果白球前进 → 击球点偏高
- 如果白球后退 → 击球点偏低

### 击打中上点②(推杆)
- 白球应该向前滚动
- 注意前进距离不要太远

### 击打中下点④(缩杆)
- 白球应该向后移动
- 后退距离应该可控

## 自我检查:
- [ ] 能否准确找到每个击球点?
- [ ] 不同击球点的效果是否明显?
- [ ] 出杆是否保持笔直?

## 成功标志:
击打中心点时,白球能稳定地原地旋转',
        'demo_video', '',
        'success_criteria', jsonb_build_object(
            'type', 'repetitions',
            'target', 40
        )
    ),
    20,
    15
FROM sub_skills ss
WHERE ss.sub_skill_name = '五分点理论'
ON CONFLICT DO NOTHING;

-- Unit 3: 定杆马拉松挑战 (challenge)
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    'challenge',
    3,
    '定杆马拉松挑战',
    jsonb_build_object(
        'type', 'challenge',
        'description', '# 定杆马拉松:连续20颗挑战

## 挑战说明:

这是"定杆马拉松"的入门挑战。目标是连续击打白球中心点(③),让白球保持在原位,挑战连续成功次数。

## 挑战规则:

### 基础规则
1. 将白球放在台面中央
2. 每次击打白球中心点
3. 白球位移不超过半个球直径
4. 连续击打,挑战最高记录

### 成功标准
- **⭐ 入门级**:连续成功 **10次**
- **⭐⭐ 熟练级**:连续成功 **15次**
- **⭐⭐⭐ 大师级**:连续成功 **20次**

### 失败条件
- 白球位移超过半个球直径
- 出杆明显不笔直
- 击球点偏离中心过多

## 评分说明:

| 连续次数 | 评级 | 说明 |
|---------|------|------|
| 20+ | 🏆 大师 | 完美掌握定杆技术 |
| 15-19 | 🥇 熟练 | 定杆技术稳定 |
| 10-14 | 🥈 入门 | 基本掌握定杆 |
| < 10 | 🥉 练习 | 需要更多练习 |

## 技巧提示:
- 保持呼吸平稳,不要紧张
- 每次击球前都要重新瞄准
- 发力要稳定,不要忽轻忽重
- 失败后不要气馁,从头开始

## 失败后建议:
- 如果经常打偏上或偏下:复习"五分点识别"
- 如果白球左右偏移:回顾"笔直出杆"章节
- 如果力量不稳定:复习"发力控制"章节

## 长期目标:
这个挑战没有上限!
- 30次:业余高手
- 50次:准专业水平
- 100次:职业级定杆能力',
        'success_criteria', jsonb_build_object(
            'type', 'custom',
            'description', '连续成功击打中心点20次,白球位移不超过半个球直径'
        ),
        'hints', jsonb_build_array(
            '放松心态,定杆比你想象的简单',
            '击球点比力量更重要,准确第一',
            '保持节奏一致,不要越打越快'
        ),
        'demo_video', ''
    ),
    30,
    20
FROM sub_skills ss
WHERE ss.sub_skill_name = '五分点理论'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 验证导入结果
-- ============================================================================

SELECT
    '导入完成统计' as info,
    COUNT(*) as total_units,
    SUM(CASE WHEN unit_type = 'theory' THEN 1 ELSE 0 END) as theory_units,
    SUM(CASE WHEN unit_type = 'practice' THEN 1 ELSE 0 END) as practice_units,
    SUM(CASE WHEN unit_type = 'challenge' THEN 1 ELSE 0 END) as challenge_units
FROM training_units;

-- 按子技能分组显示训练单元
SELECT
    ss.sub_skill_name,
    ts.skill_name,
    tl.title as level_title,
    COUNT(tu.id) as unit_count,
    string_agg(tu.title, ' | ' ORDER BY tu.unit_order) as units
FROM sub_skills ss
JOIN training_skills ts ON ss.skill_id = ts.id
JOIN training_levels tl ON ts.level_id = tl.id
LEFT JOIN training_units tu ON ss.id = tu.sub_skill_id
GROUP BY ss.id, ss.sub_skill_name, ts.skill_name, tl.title, tl.level_number, ts.skill_order, ss.sub_skill_order
ORDER BY tl.level_number, ts.skill_order, ss.sub_skill_order;
