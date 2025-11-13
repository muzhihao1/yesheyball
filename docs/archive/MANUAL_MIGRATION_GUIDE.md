# 手动数据库迁移指南

## 问题描述
生产环境缺少每日目标系统所需的数据库表：
- `goal_templates` (目标模板表)
- `user_daily_goals` (用户每日目标表)

## 解决方案

### 方法 1: 通过 Supabase Dashboard (推荐 ⭐)

1. **打开 Supabase Dashboard**
   - 访问: https://supabase.com/dashboard
   - 选择项目: waytoheyball

2. **进入 SQL Editor**
   - 左侧菜单 → SQL Editor
   - 点击 "New query"

3. **复制并执行以下 SQL**

```sql
-- ============================================
-- Migration: Create Daily Goals System Tables
-- Date: 2025-11-09
-- ============================================

-- Create goal_templates table
CREATE TABLE IF NOT EXISTS goal_templates (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'EASY',
  reward_xp INTEGER NOT NULL DEFAULT 10,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create user_daily_goals table
CREATE TABLE IF NOT EXISTS user_daily_goals (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  goal_template_id INTEGER NOT NULL REFERENCES goal_templates(id),
  date TIMESTAMP NOT NULL,
  target_value INTEGER NOT NULL,
  current_value INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_daily_goals_user_id ON user_daily_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_goals_date ON user_daily_goals(date);
CREATE INDEX IF NOT EXISTS idx_user_daily_goals_completed ON user_daily_goals(is_completed);
CREATE INDEX IF NOT EXISTS idx_goal_templates_active ON goal_templates(active);

-- Add comments
COMMENT ON TABLE goal_templates IS 'Reusable daily goal template definitions';
COMMENT ON TABLE user_daily_goals IS 'User-specific daily goal instances with progress tracking';

COMMENT ON COLUMN goal_templates.type IS 'Goal type: SESSION_COUNT, TOTAL_DURATION, MIN_RATING';
COMMENT ON COLUMN goal_templates.difficulty IS 'Goal difficulty: EASY, MEDIUM, HARD';
COMMENT ON COLUMN user_daily_goals.target_value IS 'Target value to complete the goal (e.g., 2 sessions, 20 minutes)';
COMMENT ON COLUMN user_daily_goals.current_value IS 'Current progress towards target';
```

4. **点击 "Run" 执行 SQL**

5. **验证表创建成功**

```sql
-- 检查表是否存在
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('goal_templates', 'user_daily_goals');
```

预期结果：应该返回 2 行数据（两个表名）

---

### 方法 2: 通过 psql 命令行 (高级用户)

如果你有 PostgreSQL 客户端工具：

```bash
# 连接到数据库 (替换为你的实际连接字符串)
psql "postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# 粘贴上面的 SQL 并执行
```

---

## 执行后的下一步操作

### 1. 初始化目标模板数据

```bash
curl -X POST https://waytoheyball.com/api/admin/init-goal-templates
```

**预期响应**:
```json
{
  "inserted": 8,
  "message": "Successfully initialized 8 goal templates"
}
```

### 2. 验证成就系统 (应该已经初始化)

```bash
curl -X POST https://waytoheyball.com/api/admin/init-achievements
```

**预期响应**:
```json
{
  "inserted": 0,
  "skipped": 20,
  "message": "Achievements already initialized. Found 20 existing achievements."
}
```

### 3. 测试每日目标 API

```bash
# 需要登录后获取 cookie，然后:
curl -X GET https://waytoheyball.com/api/goals/daily \
  -H "Cookie: your-session-cookie"
```

**预期响应**: 3个每日目标的 JSON 数组

---

## 验证清单

执行完 migration 后，请逐项验证：

- [ ] `goal_templates` 表已创建
- [ ] `user_daily_goals` 表已创建
- [ ] 4个索引已创建
- [ ] 初始化API返回成功 (8个模板)
- [ ] 前端页面可以显示每日目标面板
- [ ] 完成训练后目标进度更新

---

## 常见问题

### Q: 执行 SQL 时报错 "relation already exists"
**A**: 正常！说明表已经存在。可以跳过此步骤。

### Q: 初始化 API 返回 "relation does not exist"
**A**: 表未创建成功。重新检查 SQL 执行结果，确保没有错误。

### Q: 前端看不到每日目标面板
**A**:
1. 检查浏览器控制台是否有 API 错误
2. 验证 `/api/goals/daily` 端点是否返回数据
3. 确保已登录（需要认证）

---

## 联系支持

如果遇到无法解决的问题：
1. 查看 Supabase Logs (Dashboard → Logs)
2. 查看 Vercel Function Logs
3. 检查浏览器 Network 标签的 API 调用详情

**技术文档**:
- `docs/QUICK_TEST_GUIDE.md` - 快速测试指南
- `docs/deployment_verification.md` - 完整部署验证清单
