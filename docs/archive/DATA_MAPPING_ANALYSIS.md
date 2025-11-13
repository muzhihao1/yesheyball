# V2.1 数据映射分析 - "十大招"内容导入

**创建时间**: 2025-11-10
**状态**: 需要决策

---

## 🚨 关键问题：Schema与ROADMAP不匹配

### 问题描述

**ROADMAP V2定义**：
- **"十大招"训练系统** (10个招式)
  1. 基本功（2章节，10关卡）
  2. 发力（4关卡）
  3. 高效五分点（3关卡）
  4-10. 其他7个招式

**V2.1 Schema实现**：
- `training_levels` - 描述为"**8个训练关卡**"
- 设计为：level → skills → sub_skills → units

### 映射冲突

| ROADMAP概念 | 原计划映射 | Schema实际 | 冲突 |
|------------|----------|-----------|------|
| 十大招（10个） | training_levels | 8个levels | ❌ 数量不符 |
| 章节 (Episodes) | training_skills? | 不明确 | ❌ 概念缺失 |
| 关卡 (Stages) | training_units | 支持 | ✅ 匹配 |

---

## 💡 解决方案建议

### 方案A：重新解释"8个训练关卡"（推荐）

**假设**：`training_levels`不是指"十大招"，而是指**成长路径的8个等级**

**新映射**：
```
用户成长路径（8个等级）
  ├── Level 1: 新手入门
  ├── Level 2: 基础巩固
  ├── Level 3: 技巧提升
  ...
  └── Level 8: 大师级别

每个Level包含：
  ├── training_skills (对应"十大招"中的某几招)
  │   ├── Skill 1: 基本功
  │   ├── Skill 2: 发力
  │   └── ...
  └── sub_skills (章节细分)
      └── training_units (具体关卡：Theory/Drill/Challenge)
```

**优势**：
- ✅ 符合"耶氏台球成长路径"的8级系统
- ✅ 保留完整"十大招"内容
- ✅ 符合已有Schema设计

**实施**：
1. `training_levels` → 8个成长等级（新手→大师）
2. `training_skills` → "十大招"（每个Level分配若干招）
3. `sub_skills` → 章节 (Episodes)
4. `training_units` → 具体关卡 (Stages)

---

### 方案B：修改Schema增加层级

**如果坚持"Level = 招式"**，则需：
1. 修改`training_levels`为10个（skill_01 ~ skill_10）
2. 增加中间表`training_episodes`存储章节
3. 调整所有API和Storage层

**缺点**：
- ❌ 需要大量代码修改
- ❌ 已推送的Schema需要回滚
- ❌ 破坏已有8级成长路径设计

---

## 📊 推荐映射方案（方案A详细设计）

### 1. training_levels (8个成长等级)

| levelNumber | title | prerequisite | 包含的"招式" |
|------------|-------|-------------|-----------|
| 1 | 新手起步 | - | 基本功（第一招） |
| 2 | 力量觉醒 | Level 1 | 发力（第二招） |
| 3 | 精准之道 | Level 2 | 高效五分点（第三招）+ 准度（第四招） |
| 4 | 技巧进阶 | Level 3 | 杆法（第五招）+ 分离角（第六招） |
| 5 | 战术运用 | Level 4 | 走位（第七招） |
| 6 | 实战演练 | Level 5 | 轻松清蛇彩（第八招） |
| 7 | 综合提升 | Level 6 | 技能（第九招） |
| 8 | 大师之境 | Level 7 | 思路（第十招） |

### 2. training_skills (十大招)

```sql
-- 示例数据
INSERT INTO training_skills (id, level_id, skill_name, skill_order, description) VALUES
  ('uuid1', 'level_1_id', '基本功', 1, '台球的根基：手架、握杆、入位、姿势'),
  ('uuid2', 'level_2_id', '发力', 2, '掌握正确的发力技巧'),
  ('uuid3', 'level_3_id', '高效五分点', 3, '定杆马拉松核心技能'),
  ('uuid4', 'level_3_id', '准度', 4, '7种瞄准方法'),
  ...
```

### 3. sub_skills (章节细分)

```sql
-- 第一招"基本功"的两个章节
INSERT INTO sub_skills (id, skill_id, sub_skill_name, sub_skill_order, description) VALUES
  ('uuid_ep1', 'skill_基本功_id', '稳固的根基', 1, '手架、握杆、入位'),
  ('uuid_ep2', 'skill_基本功_id', '笔直的出杆', 2, '出杆姿势与稳定性');
```

### 4. training_units (具体关卡)

```sql
-- 第一招 > 第一章节 > 关卡
INSERT INTO training_units (id, sub_skill_id, unit_type, unit_order, title, content, xp_reward) VALUES
  (
    'uuid_unit1',
    'uuid_ep1',
    'theory',
    1,
    '万丈高楼平地起：认识四大动作',
    '{"type":"theory","text":"讲解手架、握杆、入位、姿势的重要性...","images":[],"video":""}',
    10
  ),
  (
    'uuid_unit2',
    'uuid_ep1',
    'practice',
    2,
    '手架：稳如泰山',
    '{"type":"practice","instructions":"凤眼式手架练习：手掌紧贴台面...","demo_video":"","success_criteria":{"type":"repetitions","target":5}}',
    20
  );
```

---

## 🔧 需要的额外信息

### 用户需要提供或确认：

1. **✅ 确认方案A的8级映射是否合理**
   - 8个成长等级的命名
   - 哪几招分配到哪个Level

2. **📝 前三招的详细内容**（优先级最高）
   - 第一招：基本功
     - 章节一：稳固的根基（5个关卡的具体内容）
     - 章节二：笔直的出杆（5个关卡的具体内容）
   - 第二招：发力（4个关卡内容）
   - 第三招：高效五分点（3个关卡内容）

3. **🎥 视频URL**（可选，目前可以留空）
   - 理论关卡的讲解视频
   - 练习关卡的示范视频

4. **📊 XP奖励规则**
   - 理论关卡：10 XP
   - 练习关卡：20 XP
   - 挑战关卡：30 XP
   - 或其他规则？

---

## 🚀 下一步行动

### 立即执行（需要用户决策）

1. **确认映射方案**：方案A（推荐）vs 方案B
2. **提供前三招内容**：文本描述、练习要求、挑战目标
3. **确认8个Level的命名和分配**

### 开发人员待执行

1. ✅ 编写数据导入脚本框架
2. ⏳ 等待用户提供内容后填充数据
3. ⏳ 运行导入脚本
4. ⏳ 验证API可以正确读取数据

---

**决策所需时间**: 5-10分钟
**数据导入预计时间**: 30分钟（内容就绪后）
