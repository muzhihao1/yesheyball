# 数据库连接配置修复指南

## 问题诊断

**当前问题**: `npm run db:push` 失败，错误信息：
```
Error: Connection terminated unexpectedly
```

**根本原因**: 当前使用了 **Transaction Pooler** (端口5432)，而 Drizzle Kit 需要 **Session Pooler** (端口6543)。

**当前配置**:
- 端口: `5432` ❌
- 主机: `db.ksgksoeubyvkuwfpdhet.supabase.co` ❌

**正确配置应该是**:
- 端口: `6543` ✅
- 主机: `aws-0-[region].pooler.supabase.com` ✅

---

## 修复步骤

### 步骤 1: 从 Supabase 获取正确的连接字符串

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目: `waytoheyball`
3. 点击左侧菜单 **Project Settings** (齿轮图标)
4. 选择 **Database** 选项卡
5. 向下滚动到 **Connection string** 部分
6. 在 **Connection pooling** 下拉菜单中，选择 **Session** 模式
7. 点击 **URI** 格式
8. 复制显示的连接字符串，格式应该类似：

```
postgresql://postgres.pooler:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**关键特征**:
- ✅ 端口是 `6543`
- ✅ 主机包含 `pooler.supabase.com`
- ✅ 用户名可能是 `postgres.pooler` 或 `postgres.[project-ref]`

### 步骤 2: 更新 .env 文件

打开项目根目录的 `.env` 文件，找到 `DATABASE_URL` 行并替换为：

```env
# V2.1 Session Pooler Configuration (CORRECT)
DATABASE_URL="postgresql://postgres.pooler:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
```

**重要提示**:
- 将 `[YOUR-PASSWORD]` 替换为你的实际数据库密码
- 将 `[REGION]` 替换为你的实际区域（如 `us-east-1`, `ap-southeast-1` 等）
- 保持引号 `"` 在字符串两端

### 步骤 3: 验证修复

在终端运行：

```bash
npm run db:push
```

**期待的成功输出**:
```
Reading config file 'drizzle.config.ts'
Using 'pg' driver for database querying
Pulling schema from database...✓
Applying schema changes...✓
```

---

## 为什么需要 Session Pooler？

### Transaction Pooler (事务模式)
- **端口**: 5432
- **用途**: Serverless 函数、短暂连接
- **限制**: 每个连接只能执行一个事务
- **问题**: Drizzle Kit 需要执行多个步骤（查询元数据、比较schema、执行DDL），超出单事务范围

### Session Pooler (会话模式)
- **端口**: 6543
- **用途**: 长时间连接、数据库管理工具
- **优势**: 支持多事务、持久连接
- **适用**: Drizzle Kit、数据库迁移、开发工具

---

## 常见问题排查

### 问题 1: 仍然连接失败

**检查点**:
1. 确认密码正确（无特殊字符编码问题）
2. 确认端口是 `6543` 而不是 `5432`
3. 确认主机包含 `pooler.supabase.com`
4. 重启终端以确保环境变量更新

### 问题 2: SSL 相关错误

如果出现 SSL 错误，在连接字符串末尾添加：

```
?sslmode=require
```

完整示例：
```env
DATABASE_URL="postgresql://postgres.pooler:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
```

### 问题 3: 网络防火墙

确保你的网络/防火墙允许到端口 `6543` 的出站 TCP 连接。

---

## 生产环境配置

### Vercel 部署

在 Vercel Dashboard 中：

1. 进入项目设置
2. 选择 **Environment Variables**
3. 更新 `DATABASE_URL` 为 Session Pooler 连接字符串
4. **重要**: 更新环境变量后，需要手动触发重新部署

### 本地开发 vs 生产

**建议配置**:
- **本地开发**: 使用 Session Pooler (端口6543) - 支持 Drizzle Kit
- **生产环境**:
  - Serverless 函数可以使用 Transaction Pooler (端口5432)
  - 但为了统一，推荐全部使用 Session Pooler

---

## 验证清单

修复完成后，请确认：

- [ ] .env 文件中 DATABASE_URL 使用端口 6543
- [ ] 主机名包含 `pooler.supabase.com`
- [ ] `npm run db:push` 执行成功
- [ ] TypeScript 检查通过 (`npm run check`)
- [ ] 新表在 Supabase Table Editor 中可见

---

## 相关文档

- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Drizzle Kit Push Command](https://orm.drizzle.team/kit-docs/commands#push)
- 项目内部文档: `CLAUDE.md` (Database Connection Notes)

---

**最后更新**: 2025-11-10
**问题状态**: 待修复 → 需要用户手动更新 .env 文件
