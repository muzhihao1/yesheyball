# SQL执行指南 - 十大招系统建立

## 📋 执行概览

本指南用于在Supabase中执行3个SQL文件，建立完整的十大招（Ten Core Skills）系统。

**执行时间**: 预计5-10分钟
**依赖关系**: 必须按顺序执行（26 → 27 → 28）
**数据库**: Supabase PostgreSQL (Session Pooler)

---

## ⚠️ 执行前准备

### 1. 确认环境
- [ ] 已登录Supabase Dashboard
- [ ] 选择正确的项目（waytoheyball生产环境）
- [ ] 进入SQL Editor页面

### 2. 备份建议
虽然这些SQL都是CREATE和INSERT操作（非破坏性），但建议：
- [ ] 记录当前表数量: \`SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';\`
- [ ] 记录当前ninety_day_curriculum结构: \`\\d ninety_day_curriculum\`

### 3. 检查依赖表
确认以下表已存在（V2.1之前已创建）：
\`\`\`sql
-- 快速检查
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'ninety_day_curriculum', 'user_ninety_day_progress');
\`\`\`

**预期结果**: 应返回3行（users, ninety_day_curriculum, user_ninety_day_progress）

---

## 📝 执行步骤

### 第1步: 创建十大招核心表结构

**文件**: \`sql/26_create_ten_core_skills_system.sql\`

**执行方式**:
1. 在Supabase SQL Editor中新建查询
2. 复制整个sql/26文件内容
3. 点击"Run"执行
4. 等待执行完成（约10-15秒）

**预期结果**:
- 成功创建8个新表
- 成功创建8个索引
- 无错误信息

**验证命令**:
\`\`\`sql
-- 验证8个新表都已创建
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'skills',
    'sub_skills',
    'training_units',
    'specialized_trainings',
    'specialized_training_plans',
    'plan_unit_mappings',
    'user_skill_progress',
    'user_unit_completions'
)
ORDER BY table_name;
\`\`\`

**预期验证结果**: 应返回8行表名

---

### 第2步: 建立90天课程与十大招的关联

**文件**: \`sql/27_link_90days_to_skills.sql\`

**执行方式**:
1. 在Supabase SQL Editor中新建查询
2. 复制整个sql/27文件内容
3. 点击"Run"执行
4. 等待执行完成（约5秒）

**预期结果**:
- ninety_day_curriculum表新增2个字段
- 创建curriculum_day_units关联表
- 所有90天都自动映射到对应的skill_id

**验证命令**:
\`\`\`sql
-- 验证自动映射结果
SELECT
    tencore_skill_id,
    MIN(day_number) as start_day,
    MAX(day_number) as end_day,
    COUNT(*) as day_count
FROM ninety_day_curriculum
WHERE tencore_skill_id IS NOT NULL
GROUP BY tencore_skill_id
ORDER BY tencore_skill_id;
\`\`\`

**预期验证结果**: 应返回10行（skill_1到skill_10），共90天

---

### 第3步: 插入第一招完整示例数据

**文件**: \`sql/28_insert_skill_1_data.sql\`

**执行方式**:
1. 在Supabase SQL Editor中新建查询
2. 复制整个sql/28文件内容
3. 点击"Run"执行
4. 等待执行完成（约3秒）

**预期结果**:
- 插入1条skill记录（skill_1: 基本功）
- 插入3条sub_skill记录
- 插入9条training_unit记录

**验证命令**:
\`\`\`sql
-- 验证数据已插入
SELECT COUNT(*) FROM skills WHERE id = 'skill_1';
SELECT COUNT(*) FROM sub_skills WHERE skill_id = 'skill_1';
SELECT COUNT(*) FROM training_units WHERE sub_skill_id LIKE 'sub_skill_1_%';
\`\`\`

**预期验证结果**: 1个skill, 3个sub_skills, 9个training_units

---

## ✅ 最终验证

执行完所有3个SQL后，运行以下综合验证查询：

\`\`\`sql
SELECT
    '技能数量' as metric, COUNT(*)::text as value FROM skills
UNION ALL
SELECT
    '子技能数量' as metric, COUNT(*)::text as value FROM sub_skills
UNION ALL
SELECT
    '训练单元数量' as metric, COUNT(*)::text as value FROM training_units
UNION ALL
SELECT
    '90天已映射数' as metric, COUNT(*)::text as value
FROM ninety_day_curriculum WHERE tencore_skill_id IS NOT NULL;
\`\`\`

**预期最终结果**:
- 技能数量: 1
- 子技能数量: 3
- 训练单元数量: 9
- 90天已映射数: 90

---

## 🎯 成功标准

- [x] 8个核心表创建成功
- [x] 1个关联表创建成功
- [x] 所有90天都已映射到skill_id
- [x] skill_1（基本功）的完整数据已插入
- [x] 所有JSONB字段格式正确

---

## 🚀 下一步工作

执行完这3个SQL后，需要继续：

1. 更新\`shared/schema.ts\`，添加新表的TypeScript类型定义
2. 在\`server/storage.ts\`中添加新方法
3. 在\`server/routes.ts\`中添加新API路由
4. 创建前端TanStack Query hooks
5. 重构\`/levels\`页面

---

**文档版本**: 1.0
**创建日期**: 2025-01-13
