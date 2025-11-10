# Fu Jiajun V2.1 Training System - SQL执行指南

**状态**: ✅ 所有SQL脚本已修复完成，准备导入数据
**最后更新**: 2025-01-10
**执行人**: 开发团队

---

## ✅ 已完成的准备工作

### 1. V2.1核心表结构 (已创建)
- ✅ `training_levels` - 训练等级表
- ✅ `training_skills` - 技能表
- ✅ `sub_skills` - 子技能表
- ✅ `training_units` - 训练单元表
- ✅ `user_training_progress` - 用户进度表

### 2. SQL脚本修复 (已完成)
所有SQL脚本已修复以下问题：
- ✅ 修复UUID类型匹配 (`user_training_progress.user_id` → uuid)
- ✅ 修复表名引用 (`skills` → `training_skills`)
- ✅ 所有脚本使用事务包装 (BEGIN/COMMIT)
- ✅ 所有脚本幂等性设计 (ON CONFLICT DO NOTHING)

---

## 📋 SQL脚本执行顺序

### 步骤1: 导入Level 4-8技能数据 (前置条件)
**重要**: 必须先在 `training_skills` 表中创建Level 4-8对应的技能记录。

如果技能记录不存在，执行以下SQL：

```sql
-- 插入Level 4-8技能
INSERT INTO training_skills (level_id, skill_name, skill_order, description)
SELECT
    tl.id,
    'Rod Technique',
    1,
    '杆法技术 - 掌握低杆、高杆等基础杆法'
FROM training_levels tl
WHERE tl.level_number = 4
ON CONFLICT DO NOTHING;

INSERT INTO training_skills (level_id, skill_name, skill_order, description)
SELECT
    tl.id,
    'Position Play',
    1,
    '走位技术 - 学习走位规划与清台思路'
FROM training_levels tl
WHERE tl.level_number = 5
ON CONFLICT DO NOTHING;

INSERT INTO training_skills (level_id, skill_name, skill_order, description)
SELECT
    tl.id,
    'English Technique',
    1,
    '加塞技术 - 掌握傅家俊5分点加塞法'
FROM training_levels tl
WHERE tl.level_number = 6
ON CONFLICT DO NOTHING;

INSERT INTO training_skills (level_id, skill_name, skill_order, description)
SELECT
    tl.id,
    'Advanced Skills',
    1,
    '高级技术 - 掌握特殊技术和精进瞄准'
FROM training_levels tl
WHERE tl.level_number = 7
ON CONFLICT DO NOTHING;

INSERT INTO training_skills (level_id, skill_name, skill_order, description)
SELECT
    tl.id,
    'Competition Mindset',
    1,
    '竞技心态 - 系统训练与心态培养'
FROM training_levels tl
WHERE tl.level_number = 8
ON CONFLICT DO NOTHING;
```

**验证技能是否创建成功**:
```sql
SELECT
    ts.skill_name,
    tl.level_number,
    tl.title
FROM training_skills ts
JOIN training_levels tl ON ts.level_id = tl.id
WHERE tl.level_number BETWEEN 4 AND 8
ORDER BY tl.level_number;
```

预期结果：5行数据 (Level 4-8各有1个技能)

---

### 步骤2: 创建子技能 (10个子技能)

执行文件: `sql/11_create_subskills_level4_8.sql`

**在Supabase SQL Editor中执行**:
1. 打开 `sql/11_create_subskills_level4_8.sql`
2. 复制全部内容
3. 粘贴到Supabase SQL Editor
4. 点击 "Run"

**预期输出**:
```
NOTICE: ===========================================
NOTICE: Level 4-8 子技能创建验证
NOTICE: ===========================================
NOTICE: Level 4 (杆法技术): 2 个子技能
NOTICE: Level 5 (走位技术): 2 个子技能
NOTICE: Level 6 (加塞技术): 2 个子技能
NOTICE: Level 7 (高级技术): 2 个子技能
NOTICE: Level 8 (竞技心态): 2 个子技能
NOTICE: -------------------------------------------
NOTICE: 总计: 10 个子技能
NOTICE: ===========================================
NOTICE: ✅ 子技能创建成功！
```

**子技能列表**:
- Level 4: 低杆与高杆控制, 分离角原理与应用
- Level 5: 基础走位技术, 清台思路初探
- Level 6: 加塞瞄准与走位, 实战清台提升
- Level 7: 特殊技术掌握, 瞄准技术精进
- Level 8: 系统化日常训练, 竞技心态培养

---

### 步骤3: 导入训练单元 (33个训练单元)

按顺序执行以下5个SQL文件：

#### 3.1 Level 4训练单元 (8个单元)
**文件**: `sql/06_insert_level4_8_units.sql`
**内容**: 杆法技术训练单元
- 低杆三级进阶 (theory)
- 中低杆定位练习 (practice)
- 高杆走位控制 (practice)
- 杆法综合练习 (challenge)
- 分离角原理详解 (theory)
- 力量与分离角配合 (practice)
- 杆法对分离角的影响 (practice)
- 实战走位应用 (challenge)

**执行**: 复制全部内容到Supabase SQL Editor → Run

---

#### 3.2 Level 5训练单元 (8个单元)
**文件**: `sql/07_insert_level5_units.sql`
**内容**: 走位技术训练单元
- 走位的三种方式 (theory)
- 不吃库直接走位 (practice)
- 一库反弹走位 (practice)
- 多库走位技巧 (practice)
- 走位综合练习 (challenge)
- 清台基础思路 (theory)
- 简单球型清台实战 (practice)
- 复杂局面分析 (challenge)

**执行**: 复制全部内容到Supabase SQL Editor → Run

---

#### 3.3 Level 6训练单元 (6个单元)
**文件**: `sql/08_insert_level6_units.sql`
**内容**: 加塞技术训练单元
- 加塞原理与身位调整 (theory)
- **5分点加塞瞄准** (practice) ⭐ Fu Jiajun Signature
- 顺塞与反塞走位 (practice)
- 加塞综合应用 (challenge)
- 中高级清台演练 (practice)
- 实战清台考核 (challenge)

**执行**: 复制全部内容到Supabase SQL Editor → Run

---

#### 3.4 Level 7训练单元 (6个单元)
**文件**: `sql/09_insert_level7_units.sql`
**内容**: 高级技术训练单元
- 角度球精准瞄准 (practice)
- 中袋球特训 (practice)
- 特殊球型技术 (practice)
- 极限高球瞄准 (practice)
- 瞄准锁定技术 (practice)
- 高级技术综合测试 (challenge)

**执行**: 复制全部内容到Supabase SQL Editor → Run

---

#### 3.5 Level 8训练单元 (5个单元)
**文件**: `sql/10_insert_level8_units.sql`
**内容**: 竞技心态训练单元
- 日常热身系统 (theory)
- 肌肉激活套路 (practice)
- 节奏训练法 (practice)
- 比赛心态训练 (practice)
- **大师综合运用** (challenge) ⭐ Final Master Test

**执行**: 复制全部内容到Supabase SQL Editor → Run

---

## ✅ 数据验证 (执行完成后)

### 验证1: 训练单元总数
```sql
SELECT
    COUNT(*) as total_units,
    COUNT(*) FILTER (WHERE unit_type = 'theory') as theory_count,
    COUNT(*) FILTER (WHERE unit_type = 'practice') as practice_count,
    COUNT(*) FILTER (WHERE unit_type = 'challenge') as challenge_count
FROM training_units;
```

**预期结果**:
- `total_units`: 33 (或更多，如果Level 1-3也有单元)
- `theory_count`: 5
- `practice_count`: 20
- `challenge_count`: 8

### 验证2: 各级别训练单元数量
```sql
SELECT
    tl.level_number,
    tl.title as level_title,
    ts.skill_name,
    COUNT(tu.id) as unit_count
FROM training_levels tl
JOIN training_skills ts ON ts.level_id = tl.id
JOIN sub_skills ss ON ss.skill_id = ts.id
JOIN training_units tu ON tu.sub_skill_id = ss.id
WHERE tl.level_number BETWEEN 4 AND 8
GROUP BY tl.level_number, tl.title, ts.skill_name
ORDER BY tl.level_number;
```

**预期结果**:
| level_number | level_title | skill_name | unit_count |
|--------------|-------------|------------|------------|
| 4 | 技巧进阶 | 杆法技术 | 8 |
| 5 | 战术运用 | 走位技术 | 8 |
| 6 | 实战演练 | 加塞技术 | 6 |
| 7 | 综合提升 | 高级技术 | 6 |
| 8 | 大师之境 | 竞技心态 | 5 |

### 验证3: XP奖励总计
```sql
SELECT
    tl.level_number,
    SUM(tu.xp_reward) as total_xp,
    AVG(tu.estimated_minutes) as avg_minutes
FROM training_units tu
JOIN sub_skills ss ON tu.sub_skill_id = ss.id
JOIN training_skills ts ON ss.skill_id = ts.id
JOIN training_levels tl ON ts.level_id = tl.id
WHERE tl.level_number BETWEEN 4 AND 8
GROUP BY tl.level_number
ORDER BY tl.level_number;
```

**预期结果**:
| level_number | total_xp | avg_minutes |
|--------------|----------|-------------|
| 4 | 160 | 21.25 |
| 5 | 160 | 20.63 |
| 6 | 130 | 22.50 |
| 7 | 130 | 22.50 |
| 8 | 100 | 28.00 |

**Total XP (Level 4-8)**: 680 XP

### 验证4: 子技能关联检查
```sql
SELECT
    ts.skill_name,
    ss.sub_skill_name,
    COUNT(tu.id) as units_per_subskill
FROM training_skills ts
JOIN sub_skills ss ON ss.skill_id = ts.id
LEFT JOIN training_units tu ON tu.sub_skill_id = ss.id
WHERE ts.skill_name IN ('杆法技术', '走位技术', '加塞技术', '高级技术', '竞技心态')
GROUP BY ts.skill_name, ss.sub_skill_name
ORDER BY ts.skill_name, ss.sub_skill_order;
```

**预期结果**: 每个子技能应该有训练单元关联（units_per_subskill > 0）

### 验证5: JSONB内容完整性
```sql
SELECT
    tu.title,
    tu.content ? 'theory' as has_theory,
    tu.content ? 'steps' as has_steps,
    tu.content ? 'tips' as has_tips,
    tu.content ? 'common_mistakes' as has_mistakes,
    tu.content ? 'practice_requirements' as has_requirements,
    tu.content ? 'success_criteria' as has_criteria,
    tu.content ? 'related_courses' as has_courses
FROM training_units tu
JOIN sub_skills ss ON tu.sub_skill_id = ss.id
JOIN training_skills ts ON ss.skill_id = ts.id
WHERE ts.skill_name IN ('杆法技术', '走位技术', '加塞技术', '高级技术', '竞技心态')
LIMIT 5;
```

**预期结果**: 所有字段应为 `true` (表示JSONB内容完整)

---

## 🎯 执行成功标准

完成所有步骤后，应满足以下条件：

- ✅ 5个V2.1核心表已创建
- ✅ 10个子技能已导入 (Level 4-8各2个)
- ✅ 33个训练单元已导入 (Level 4=8, 5=8, 6=6, 7=6, 8=5)
- ✅ 所有训练单元包含完整JSONB内容
- ✅ 总计680 XP可用 (Level 4-8)
- ✅ 所有外键关系完整无误
- ✅ 无SQL错误或约束冲突

---

## 🔄 回滚方法 (如需重新导入)

### 完全回滚 (删除所有V2.1数据)
```sql
-- 删除训练单元 (会自动删除依赖的数据)
DELETE FROM training_units
WHERE sub_skill_id IN (
    SELECT ss.id FROM sub_skills ss
    JOIN training_skills ts ON ss.skill_id = ts.id
    WHERE ts.skill_name IN ('杆法技术', '走位技术', '加塞技术', '高级技术', '竞技心态')
);

-- 删除子技能
DELETE FROM sub_skills
WHERE skill_id IN (
    SELECT id FROM training_skills
    WHERE skill_name IN ('杆法技术', '走位技术', '加塞技术', '高级技术', '竞技心态')
);

-- 删除技能
DELETE FROM training_skills
WHERE skill_name IN ('杆法技术', '走位技术', '加塞技术', '高级技术', '竞技心态');
```

### 删除V2.1核心表 (慎用，会删除所有V2.1数据)
```sql
DROP TABLE IF EXISTS user_training_progress CASCADE;
DROP TABLE IF EXISTS training_units CASCADE;
DROP TABLE IF EXISTS sub_skills CASCADE;
DROP TABLE IF EXISTS training_skills CASCADE;
DROP TABLE IF EXISTS training_levels CASCADE;
DROP TABLE IF EXISTS specialized_training_plans CASCADE;
DROP TABLE IF EXISTS specialized_trainings CASCADE;
```

---

## 📊 数据统计总结

### Level 4-8 训练单元分布
| Level | 技能名称 | 单元数 | XP总计 | 预计总时长 |
|-------|----------|--------|--------|-----------|
| 4 | 杆法技术 | 8 | 160 | 170分钟 |
| 5 | 走位技术 | 8 | 160 | 165分钟 |
| 6 | 加塞技术 | 6 | 130 | 135分钟 |
| 7 | 高级技术 | 6 | 130 | 135分钟 |
| 8 | 竞技心态 | 5 | 100 | 140分钟 |
| **总计** | **5技能** | **33** | **680** | **745分钟** |

### 单元类型分布
- **Theory (理论)**: 5个单元 × 10 XP = 50 XP
- **Practice (练习)**: 20个单元 × 20 XP = 400 XP
- **Challenge (挑战)**: 8个单元 × 30 XP = 240 XP

---

## 📚 相关文档

- `docs/LEVEL_4_8_DESIGN.md` - Level 4-8训练单元设计文档
- `docs/LEVEL_5_8_DESIGN_CONTINUED.md` - Level 5-8延续设计
- `docs/SQL_GENERATION_COMPLETE.md` - SQL生成完成报告
- `docs/FU_JIAJUN_INTEGRATION_PLAN.md` - 傅家俊V2.1总体规划

---

## 🎉 下一步: 前端开发

数据导入完成后，可以开始：

1. **重构 `tasks.tsx` → `fu-training.tsx`**
   - 展示Level 4-8系统训练路径
   - 显示33个训练单元卡片
   - 实现进度追踪

2. **创建 `targeted-practice.tsx`**
   - AI推荐薄弱环节练习
   - 基于用户历史数据的智能推荐

3. **实现新增API接口**
   - `GET /api/training-units?level=X` - 获取特定级别训练单元
   - `GET /api/training-units/recommended` - AI推荐训练单元
   - `GET /api/training-units/weak-points` - 用户薄弱环节分析

---

**生成日期**: 2025-01-10
**作者**: AI Assistant (Claude Code)
**项目**: WayToHeyball - Fu Jiajun V2.1 Integration
