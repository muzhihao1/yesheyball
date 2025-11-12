# 🔧 修复Login API错误 - Session Store连接池问题

## 问题诊断

**错误信息：**
```
MaxClientsInSessionMode: max clients reached - in Session mode max clients are limited to pool_size
```

**根本原因：**
1. Supabase Session Pooler pool_size = 15 ✅（已确认）
2. **server/auth.ts** 中 `connect-pg-simple` 创建了**独立的连接池**
3. 默认情况下，connect-pg-simple 的连接池大小未限制，可能达到10+
4. Drizzle ORM 连接池：max = 1
5. 在Vercel serverless高并发下：**Session Store池(~10) + Drizzle池(1) > 15** → 超过Supabase限制

---

## 解决方案：限制Session Store连接池大小

修改 `server/auth.ts` 的session store配置，添加 `pool` 选项：

### 修改位置：server/auth.ts 第78-83行

**原代码：**
```typescript
store = new pgStore({
  conString: process.env.DATABASE_URL,
  createTableIfMissing: true,
  tableName: "sessions",
  ttl: SESSION_TTL_MS / 1000,
});
```

**修改后：**
```typescript
store = new pgStore({
  conString: process.env.DATABASE_URL,
  createTableIfMissing: true,
  tableName: "sessions",
  ttl: SESSION_TTL_MS / 1000,

  // 🔧 关键修复：限制session store的连接池大小
  pool: {
    max: 2,                      // 最大连接数：2（用于serverless环境）
    idleTimeoutMillis: 20000,    // 空闲超时20秒
    connectionTimeoutMillis: 10000, // 连接超时10秒
  },

  // 🔧 添加错误日志
  errorLog: (err: any) => {
    console.error("Session store error:", err);
  },

  // 🔧 定期清理过期session（可选）
  pruneSessionInterval: 60, // 每60秒清理一次过期session
});
```

---

## 配置说明

### 为什么设置 max: 2？
- **Vercel Serverless**: 每个请求是独立的serverless function
- **Session Store**: 需要1个连接用于读取session，可能需要1个备用连接
- **Drizzle ORM**: max: 1（用于业务逻辑）
- **总连接数**: 2 (session) + 1 (drizzle) = **3 << 15** ✅

### pool配置项解释：
- `max: 2` - 最大连接数，限制session store最多使用2个连接
- `idleTimeoutMillis: 20000` - 空闲连接20秒后自动关闭
- `connectionTimeoutMillis: 10000` - 连接超时时间10秒

### 额外选项：
- `errorLog` - 捕获session store错误并记录日志
- `pruneSessionInterval` - 定期清理过期session，减少数据库负担

---

## 实施步骤

1. **修改代码**
   ```bash
   # 编辑 server/auth.ts
   # 在 pgStore 配置中添加 pool 选项（见上面的修改代码）
   ```

2. **提交并推送**
   ```bash
   git add server/auth.ts
   git commit -m "fix(auth): limit session store connection pool to 2 for serverless"
   git push origin main
   ```

3. **等待Vercel自动部署**（约2-3分钟）

4. **测试登录功能**
   - 访问 https://waytoheyball.com
   - 尝试登录
   - 检查 Vercel Logs 确认没有 "MaxClientsInSessionMode" 错误

---

## 验证成功的标志

✅ 登录成功返回 200
✅ `/api/auth/user` 返回用户信息
✅ Vercel Logs 中没有连接池错误
✅ 多次刷新页面不会触发连接池耗尽

---

## 备选方案（如果还有问题）

### 方案B：使用MemoryStore（仅用于调试）

如果还有问题，可以暂时切换到内存存储来排除session store问题：

```typescript
// 临时禁用PostgreSQL session store
// store = new pgStore({ ... });
store = new session.MemoryStore();
console.warn("⚠️  Using MemoryStore - sessions will not persist across deployments");
```

**注意**：MemoryStore在serverless环境下会导致session在每次部署后丢失，仅用于调试。

---

## 技术细节

### connect-pg-simple 默认行为：
- 不配置 `pool` 时，会创建默认的 `pg.Pool`
- 默认 `pg.Pool` 的 `max` 值通常是 **10**
- 这解释了为什么即使Supabase pool_size=15，还是会超限

### Serverless环境特性：
- 每个请求可能是全新的serverless instance
- 连接池需要在每个instance中重新建立
- 高并发时，多个instance同时创建连接会快速耗尽Supabase pool

### 为什么Drizzle设置max=1就够了：
- Drizzle连接池用于业务逻辑查询
- Serverless环境下，每个请求生命周期很短
- 1个连接足够处理单个请求的所有业务逻辑

---

## 长期优化建议

1. **迁移到Vercel KV (Redis)** - 更适合serverless的session存储
2. **监控连接池使用情况** - 添加Prometheus/Datadog监控
3. **实施连接池健康检查** - 定期检测连接池状态
4. **考虑使用JWT** - 减少对数据库session的依赖

---

## 参考文档

- [connect-pg-simple Pool Configuration](https://github.com/voxpelli/node-connect-pg-simple#pool-options)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Vercel Serverless Functions Best Practices](https://vercel.com/docs/functions/serverless-functions)
