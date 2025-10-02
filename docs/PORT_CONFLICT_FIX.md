# Port 5000 Conflict - macOS AirPlay Receiver

## 问题

开发服务器无法启动，显示错误：
```
Error: listen EADDRINUSE: address already in use 0.0.0.0:5000
```

原因：macOS 的 **AirPlay Receiver** 服务占用了端口 5000。

## 解决方案（选择其一）

### 方案 1：关闭 AirPlay Receiver（推荐）

1. 打开 **系统设置** (System Settings)
2. 进入 **通用** (General) → **隔空播放接收器** (AirPlay Receiver)
3. 关闭 **隔空播放接收器** 开关
4. 重新运行 `npm run dev`

### 方案 2：使用其他端口

临时使用端口 3000 运行开发服务器：

```bash
PORT=3000 npm run dev
```

然后访问：`http://localhost:3000`

## 验证端口可用性

检查端口 5000 是否被占用：
```bash
lsof -i:5000
```

如果显示 `ControlCe` 进程，说明是 AirPlay Receiver。

## Supabase Auth 迁移测试指南

### 数据库迁移状态 ✅

已完成：
- ✅ 添加了 `supabase_user_id` 和 `migrated_to_supabase` 字段
- ✅ 创建了数据库索引
- ✅ 创建了自动同步触发器
- ✅ 当前状态：0个已迁移用户，2个待迁移用户

### 测试步骤

#### 1. 启动开发服务器

```bash
# 解决端口冲突后
npm run dev
```

服务器应该显示：
```
Connected to database successfully
Server running on http://localhost:5000
```

#### 2. 测试现有用户迁移（关键测试）

**准备工作：**
- 你需要2个现有用户之一的邮箱和密码
- 这些用户应该在数据库中有 `password_hash` 字段

**测试流程：**

1. 打开浏览器访问：`http://localhost:5000/login`
2. 输入现有用户的邮箱和密码
3. 点击"登录"

**期望结果：**
- ✅ 显示消息："账号已升级！Account upgraded to new authentication system"
- ✅ 成功跳转到 `/levels` 页面
- ✅ 查看服务器日志，应该看到：
  ```
  🔍 Attempting Supabase Auth login for: user@example.com
  🔄 Checking old system for: user@example.com
  🔐 Verifying old password for: user@example.com
  🚀 Migrating user user@example.com to Supabase Auth...
  🔗 Linking user@example.com to Supabase user ID: xxx-xxx-xxx
  ✅ Successfully migrated user@example.com to Supabase Auth
  ```

4. **第二次登录测试：**
   - 退出登录
   - 再次用相同账号登录
   - 期望结果：显示"登录成功！欢迎回来"（普通登录消息，不再迁移）

#### 3. 验证 Supabase Dashboard

1. 访问：https://supabase.com/dashboard/project/hsfthqchyupkbmazcuis
2. 导航到：**Authentication** → **Users**
3. 应该看到刚才迁移的用户
4. 导航到：**Table Editor** → **users**
5. 检查该用户的字段：
   - `supabase_user_id` 应该有值（UUID）
   - `migrated_to_supabase` 应该为 `true`
   - `password_hash` 应该为 `null`（已清除）

#### 4. 测试新用户注册

1. 访问：`http://localhost:5000/register`
2. 填写注册表单：
   - 邮箱：`test-new@example.com`
   - 名字：`Test`
   - 姓氏：`User`（可选）
   - 密码：`password123456`
   - 确认密码：`password123456`
3. 点击"注册"

**期望结果：**
- ✅ 显示："注册成功！您的账号已创建，请登录"
- ✅ 跳转到 `/login` 或 `/levels`
- ✅ 在 Supabase Dashboard → Authentication 中看到新用户
- ✅ 在 Supabase Dashboard → Table Editor → users 中看到自动创建的用户资料

#### 5. 验证迁移进度

在 Supabase SQL Editor 中运行：

```sql
SELECT
  COUNT(*) FILTER (WHERE migrated_to_supabase = true) as migrated_users,
  COUNT(*) FILTER (WHERE migrated_to_supabase = false) as pending_users,
  COUNT(*) as total_users
FROM public.users;
```

**期望结果（完成所有测试后）：**
- `migrated_users`: 1（或更多，取决于测试了多少用户）
- `pending_users`: 1（或更少）
- `total_users`: 3（2个原有 + 1个新注册）

### 常见问题排查

#### 问题：登录返回 401

**检查：**
1. 服务器日志中的具体错误信息
2. `.env.local` 是否包含所有 Supabase 凭证
3. 数据库迁移是否成功完成
4. 用户是否有 `password_hash` 字段

#### 问题：注册失败

**检查：**
1. 数据库触发器是否创建成功
2. Supabase Auth 是否已启用
3. 浏览器控制台的错误信息

#### 问题："Supabase Admin not configured"

**解决：**
1. 检查 `.env.local` 中的 `SUPABASE_SERVICE_ROLE_KEY`
2. 重启开发服务器：`npm run dev`

### 成功标准

迁移成功的标志：
- ✅ 数据库迁移 SQL 无错误执行
- ✅ 现有用户可以登录并看到"账号已升级"消息
- ✅ 第二次登录显示普通登录消息
- ✅ 新用户可以成功注册
- ✅ 所有用户在 Supabase Authentication 中可见
- ✅ 用户资料在 public.users 表中自动创建
- ✅ 所有用户数据（level, exp, streak等）保持完整

### 下一步

测试完成后：
1. ✅ 提交所有更改到 git
2. ✅ 部署到 Vercel 生产环境
3. ✅ 在生产环境进行相同测试
4. ✅ 监控生产环境的迁移进度

---

**当前阶段：** 等待端口冲突解决后开始测试
**预计时间：** 10-15分钟完成所有测试
