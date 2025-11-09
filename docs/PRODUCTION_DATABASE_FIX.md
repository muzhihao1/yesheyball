# 生产环境数据库修复指南

## 🚨 当前问题

生产环境 (https://waytoheyball.com) 缺少每日目标系统所需的数据库表：
- ❌ `goal_templates` - 不存在
- ❌ `user_daily_goals` - 不存在
- ✅ `achievements` - 已存在并正常工作 (20 个成就)

## ✅ 解决方案

### 选项 1: Vercel SQL Editor (推荐 ⭐ 最快)

如果使用 Vercel Postgres:

1. **登录 Vercel Dashboard**
   ```
   https://vercel.com/dashboard
   ```

2. **进入项目 Storage**
   - 选择 waytoheyball 项目
   - 点击 "Storage" 标签
   - 选择 Postgres 数据库

3. **打开 Query Editor**
   - 点击 "Query" 或 "SQL Editor"

4. **执行以下 SQL**

```sql
-- ============================================
-- 创建每日目标系统表
-- ============================================

-- 创建 goal_templates 表
CREATE TABLE IF NOT EXISTS goal_templates (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'EASY',
  reward_xp INTEGER NOT NULL DEFAULT 10,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 创建 user_daily_goals 表
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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_daily_goals_user_id ON user_daily_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_goals_date ON user_daily_goals(date);
CREATE INDEX IF NOT EXISTS idx_user_daily_goals_completed ON user_daily_goals(is_completed);
CREATE INDEX IF NOT EXISTS idx_goal_templates_active ON goal_templates(active);
```

5. **验证表创建成功**

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('goal_templates', 'user_daily_goals');
```

预期结果：返回 2 行

---

### 选项 2: Supabase SQL Editor

如果使用 Supabase Postgres:

1. **登录 Supabase Dashboard**
   ```
   https://supabase.com/dashboard
   ```

2. **选择正确的项目**
   - 确认是 waytoheyball 的生产数据库项目
   - **注意**: 必须是包含 `users`, `training_sessions`, `achievements` 表的项目

3. **进入 SQL Editor**
   - 左侧菜单 → "SQL Editor"
   - 点击 "+ New query"

4. **执行上面的 SQL**
   - 复制完整的 SQL 脚本
   - 点击 "Run"

---

### 选项 3: psql 命令行

如果你有 PostgreSQL 客户端：

```bash
# 1. 获取生产数据库连接字符串
# 从 Vercel Dashboard → Settings → Environment Variables
# 或 Supabase Dashboard → Settings → Database

# 2. 连接数据库
psql "YOUR_PRODUCTION_DATABASE_URL"

# 3. 执行 SQL
\i migrations/create_daily_goals_tables.sql

# 4. 验证
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('goal_templates', 'user_daily_goals');
```

---

## 📝 执行后的下一步

### Step 1: 初始化目标模板数据

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

### Step 2: 验证成就系统 (应该已经OK)

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

### Step 3: 测试每日目标 API

需要登录后测试：

```bash
# 登录后获取 session cookie，然后：
curl -X GET https://waytoheyball.com/api/goals/daily \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE"
```

**预期响应**: 3个每日目标的 JSON 数组

---

## 🧪 完整功能测试

参考 `docs/QUICK_TEST_GUIDE.md` 执行以下测试：

1. ✅ 数据库表创建
2. ✅ 目标模板初始化
3. ⏳ 登录系统
4. ⏳ 查看每日目标面板
5. ⏳ 完成训练
6. ⏳ 验证目标进度更新
7. ⏳ 验证成就解锁

---

## 🔍 故障排查

### 问题: "relation already exists"
**原因**: 表已经存在
**解决**: 跳过此步骤，直接执行初始化 API

### 问题: "permission denied"
**原因**: 数据库用户权限不足
**解决**: 使用 postgres 超级用户或 owner 角色执行

### 问题: "cannot create foreign key"
**原因**: `users` 表不存在
**解决**: 确认连接到正确的数据库（应该有 users 表）

### 问题: API 返回 500 错误
**原因**: 表结构不完整或索引缺失
**解决**: 检查 Vercel Function Logs:
```
Vercel Dashboard → Deployments → [最新部署] → Functions
```

---

## 📊 验证清单

执行完所有步骤后，确认：

- [ ] `goal_templates` 表存在
- [ ] `user_daily_goals` 表存在
- [ ] 4 个索引创建成功
- [ ] 初始化 API 返回 "8 templates"
- [ ] 前端显示每日目标面板
- [ ] 训练后目标进度更新
- [ ] 成就系统正常工作

---

## 🚀 快速修复命令

如果你有 Vercel CLI 和数据库访问权限：

```bash
# 1. 进入项目目录
cd /Users/liasiloam/Vibecoding/1MyProducts/waytoheyball

# 2. 执行 migration (需要正确的 DATABASE_URL)
npx tsx -e "
import { db } from './server/db.ts';
import { sql } from 'drizzle-orm';

await db.execute(sql\`
  CREATE TABLE IF NOT EXISTS goal_templates (...);
  CREATE TABLE IF NOT EXISTS user_daily_goals (...);
  -- 完整 SQL
\`);
console.log('Tables created successfully');
"

# 3. 初始化数据
curl -X POST https://waytoheyball.com/api/admin/init-goal-templates
```

---

## 📞 需要帮助？

如果修复后仍有问题：
1. 查看 Vercel Function Logs
2. 查看浏览器 Console (F12)
3. 检查 Network 标签的 API 调用
4. 参考 `docs/testing_report.md`

**下一步**: 完成修复后，执行 `docs/QUICK_TEST_GUIDE.md` 中的测试流程
