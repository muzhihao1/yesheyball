# SQL Generation Guide for Level 4-8 Training Units

## 当前进度

### 已完成
✅ **内容设计**: 所有50个训练单元的详细JSONB内容已完成
  - Level 4: 8单元 (LEVEL_4_8_DESIGN.md)
  - Level 5-8: 25单元 (LEVEL_5_8_DESIGN_CONTINUED.md)

✅ **SQL模板**: Level 4的8个单元SQL已生成 (sql/06_insert_level4_8_units.sql)

### 待完成
⏭️ Level 5-8的SQL生成 (42个单元)

## SQL生成策略

由于SQL文件过大（预计15,000+行），建议采用以下策略之一：

### 策略A: 分批SQL文件（推荐）
将50个单元分为5个SQL文件：
- `06_insert_level4_units.sql` - Level 4 (8 units) ✅ 已完成
- `07_insert_level5_units.sql` - Level 5 (8 units)
- `08_insert_level6_units.sql` - Level 6 (6 units)
- `09_insert_level7_units.sql` - Level 7 (6 units)
- `10_insert_level8_units.sql` - Level 8 (5 units)

**优点**:
- 文件大小可控（每个2000-3000行）
- 可以分批导入测试
- 出错时易于定位和修复
- Git版本控制更友好

### 策略B: 使用脚本生成SQL
创建Node.js/Python脚本自动从Markdown文档生成SQL：
1. 解析 LEVEL_4_8_DESIGN.md 和 LEVEL_5_8_DESIGN_CONTINUED.md
2. 提取每个单元的JSONB内容
3. 套用SQL模板自动生成INSERT语句
4. 生成完整的SQL文件

**优点**:
- 自动化，减少人工错误
- 易于维护和更新
- 可以生成验证脚本

## SQL模板结构

每个训练单元的SQL INSERT遵循以下格式：

```sql
-- Unit X: 单元标题 (单元类型)
INSERT INTO training_units (sub_skill_id, unit_type, unit_order, title, content, xp_reward, estimated_minutes)
SELECT
    ss.id,
    '单元类型',  -- 'theory' | 'practice' | 'challenge'
    单元顺序,
    '单元标题',
    jsonb_build_object(
        'theory', '理论内容...',
        'steps', ARRAY['步骤1', '步骤2', ...],
        'tips', ARRAY['提示1', '提示2', ...],
        'common_mistakes', ARRAY['错误1', '错误2', ...],
        'practice_requirements', '练习要求',
        'success_criteria', '过关标准',
        'related_courses', ARRAY[课程编号1, 课程编号2]
    ),
    经验值,  -- theory:10, practice:20, challenge:30
    预计时长  -- 分钟
FROM sub_skills ss
JOIN skills s ON ss.skill_id = s.id
WHERE s.skill_name = '技能名称' AND ss.sub_skill_name = '子技能名称'
ON CONFLICT DO NOTHING;
```

## Level 5-8 子技能映射

### Level 5: 战术运用 - 走位与布局
**技能名称**: `走位技术`

#### 子技能 5.1: 基础走位技术 (5单元)
- WHERE条件: `s.skill_name = '走位技术' AND ss.sub_skill_name = '基础走位技术'`
- Unit 1-5: 走位的三种方式、不吃库直接走位、一库反弹走位、多库走位技巧、走位综合练习

#### 子技能 5.2: 清台思路初探 (3单元)
- WHERE条件: `s.skill_name = '走位技术' AND ss.sub_skill_name = '清台思路初探'`
- Unit 6-8: 清台基础思路、简单球型清台实战、复杂局面分析

### Level 6: 实战演练 - 加塞与清台
**技能名称**: `加塞技术`

#### 子技能 6.1: 加塞瞄准与走位 (4单元)
- WHERE条件: `s.skill_name = '加塞技术' AND ss.sub_skill_name = '加塞瞄准与走位'`
- Unit 1-4: 加塞原理与身位调整、5分点加塞瞄准、顺塞与反塞走位、加塞综合应用

#### 子技能 6.2: 实战清台提升 (2单元)
- WHERE条件: `s.skill_name = '加塞技术' AND ss.sub_skill_name = '实战清台提升'`
- Unit 5-6: 中高级清台演练、实战清台考核

### Level 7: 综合提升 - 高级技能
**技能名称**: `高级技术`

#### 子技能 7.1: 特殊技术掌握 (3单元)
- WHERE条件: `s.skill_name = '高级技术' AND ss.sub_skill_name = '特殊技术掌握'`
- Unit 1-3: 角度球精准瞄准、中袋球特训、特殊球型技术

#### 子技能 7.2: 瞄准技术精进 (3单元)
- WHERE条件: `s.skill_name = '高级技术' AND ss.sub_skill_name = '瞄准技术精进'`
- Unit 4-6: 极限高球瞄准、瞄准锁定技术、高级技术综合测试

### Level 8: 大师之境 - 思路与心态
**技能名称**: `竞技心态`

#### 子技能 8.1: 系统化日常训练 (3单元)
- WHERE条件: `s.skill_name = '竞技心态' AND ss.sub_skill_name = '系统化日常训练'`
- Unit 1-3: 日常热身系统、肌肉激活套路、节奏训练法

#### 子技能 8.2: 竞技心态培养 (2单元)
- WHERE条件: `s.skill_name = '竞技心态' AND ss.sub_skill_name = '竞技心态培养'`
- Unit 4-5: 比赛心态训练、大师综合运用

## 数据库前置条件

在执行SQL导入前，确保数据库已有以下数据：

1. ✅ **training_levels** - 8个训练等级
2. ✅ **skills** - 10大技能
3. ⚠️ **sub_skills** - Level 4-8的子技能需要先创建

### 需要创建的子技能

```sql
-- Level 4 子技能
INSERT INTO sub_skills (skill_id, sub_skill_name, sub_skill_order, description)
SELECT id, '低杆与高杆控制', 1, '掌握低杆和高杆的击球技术'
FROM skills WHERE skill_name = '杆法技术';

INSERT INTO sub_skills (skill_id, sub_skill_name, sub_skill_order, description)
SELECT id, '分离角原理与应用', 2, '理解90度分离角原理并应用于实战'
FROM skills WHERE skill_name = '杆法技术';

-- Level 5 子技能
INSERT INTO sub_skills (skill_id, sub_skill_name, sub_skill_order, description)
SELECT id, '基础走位技术', 1, '掌握三种基础走位方式'
FROM skills WHERE skill_name = '走位技术';

INSERT INTO sub_skills (skill_id, sub_skill_name, sub_skill_order, description)
SELECT id, '清台思路初探', 2, '学习清台的基本思路和方法'
FROM skills WHERE skill_name = '走位技术';

-- Level 6 子技能
INSERT INTO sub_skills (skill_id, sub_skill_name, sub_skill_order, description)
SELECT id, '加塞瞄准与走位', 1, '掌握傅家俊5分点加塞瞄准法'
FROM skills WHERE skill_name = '加塞技术';

INSERT INTO sub_skills (skill_id, sub_skill_name, sub_skill_order, description)
SELECT id, '实战清台提升', 2, '在实战中应用加塞技术提升清台能力'
FROM skills WHERE skill_name = '加塞技术';

-- Level 7 子技能
INSERT INTO sub_skills (skill_id, sub_skill_name, sub_skill_order, description)
SELECT id, '特殊技术掌握', 1, '掌握角度球、中袋球等特殊技术'
FROM skills WHERE skill_name = '高级技术';

INSERT INTO sub_skills (skill_id, sub_skill_name, sub_skill_order, description)
SELECT id, '瞄准技术精进', 2, '精进瞄准技术，包括极限高球和瞄准锁定'
FROM skills WHERE skill_name = '高级技术';

-- Level 8 子技能
INSERT INTO sub_skills (skill_id, sub_skill_name, sub_skill_order, description)
SELECT id, '系统化日常训练', 1, '建立系统的日常训练习惯'
FROM skills WHERE skill_name = '竞技心态';

INSERT INTO sub_skills (skill_id, sub_skill_name, sub_skill_order, description)
SELECT id, '竞技心态培养', 2, '培养比赛心态和大师风范'
FROM skills WHERE skill_name = '竞技心态';
```

## 执行顺序

1. 创建子技能 (上述SQL)
2. 导入Level 4训练单元 (`06_insert_level4_units.sql`) ✅
3. 导入Level 5训练单元 (`07_insert_level5_units.sql`)
4. 导入Level 6训练单元 (`08_insert_level6_units.sql`)
5. 导入Level 7训练单元 (`09_insert_level7_units.sql`)
6. 导入Level 8训练单元 (`10_insert_level8_units.sql`)
7. 验证数据完整性

## 验证SQL模板

每个级别导入后执行验证：

```sql
-- 验证 Level X 单元数量
DO $$
DECLARE
    unit_count INTEGER;
    expected_count INTEGER := 预期数量;  -- Level 4:8, Level 5:8, Level 6:6, Level 7:6, Level 8:5
BEGIN
    SELECT COUNT(*) INTO unit_count
    FROM training_units tu
    JOIN sub_skills ss ON tu.sub_skill_id = ss.id
    JOIN skills s ON ss.skill_id = s.id
    WHERE s.skill_name = '技能名称';

    IF unit_count = expected_count THEN
        RAISE NOTICE 'Level X 导入成功: % 个单元', unit_count;
    ELSE
        RAISE WARNING 'Level X 导入不完整: 期望 %, 实际 %', expected_count, unit_count;
    END IF;
END $$;

-- 验证JSONB结构完整性
SELECT
    tu.title,
    tu.content ? 'theory' AS has_theory,
    tu.content ? 'steps' AS has_steps,
    tu.content ? 'tips' AS has_tips,
    tu.content ? 'common_mistakes' AS has_mistakes,
    tu.content ? 'practice_requirements' AS has_requirements,
    tu.content ? 'success_criteria' AS has_criteria,
    tu.content ? 'related_courses' AS has_courses
FROM training_units tu
JOIN sub_skills ss ON tu.sub_skill_id = ss.id
JOIN skills s ON ss.skill_id = s.id
WHERE s.skill_name = '技能名称'
ORDER BY tu.unit_order;
```

## 下一步行动

### 选项1: 手动完成剩余SQL（预计4-6小时）
按照Level 4的模板，逐个转换Level 5-8的单元内容到SQL

### 选项2: 使用脚本生成（推荐）
1. 编写Markdown解析脚本
2. 自动生成SQL文件
3. 批量执行导入

### 选项3: 分阶段导入
1. 先完成Level 4-6（22个单元）- 核心技术
2. 测试前端集成
3. 再完成Level 7-8（12个单元）- 高级技术

## 注意事项

1. **JSONB字符串转义**: 确保理论内容中的单引号正确转义
2. **数组格式**: `ARRAY['item1', 'item2']` 每个元素需要单引号
3. **课程映射**: `related_courses` 数组使用课程编号（1-52）
4. **ON CONFLICT**: 使用 `ON CONFLICT DO NOTHING` 避免重复导入
5. **事务控制**: 建议每个级别使用独立事务，便于回滚

## 参考文档

- 内容来源: `LEVEL_4_8_DESIGN.md`, `LEVEL_5_8_DESIGN_CONTINUED.md`
- SQL模板: `sql/06_insert_level4_8_units.sql`
- 课程映射: `FU_JIAJUN_INTEGRATION_PLAN.md`
