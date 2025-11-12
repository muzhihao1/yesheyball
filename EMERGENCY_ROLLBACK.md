# 🚨 紧急回滚指南

## 问题描述
登录API (`/api/auth/user`) 返回500错误，用户无法登录

## 快速回滚方案

### 方案A：回滚到最后稳定版本（推荐）

```bash
# 1. 创建hotfix分支保存当前工作
git branch hotfix-login-failure

# 2. 回滚到上一个稳定版本（在90天API之前）
git reset --hard 861825f

# 3. 强制推送到远程（触发Vercel重新部署）
git push origin main --force

# 4. 等待Vercel部署完成（约2-3分钟）
# 访问 https://waytoheyball.com 测试登录
```

**回滚后会丢失的功能：**
- ❌ 90天系统API端点
- ❌ 90天系统UI组件
- ❌ tasks.tsx的单Tab重构

**保留的功能：**
- ✅ 所有核心功能（登录、训练、日记等）
- ✅ 数据库中的90天系统表和数据（不会丢失）

---

### 方案B：创建hotfix分支修复（如果不想回滚）

```bash
# 1. 基于当前main创建hotfix分支
git checkout -b hotfix/login-api-500

# 2. 临时注释掉90天系统API路由（在server/routes.ts中）
# 找到这些路由并注释：
# - app.get("/api/tencore-skills", ...)
# - app.get("/api/ninety-day/curriculum", ...)
# - app.get("/api/ninety-day/progress", ...)
# - app.post("/api/ninety-day/complete-day", ...)
# - app.get("/api/ninety-day/specialized-training", ...)
# - app.get("/api/ninety-day/records", ...)

# 3. 提交并推送
git add server/routes.ts
git commit -m "hotfix: temporarily disable 90-day API endpoints to fix login"
git push origin hotfix/login-api-500

# 4. 在GitHub创建PR并merge到main
# Vercel会自动部署
```

---

## 根本原因分析

可能的原因：
1. **90天系统API代码**（commit b4f7549）引入了bug
2. **Vercel环境变量丢失**：DATABASE_URL配置错误
3. **数据库连接失败**：Vercel无法连接到Supabase

---

## 推荐操作流程

1. **立即执行方案A回滚**（恢复网站可用性）
2. **本地调试90天系统**（找到真正的bug）
3. **修复后重新部署**（确保测试通过）

---

## Vercel部署监控

- Dashboard: https://vercel.com/dashboard
- Deployments: 查看部署日志
- Logs: 查看serverless function错误日志
