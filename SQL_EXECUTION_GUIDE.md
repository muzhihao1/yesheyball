# 📋 90天课程映射SQL执行指南

**状态更新**: ✅ Login API修复成功！

---

## 🎯 执行计划

由于生产数据库**没有training_programs表**，我创建了**简化版SQL脚本**，直接更新`ninety_day_curriculum`表。

### 方案对比

| 原方案 (❌ 失败) | 新方案 (✅ 推荐) |
|-----------------|----------------|
| 依赖training_programs表 | 不依赖任何外部表 |
| 需要创建training_days表 | 直接更新ninety_day_curriculum |
| 需要外键关联 | 基于original_course_ref字段 |
| 3个SQL文件 | 2个SQL文件（分阶段） |

---

## 📝 执行步骤

### Step 1: 测试阶段 - 映射前17天 🧪

执行文件：`sql/15_simplified_map_52_episodes.sql`

**这个脚本会做什么**:
- 更新`ninety_day_curriculum`表的前17天记录
- 添加52集课程的详细description、objectives、key_points
- 基于existing `original_course_ref`字段（例如："第1集"）
- 包含验证查询，立即看到结果

**在Supabase SQL Editor中执行**:
```sql
-- 复制粘贴 sql/15_simplified_map_52_episodes.sql 的全部内容
-- 点击 "Run" 执行
```

**预期结果**:
```
更新验证 | total_updated: 17 | has_episode_ref: 17
```

**检查映射结果**:
SQL脚本末尾会自动显示更新后的前17天内容，包括：
- 天数
- 对应集数
- 标题
- 简介
- 训练目标数
- 关键要点数

✅ **如果结果正确，继续Step 2**

---

### Step 2: 完整映射 - 所有90天 🚀

执行文件：`sql/15_complete_map_52_episodes.sql`

**这个脚本会做什么**:
- 更新所有90天的详细信息
- 覆盖所有10个十大招技能
- 部分集数会重复使用（用于技能强化）
- 最后90天包含综合复习内容

**映射策略**:

| 天数范围 | 十大招技能 | 对应集数 | 重点内容 |
|---------|----------|---------|---------|
| 1-10    | 技能1    | 第1-7集  | 基础技术（握杆、手架、站位、节奏、瞄准） |
| 11-20   | 技能2    | 第8-14集 | 力量控制与穿透力 |
| 21-30   | 技能3    | 第15-23集 | 高级瞄准技术 |
| 31-40   | 技能4    | 第24-28集 | 分离角与走位技术 |
| 41-50   | 技能5-6  | 第29-33集 | 加塞技术（顺塞、反塞） |
| 51-60   | 技能7    | 第34-42集 | 实战清台训练 |
| 61-70   | 技能8-9  | 第43-49集 | 清台思路与肌肉激活 |
| 71-80   | 技能10   | 第50-51集 | 节奏训练（循环） |
| 81-90   | 综合     | 第52集+复习 | 综合运用+关键技术复习 |

**在Supabase SQL Editor中执行**:
```sql
-- 复制粘贴 sql/15_complete_map_52_episodes.sql 的全部内容
-- 点击 "Run" 执行
```

**预期结果**:
```
映射统计:
- total_days: 90
- updated_days: 90
- update_rate: 100%
```

---

## ✅ 验证清单

### 数据库验证

执行以下查询检查映射结果：

```sql
-- 1. 检查总体映射率
SELECT
    COUNT(*) as total_days,
    COUNT(CASE WHEN description LIKE '%第%集%' OR description LIKE '%训练%' THEN 1 END) as mapped_days,
    ROUND(COUNT(CASE WHEN description LIKE '%第%集%' OR description LIKE '%训练%' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100, 1) || '%' as mapping_rate
FROM ninety_day_curriculum;

-- 2. 检查每个技能的映射情况
SELECT
    ts.skill_name,
    COUNT(*) as total_days,
    COUNT(CASE WHEN ndc.description LIKE '%第%集%' OR ndc.description LIKE '%训练%' THEN 1 END) as mapped_days
FROM ninety_day_curriculum ndc
LEFT JOIN tencore_skills ts ON ndc.tencore_skill_id = ts.id
GROUP BY ts.skill_name, ts.skill_number
ORDER BY ts.skill_number;

-- 3. 查看具体某一天的详细内容
SELECT
    day_number,
    original_course_ref,
    title,
    description,
    objectives,
    key_points
FROM ninety_day_curriculum
WHERE day_number = 1; -- 可以修改天数查看不同内容
```

### 前端显示验证

1. 访问 https://waytoheyball.com/tasks
2. 查看90天课程内容
3. 检查是否显示详细的训练说明
4. 验证objectives和key_points是否正确显示

---

## 🔍 故障排查

### 问题1: SQL执行报错

**可能原因**:
- `ninety_day_curriculum`表不存在
- `tencore_skills`表不存在
- 字段类型不匹配

**解决方案**:
```sql
-- 检查表是否存在
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN ('ninety_day_curriculum', 'tencore_skills');

-- 检查字段类型
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'ninety_day_curriculum'
    AND column_name IN ('description', 'objectives', 'key_points');
```

### 问题2: objectives/key_points字段类型错误

如果遇到类型转换错误，可能需要修改SQL：

```sql
-- 原：ARRAY[...]::jsonb
-- 改为：'["item1", "item2"]'::jsonb
```

### 问题3: 部分天数未映射

**检查哪些天数未映射**:
```sql
SELECT
    day_number,
    title,
    original_course_ref,
    CASE
        WHEN description LIKE '%第%集%' OR description LIKE '%训练%' THEN '✅ 已映射'
        ELSE '❌ 未映射'
    END as mapping_status
FROM ninety_day_curriculum
WHERE NOT (description LIKE '%第%集%' OR description LIKE '%训练%')
ORDER BY day_number;
```

---

## 🎓 技术说明

### 为什么不使用training_days表？

1. **生产环境约束**: Supabase生产数据库没有`training_programs`表
2. **简化架构**: 直接在`ninety_day_curriculum`存储完整信息，减少JOIN查询
3. **更好的性能**: 避免外键关联，查询更快
4. **易于维护**: 数据自包含，不依赖外部表

### 数据冗余vs性能

**Trade-off决策**:
- ✅ **冗余存储**: description, objectives, key_points在90天表中直接存储
- ✅ **查询性能**: 单表查询，无需JOIN
- ✅ **灵活性**: 可以针对每一天微调内容
- ⚠️ **存储空间**: 增加约100KB（90天 × ~1KB/天）

对于这个应用规模，**性能优先**是正确的选择。

### original_course_ref字段

这个字段在`ninety_day_curriculum`表中已存在，格式：
- "第1集"
- "第2集"
- ...
- "第52集"

虽然我们没有使用这个字段作为查询条件（因为存在重复映射），但它作为**文档引用**保留，便于理解课程来源。

---

## 📊 完成后的数据结构

### ninety_day_curriculum表（更新后）

| 字段 | 类型 | 更新前 | 更新后 |
|-----|------|--------|--------|
| day_number | INTEGER | 1-90 | ✅ 保持不变 |
| title | VARCHAR | 简短标题 | ✅ 保持不变 |
| description | TEXT | 简单描述 | ✅ **详细的训练说明** |
| original_course_ref | VARCHAR | "第X集" | ✅ 保持不变 |
| objectives | JSONB | [] | ✅ **[目标1, 目标2, ...]** |
| key_points | JSONB | [] | ✅ **[要点1, 要点2, ...]** |

---

## 🎯 下一步开发建议

### 前端UI更新

1. **展示详细内容**:
```typescript
// 在tasks.tsx中显示objectives和key_points
<div className="space-y-2">
  <h4 className="font-semibold">训练目标：</h4>
  <ul className="list-disc pl-5">
    {curriculum.objectives.map((obj, i) => (
      <li key={i}>{obj}</li>
    ))}
  </ul>

  <h4 className="font-semibold">关键要点：</h4>
  <ul className="list-disc pl-5">
    {curriculum.key_points.map((point, i) => (
      <li key={i}>{point}</li>
    ))}
  </ul>
</div>
```

2. **添加视频播放功能**:
- 基于`original_course_ref`显示对应视频
- 后续可以添加`video_url`字段

3. **训练进度追踪**:
- 记录用户完成了哪些objectives
- 显示key_points的掌握情况

---

## 📞 需要帮助？

如果遇到问题：
1. 检查Supabase SQL Editor的详细错误信息
2. 运行故障排查部分的诊断SQL
3. 查看表结构是否匹配

---

**最后更新**: 2025-11-12
**Commit**: `8b7e289` - "feat(v2.1): create simplified 90-day mapping SQL"
🤖 Generated with Claude Code
