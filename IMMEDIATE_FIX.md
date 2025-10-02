# 🚀 立即修复 - 使用旧项目重置密钥

## 问题确认
- 项目 `hsfthqchyupkbmazcuis` **不存在**（curl返回404）
- 旧项目 `ksgksoeubyvkuwfpdhet` **仍然存在**
- Vercel 配置指向不存在的项目，导致网站崩溃

## 立即执行步骤（10分钟内恢复）

### 步骤 1: 在旧项目中重置密钥

1. 访问：https://supabase.com/dashboard/project/ksgksoeubyvkuwfpdhet
2. 进入：**Settings** → **API**
3. 找到 **Service Role Key** 部分
4. 点击 **"Reset"** 或 **"Regenerate"** 按钮
5. 复制**新的** Service Role Key

### 步骤 2: 获取完整的项目凭证

在同一页面（Settings → API）复制：

```
Project URL: https://ksgksoeubyvkuwfpdhet.supabase.co
Anon/Public Key: eyJhbGc...（新的 anon key）
Service Role Key: eyJhbGc...（刚刚重置的新 service_role key）
```

### 步骤 3: 获取数据库连接字符串

1. 进入：**Settings** → **Database**
2. 找到 **Connection String** → **URI**
3. 选择 **"Session pooler"** 或 **"Direct connection"**
4. 复制完整的连接字符串，应该类似：
   ```
   postgresql://postgres:[password]@db.ksgksoeubyvkuwfpdhet.supabase.co:5432/postgres
   ```
5. **重要**：密码部分显示为 `[YOUR-PASSWORD]`，需要：
   - 点击 **"Reset database password"** 生成新密码
   - 或者使用您已知的数据库密码

### 步骤 4: 更新 Vercel 环境变量

1. 访问：https://vercel.com/dashboard
2. 选择项目 "yesheyball"
3. 进入：**Settings** → **Environment Variables**

**更新以下 4 个变量（Production 环境）：**

```bash
VITE_SUPABASE_URL
https://ksgksoeubyvkuwfpdhet.supabase.co

VITE_SUPABASE_ANON_KEY
[步骤2中复制的新 anon key]

SUPABASE_SERVICE_ROLE_KEY
[步骤2中复制的新 service_role key]

DATABASE_URL
postgresql://postgres:[您的密码]@db.ksgksoeubyvkuwfpdhet.supabase.co:5432/postgres?sslmode=require
```

5. 点击每个变量旁边的 **"Edit"**
6. 粘贴新值
7. 点击 **"Save"**

### 步骤 5: 触发重新部署

在 Vercel：
1. 进入 **Deployments** 标签
2. 点击最新部署右侧的 **"..."**
3. 选择 **"Redeploy"**
4. 勾选 **"Use existing Build Cache"** (可选，更快)
5. 点击 **"Redeploy"**

等待 2-3 分钟，网站应该恢复正常！

---

## 验证修复成功

1. 等待 Vercel 部署完成（状态显示 "Ready"）
2. 访问：https://yesheyball.vercel.app
3. 尝试登录
4. 应该看到正常的登录页面，不再有数据库连接错误

---

## 本地环境更新

同时更新您的本地 `.env.local` 文件：

```bash
# .env.local
VITE_SUPABASE_URL=https://ksgksoeubyvkuwfpdhet.supabase.co
VITE_SUPABASE_ANON_KEY=[新的 anon key]
SUPABASE_SERVICE_ROLE_KEY=[新的 service_role key]
DATABASE_URL=postgresql://postgres:[密码]@db.ksgksoeubyvkuwfpdhet.supabase.co:5432/postgres?sslmode=require
```

---

## 重要说明

### GitHub Secret Scanning 警报
- 由于我们重置了密钥，旧的泄露密钥已失效
- GitHub 的警报应该会自动消失
- 如果警报仍然存在，可以在 GitHub 仓库的 Security 标签中手动关闭

### 数据安全
- 旧项目中的数据完整保留
- 用户不需要重新注册
- 所有训练记录都还在

### Git 历史
- 我们已经清理了 Git 历史，泄露的密钥已从仓库中移除
- 即使有人访问旧的 Git 提交，也找不到密钥

---

## 如果仍然有问题

如果完成上述步骤后网站仍然报错：

1. 检查 Vercel Runtime Logs 查看新的错误信息
2. 确认所有 4 个环境变量都已正确更新
3. 确认数据库密码正确（可以在 Supabase SQL Editor 中测试连接）

---

**完成这些步骤后，请告诉我结果！**
