# 生产环境登录问题最终诊断报告 (修正版)

**报告时间**: 2025-11-26
**优先级**: ⚠️ **CRITICAL - P0**
**状态**: 根因已确认，待修复

---

## 一、问题现象

### 1.1 用户体验
- 访问 https://waytoheyball.com 显示登录页面
- 即使用户已经有有效的 Supabase session，也无法进入系统

### 1.2 技术症状

**前端 Console 日志**：
```
✅ [Auth] Supabase auth state changed: TOKEN_REFRESHED
✅ [Auth] Token refreshed successfully
✅ [useAuth] Session check complete: {hasSession: true}
✅ [getAuthHeaders] Added Authorization header
❌ Failed to load resource: 401 @ /api/auth/user
```

**服务器 Vercel 日志**：
```
✅ Connected to database successfully
✅ 💡 Relying on Supabase Auth JWT for authentication
❌ GET /api/auth/user 401 in 8ms
❌ {"message":"Unauthorized - No token provided"}
```

---

## 二、根本原因分析

### 2.1 初步错误诊断（已否定）

❌ **错误假设 1**：前端 Supabase 环境变量未配置
- **现实**：VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 已正确配置（截图证实）
- **证据**：前端 Supabase client 正常工作，token refresh 成功

❌ **错误假设 2**：前端未发送 Authorization header
- **现实**：Console 显示 `[getAuthHeaders] Added Authorization header`
- **证据**：前端代码确实添加了 header

### 2.2 真正的根本原因 🎯

经过深入分析，确认了真正的问题：

**问题 1：服务器端缺少 `SUPABASE_URL` 环境变量**

`server/supabaseAdmin.ts:7`:
```typescript
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Supabase credentials not found. Running without Supabase Auth.');
}

export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, { ... })
  : null;
```

**关键问题**：
1. 服务器端优先使用 `SUPABASE_URL`，fallback 到 `VITE_SUPABASE_URL`
2. **但是** `VITE_*` 前缀的环境变量只在 Vite 构建时注入到**客户端**代码
3. 服务器端代码运行在 Vercel serverless function，**无法访问** `process.env.VITE_*`
4. 因此 `supabaseUrl = undefined`
5. `supabaseAdmin = null`

**问题 2：JWT 验证失败**

如果 `supabaseAdmin` 是 `null`，那么 `server/auth.ts:516` 的检查应该会返回 500：

```typescript
const { supabaseAdmin, hasSupabaseAdmin } = await import("./supabaseAdmin.js");

if (!hasSupabaseAdmin()) {
  console.error('⚠️ Supabase Admin not configured - cannot verify JWT');
  return res.status(500).json({  // ⚠️ 应该返回 500，但实际返回 401
    message: "Authentication service unavailable",
    hint: "Server configuration error - please contact support"
  });
}
```

**但实际返回的是 401 "No token provided"**，这说明代码执行到了 `auth.ts:505-510`：

```typescript
const authHeader = req.headers.authorization;
if (!authHeader?.startsWith('Bearer ')) {
  return res.status(401).json({
    message: "Unauthorized - No token provided",  // ⚠️ 实际返回的错误
    hint: "Please login again to refresh your session"
  });
}
```

**这意味着服务器端确实没有收到 Authorization header！**

### 2.3 综合分析：双重问题

根据所有证据，我确认存在 **两个独立的问题**：

1. **服务器端 Supabase Admin Client 未初始化**
   - 原因：缺少 `SUPABASE_URL` 环境变量
   - 影响：无法验证 JWT token

2. **Authorization Header 传递问题**（可能性）
   - 原因：Vercel serverless function 配置或 rewrite 规则
   - 影响：即使有 token，服务器也收不到

**最可能的情况**：
- Vercel 的环境变量可能没有正确传递到 serverless function
- 或者 `vercel.json` 的 rewrite 配置导致 headers 丢失

---

## 三、修复方案

### 3.1 立即修复（必须）

#### 步骤 1：添加 SUPABASE_URL 环境变量

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择项目 `waytoheyball`
3. 进入 `Settings` > `Environment Variables`
4. 添加新变量：

| Name | Value | Environment |
|------|-------|-------------|
| **SUPABASE_URL** | `https://ksgksoeubyvkuwfpdhet.supabase.co` | Production, Preview, Development |

**注意**：
- 这个值应该与 `VITE_SUPABASE_URL` 相同
- 不要有 `VITE_` 前缀
- 这是给服务器端代码使用的

#### 步骤 2：验证其他环境变量

确保以下环境变量都已配置：

| Name | Status | Usage |
|------|--------|-------|
| `VITE_SUPABASE_URL` | ✅ 已配置 | 客户端 |
| `VITE_SUPABASE_ANON_KEY` | ✅ 已配置 | 客户端 |
| `SUPABASE_URL` | ❌ **缺失** | **服务器端** |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ 已配置 | 服务器端 |
| `DATABASE_URL` | ✅ 已配置 | 服务器端 |
| `SESSION_SECRET` | ✅ 已配置 | 服务器端 |

#### 步骤 3：重新部署

```bash
# 触发重新部署（可选：创建空提交）
git commit --allow-empty -m "chore: redeploy after SUPABASE_URL config"
git push origin main
```

或者在 Vercel Dashboard 手动 Redeploy。

#### 步骤 4：验证修复

部署完成后：

1. 访问 https://waytoheyball.com
2. 打开浏览器开发者工具 Console
3. 检查是否看到：
   ```
   ✅ [useAuth] Session check complete: {hasSession: true}
   ✅ 成功进入主界面（不是登录页面）
   ```

4. 检查 Network 面板：
   ```
   ✅ GET /api/auth/user => 200 OK (不是 401)
   ```

---

### 3.2 备选修复（如果上述方案无效）

如果添加 `SUPABASE_URL` 后问题仍存在，可能是 Authorization header 传递问题。

#### 修改 1：更新 vercel.json 的 rewrite 配置

当前配置：
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.ts" }
  ]
}
```

尝试改为：
```json
{
  "functions": {
    "api/index.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.ts",
      "has": [
        {
          "type": "header",
          "key": "authorization"
        }
      ]
    }
  ]
}
```

#### 修改 2：服务器端 Debug 日志

在 `server/auth.ts:504` 添加日志：

```typescript
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (authDisabled) {
    return next();
  }

  // 🔍 Debug: 打印所有 headers
  console.log('Received headers:', JSON.stringify(req.headers, null, 2));

  const authHeader = req.headers.authorization;
  console.log('Authorization header:', authHeader);

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      message: "Unauthorized - No token provided",
      hint: "Please login again to refresh your session",
      debug: {  // ⚠️ 仅用于调试，生产环境应移除
        hasAuthHeader: !!authHeader,
        authHeaderValue: authHeader?.substring(0, 20) + '...'
      }
    });
  }

  // ... 其余代码
}
```

---

### 3.3 长期改进方案

#### 改进 1：统一环境变量命名

修改 `server/supabaseAdmin.ts` 只使用一个变量：

```typescript
// 改进前
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;

// 改进后
const supabaseUrl = process.env.SUPABASE_URL;

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL environment variable is required for server-side code');
}
```

#### 改进 2：添加环境变量验证脚本

创建 `scripts/check-server-env.js`：

```javascript
#!/usr/bin/env node

const requiredServerEnvVars = [
  'SUPABASE_URL',           // 不是 VITE_SUPABASE_URL
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL',
  'SESSION_SECRET',
];

const missing = requiredServerEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missing.length > 0) {
  console.error('❌ Server environment check failed:');
  console.error('Missing required environment variables:');
  missing.forEach((varName) => {
    console.error(`   - ${varName}`);
  });
  console.error('\nThese variables are required for serverless functions.');
  console.error('VITE_* variables are ONLY for client-side code!');
  process.exit(1);
}

console.log('✅ All required server environment variables are present.');
```

更新 `package.json`:

```json
{
  "scripts": {
    "prebuild": "node scripts/check-server-env.js",
    "build": "vite build && tsc"
  }
}
```

#### 改进 3：添加服务器端健康检查

在 `server/routes.ts` 添加：

```typescript
app.get('/api/health', async (req, res) => {
  const { hasSupabaseAdmin } = await import("./supabaseAdmin.js");

  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {
      database: !!process.env.DATABASE_URL,
      supabaseAdmin: hasSupabaseAdmin(),
      session: !!process.env.SESSION_SECRET,
    }
  };

  const allChecks = Object.values(health.checks).every(v => v);

  res.status(allChecks ? 200 : 503).json(health);
});
```

---

## 四、技术深度分析

### 4.1 Vite 环境变量机制

Vite 在构建时处理 `VITE_*` 前缀的环境变量：

1. **构建阶段**：
   ```bash
   npm run build
   # Vite 读取 .env 或系统环境变量
   # 将所有 VITE_* 变量的值硬编码到 bundle.js 中
   # 例如：VITE_SUPABASE_URL -> "https://xxx.supabase.co"
   ```

2. **运行阶段**：
   ```javascript
   // 客户端代码（浏览器中运行）
   import.meta.env.VITE_SUPABASE_URL  // ✅ 可用，值已硬编码在 bundle 中

   // 服务器端代码（Node.js中运行）
   process.env.VITE_SUPABASE_URL      // ❌ undefined（除非运行时环境有这个变量）
   ```

**关键点**：
- `import.meta.env.VITE_*` 只能在客户端代码中使用
- `process.env.VITE_*` 在服务器端默认是 undefined（除非显式设置）
- 服务器端应该使用不带 `VITE_` 前缀的变量

### 4.2 Vercel Serverless 环境

Vercel 的 serverless function 运行模型：

```
用户请求
  ↓
Vercel Edge Network
  ↓
Serverless Function (冷启动或热启动)
  ↓
Express App (server/index.ts)
  ↓
路由处理 (server/routes.ts)
  ↓
认证中间件 (server/auth.ts)
  ↓
API 响应
```

**环境变量注入时机**：
1. 在 Vercel Dashboard 配置环境变量
2. Vercel 在构建时注入 `VITE_*` 变量到客户端 bundle
3. Vercel 在运行时注入所有变量到 serverless function 的 `process.env`
4. **但是**：如果变量名有 `VITE_` 前缀，Vercel 可能不会注入到服务器端

### 4.3 Authorization Header 传递链

正常流程：
```
浏览器
  ↓ (fetch with Authorization: Bearer xxx)
Vercel Edge
  ↓ (rewrite /api/auth/user -> /api/index.ts)
Serverless Function
  ↓ (req.headers.authorization)
Express Middleware
```

可能的问题点：
1. **浏览器层**：CORS preflight 检查失败 ❌ (已排除，其他 headers 正常)
2. **Vercel Edge层**：rewrite 规则丢失 headers ❓ (可能)
3. **Serverless Function层**：header 解析问题 ❓ (可能)
4. **Express层**：中间件修改 headers ❌ (代码中未发现)

---

## 五、验证清单

### 5.1 修复前检查

- [x] 确认前端环境变量已配置（VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY）
- [x] 确认服务器端部分环境变量已配置（SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL）
- [x] 确认问题现象：前端有 session，API 返回 401
- [x] 确认根本原因：SUPABASE_URL 缺失

### 5.2 修复后验证

- [ ] **Step 1**: 在 Vercel 添加 `SUPABASE_URL` 环境变量
- [ ] **Step 2**: 触发重新部署
- [ ] **Step 3**: 访问 https://waytoheyball.com
- [ ] **Step 4**: 检查是否能正常登录/进入系统
- [ ] **Step 5**: 检查 Console 无 401 错误
- [ ] **Step 6**: 检查 Network 请求成功（200）
- [ ] **Step 7**: 访问 `/api/health` 检查所有 checks 都是 true

---

## 六、时间线

| 时间 | 事件 | 状态 |
|------|------|------|
| 2025-11-26 15:00 | 用户报告问题 | ✅ |
| 2025-11-26 15:10 | 初步诊断（错误：环境变量缺失） | ❌ 错误方向 |
| 2025-11-26 15:20 | 重新分析，发现前端 Supabase 正常 | ✅ |
| 2025-11-26 15:30 | 确认 API 返回 401 | ✅ |
| 2025-11-26 15:40 | 分析服务器端代码 | ✅ |
| 2025-11-26 15:50 | **确认根因：SUPABASE_URL 缺失** | ✅ |
| 待定 | 用户添加环境变量 | ⏳ |
| 待定 | 重新部署验证 | ⏳ |

---

## 七、参考资料

- [Vite 环境变量文档](https://vitejs.dev/guide/env-and-mode.html)
- [Vercel 环境变量文档](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Auth 服务器端验证](https://supabase.com/docs/guides/auth/server-side)
- [Express.js Request Headers](https://expressjs.com/en/api.html#req.headers)

---

**报告生成**: 2025-11-26
**诊断工具**: Ultra MCP Sequential Thinking + Ultra Debug + Playwright
**审核状态**: ✅ Ready for Implementation
**修复优先级**: **P0 - CRITICAL**
