# 🔧 修复数据库连接池问题

## 问题诊断

**错误信息：**
```
MaxClientsInSessionMode: max clients reached - in Session mode max clients are limited to pool_size
```

**根本原因：**
Supabase Session Pooler的默认pool_size太小（通常为1-2），无法支持Vercel serverless的并发请求。

**当前配置：**
- ✅ server/db.ts已正确配置max: 1
- ✅ prepare: false已启用
- ❌ Supabase Session Pooler的pool_size不足

---

## 解决方案

### 方案1：增加Supabase Session Pooler大小（推荐）

1. **登录Supabase Dashboard**
   - 访问：https://supabase.com/dashboard

2. **进入项目设置**
   - 选择你的项目
   - 点击左侧 `Settings` → `Database`

3. **配置Session Pooler**
   - 找到 `Connection Pooling` 部分
   - 查看 `Session Mode` 配置
   - 将 `Pool Size` 增加到 **10-15**

4. **更新Vercel环境变量（如果连接字符串改变）**
   - Vercel Dashboard → Project → Settings → Environment Variables
   - 确认 `DATABASE_URL` 使用Session Pooler格式：
     ```
     postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres
     ```

5. **触发Vercel重新部署**
   - 不需要改代码，只需推送任意commit
   - 或在Vercel Dashboard手动触发重新部署

---

### 方案2：添加数据库连接重试逻辑（临时缓解）

如果无法立即增加pool_size，可以添加重试逻辑：

**修改 server/auth.ts 的session store配置：**

```typescript
// 在 createSessionMiddleware() 函数中修改
const pgStore = connectPg(session);
store = new pgStore({
  conString: process.env.DATABASE_URL,
  createTableIfMissing: true,
  tableName: "sessions",
  ttl: SESSION_TTL_MS / 1000,

  // 添加这些配置
  errorLog: (err) => {
    console.error("Session store error:", err);
  },
  pruneSessionInterval: 60, // 每60秒清理过期session

  // 添加连接重试
  pool: {
    max: 1,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 10000,
  }
});
```

---

### 方案3：使用Transaction Pooler + 禁用Prepared Statements

⚠️ **不推荐**：Transaction Pooler不支持某些高级PostgreSQL特性。

---

## 快速验证

修复后，在Vercel Logs中应该看到：
- ✅ 不再出现 "MaxClientsInSessionMode" 错误
- ✅ `/api/auth/user` 返回200
- ✅ `/api/auth/migrate-login` 返回200

---

## 推荐操作步骤

1. **立即增加Supabase Session Pooler大小到10** （5分钟）
2. **推送一个空commit触发Vercel重新部署** （2分钟）
   ```bash
   git commit --allow-empty -m "chore: trigger redeployment after pool size increase"
   git push origin main
   ```
3. **等待部署完成并测试登录** （3分钟）

---

## 长期优化建议

- **监控连接池使用率**：在Supabase Dashboard查看连接数统计
- **优化session存储**：考虑使用Redis替代PostgreSQL存储session（Vercel KV）
- **添加健康检查**：在应用中添加database health check endpoint
