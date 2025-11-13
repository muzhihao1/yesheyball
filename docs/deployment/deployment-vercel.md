# GitHub + Vercel 部署流程

本指南描述如何将耶氏台球学院平台从本地迁移到 GitHub + Vercel，并配置 PostgreSQL（Neon/Supabase/Vercel Postgres 均可）。

## 1. 前置准备
- 本地完成 `npm install` 安装依赖（若在沙盒环境下失败，可在本机重新执行）。
- 确认数据库已创建，并能够访问 `DATABASE_URL`。
- 准备以下敏感变量：
  - `DATABASE_URL`
  - `SESSION_SECRET`
  - `OPENAI_API_KEY`
  - `AUTH_ALLOWED_EMAILS`（可选）
  - `AUTH_ACCESS_CODE`（可选）
  - `BLOB_READ_WRITE_TOKEN`（启用 Vercel Blob 时必填）

## 2. 推送到 GitHub
1. 创建新的 GitHub 仓库。
2. 将本地代码（排除 `.env*`、`uploads/`）推送到远端。
3. 建议启用分支保护：`main` → 仅允许通过 Pull Request 合并。

## 3. 连接 Vercel
1. 在 Vercel 仪表盘选择 *Add New → Project*，导入 GitHub 仓库。
2. 构建配置：
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
   - Install Command: `npm install`
3. Vercel 会自动识别 `api/index.ts` 作为 Serverless 函数入口。

## 4. 配置环境变量
在 `Project Settings → Environment Variables` 中添加：

| 变量 | 说明 |
| --- | --- |
| `DATABASE_URL` | PostgreSQL 连接串 |
| `SESSION_SECRET` | 任意长度≥32的随机字符串 |
| `OPENAI_API_KEY` | OpenAI 访问密钥 |
| `AUTH_ALLOWED_EMAILS` | 允许登录的邮箱列表，逗号分隔（可选） |
| `AUTH_ACCESS_CODE` | 登录时需要输入的访问口令（可选） |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob RW Token（如需图片上传） |
| `AUTH_DISABLED` | 缺省即关闭鉴权；若需启用登录，请显式设置为 `false` |
| `AUTH_DISABLED_EMAIL` / `AUTH_DISABLED_USER_ID` | 自定义演示账号的邮箱与 ID（可选） |

> Preview / Development 环境可以使用不同的数据库和密钥，Vercel 支持环境级继承。

## 5. 数据库迁移
1. 在本地或 CI 中运行 `npx drizzle-kit push`（需读取 `DATABASE_URL`）。
2. 如使用 Vercel Postgres，先在 Vercel 中生成连接串，再在本地执行迁移。
3. 生产环境迁移完成后再 Promote Preview → Production。

## 6. 验证部署
- 访问 Preview URL，使用允许的邮箱登录（若设置 `AUTH_ACCESS_CODE` 需一并填写）。
- 新建训练记录、日记上传图片，确认文件地址指向 Vercel Blob。
- 检查 `/api/auth/user`、`/api/diary`、`/api/training-sessions` 等核心接口。

## 7. 常见问题
- **无法登录**：确认邮箱已包含在 `AUTH_ALLOWED_EMAILS` 或未设置该变量；确认 `SESSION_SECRET` 一致。
- **图片上传失败**：检查是否在生产环境配置 `BLOB_READ_WRITE_TOKEN`，以及 `persistUploadedImage` 是否回退到本地模式。
- **API 返回 500**：查看 Vercel Function 日志；确保数据库已迁移并且表存在。

## 8. 推荐自动化
- 在 GitHub Actions 中添加工作流，执行 `npm ci && npm run build && npm run check` 以提前捕获类型错误。
- Pull Request 合并前运行 `npx drizzle-kit push --dry-run` 确认数据库迁移脚本。
