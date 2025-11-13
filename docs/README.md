# 📚 项目文档

WayToHeyball (中八大师之路) 项目文档中心

## 📖 文档索引

### 🚀 快速开始
- **[项目README](../README.md)** - 项目概览和快速开始指南
- **[CLAUDE.md](../CLAUDE.md)** - Claude Code 开发指南（AI辅助开发）

### 📋 API 文档
- **[十大招系统 API](./api/ten-core-skills.md)** - Ten Core Skills System V3 API 完整文档

### 📝 操作指南
- **[SQL 执行指南](./guides/sql-execution.md)** - 数据库初始化和 SQL 执行步骤

### 🏗️ 架构文档
目前架构文档集中在 [CLAUDE.md](../CLAUDE.md) 中，包含：
- 部署架构（Vercel Serverless）
- 前端架构（React + TanStack Query）
- 后端架构（Express + Drizzle ORM）
- 数据库Schema
- 认证流程（Supabase Auth + JWT）

### 🚢 部署指南
目前部署指南集中在 [CLAUDE.md](../CLAUDE.md#production-deployment-vercel) 中，包含：
- Vercel 部署步骤
- 环境变量配置
- 数据库连接配置

### 📦 归档文档
- **[前端实现总结](./archive/frontend-implementation-summary.md)** - 十大招系统前端开发日志（2025-01-13）
- **[产品需求文档 V2.1](./archive/prd-v2.1.md)** - 第一阶段开发需求

## 📂 文档结构

```
docs/
├── README.md                                    # 本文件 - 文档索引
├── api/                                         # API 文档
│   └── ten-core-skills.md                      # 十大招系统API
├── guides/                                      # 操作指南
│   └── sql-execution.md                        # SQL执行指南
├── architecture/                                # 架构文档（待补充）
├── deployment/                                  # 部署文档（待补充）
└── archive/                                     # 归档文档
    ├── frontend-implementation-summary.md      # 前端实现总结
    └── prd-v2.1.md                             # 产品需求文档 V2.1
```

## 🔗 外部资源

- **[Supabase Dashboard](https://supabase.com/dashboard)** - 数据库管理
- **[Vercel Dashboard](https://vercel.com/dashboard)** - 部署管理
- **[OpenAI API](https://platform.openai.com/)** - AI 服务

## 📝 文档维护

- 主要开发文档保存在根目录的 [CLAUDE.md](../CLAUDE.md)
- API 文档保存在 `docs/api/`
- 操作手册保存在 `docs/guides/`
- 过时或完成的文档移至 `docs/archive/`

## ✍️ 贡献文档

如需添加或更新文档，请遵循以下规范：

1. **API 文档**: 使用 Markdown 格式，包含完整的请求/响应示例
2. **操作指南**: 提供分步说明，标注⚠️ 警告和 ✅ 验证步骤
3. **架构文档**: 包含图表和代码示例
4. **归档文档**: 保留时间戳和版本信息

---

**最后更新**: 2025-01-13
