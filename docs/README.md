# 📚 项目文档

WayToHeyball (中八大师之路) 项目文档中心

## 📖 文档索引

### 🚀 快速开始
- **[项目README](../README.md)** - 项目概览和快速开始指南
- **[CLAUDE.md](../CLAUDE.md)** - Claude Code 开发指南（AI辅助开发，**已更新90天挑战和十大招系统**）

### 📋 API 文档
- **[十大招系统 API](./api/ten-core-skills.md)** - Ten Core Skills System V3 API 完整文档

### 📝 操作指南
- **[SQL 执行指南](./guides/sql-execution.md)** - 数据库初始化和 SQL 执行步骤

### 📊 参考资料
- **[90天挑战课程映射方案](./90天挑战课程映射方案.md)** - 90天课程与十大招的映射关系
- **[90天挑战测试报告](./TEST_REPORT_90DAY_CHALLENGE.md)** - 90天挑战系统测试报告

### 🏗️ 架构文档
主要架构文档集中在 [CLAUDE.md](../CLAUDE.md) 中，包含：
- 部署架构（Vercel Serverless）
- 前端架构（React + TanStack Query）
- 后端架构（Express + Drizzle ORM）
- 三大训练系统（技能库、90天挑战、十大招）
- 数据库Schema（含90天挑战和十大招表）
- 认证流程（Supabase Auth + JWT）
- 最新生产修复（2025-11-27）

### 🚢 部署指南
目前部署指南集中在 [CLAUDE.md](../CLAUDE.md#production-deployment-vercel) 中，包含：
- Vercel 部署步骤
- 环境变量配置
- 数据库连接配置

### 📋 活跃规划文档
- **[MILESTONE4-8 开发计划](./planning/MILESTONE4-8_DEVELOPMENT_PLAN.md)** - 未来开发里程碑
- **[开发路线图](./planning/DEVELOPMENT_ROADMAP.md)** - 项目总体路线图
- **[生产环境修复报告](./planning/PRODUCTION_FIXES_REPORT.md)** - 最新生产问题修复（2025-11-27）
- **[生产环境测试报告](./planning/PRODUCTION_TEST_REPORT.md)** - 最新生产测试
- **[后续优化计划-2025](./planning/后续优化计划-2025.md)** - 2025年优化计划

### 🧪 测试文档
- **[E2E测试计划](./testing/E2E_TEST_PLAN.md)** - 端到端测试计划
- **[快速测试检查清单](./testing/QUICK_TEST_CHECKLIST.md)** - 测试要点检查

### 📦 归档文档
已完成的历史文档已归档至以下目录：
- **[archive/](./archive/)** - 旧的部署报告、测试报告、产品文档
- **[archive/planning/](./archive/planning/)** - 已完成的里程碑文档（MILESTONE1-3）
- **[archive/reports/](./archive/reports/)** - 历史验收和问题分析报告
- **[archive/early-design/](./archive/early-design/)** - 早期设计资料和原型

## 📂 文档结构

```
docs/
├── README.md                           # 本文件 - 文档索引
├── 90天挑战课程映射方案.md             # 90天课程映射
├── TEST_REPORT_90DAY_CHALLENGE.md      # 90天挑战测试
│
├── api/                                # API 文档
│   └── ten-core-skills.md             # 十大招系统API
│
├── guides/                             # 操作指南
│   └── sql-execution.md               # SQL执行指南
│
├── planning/                           # 活跃规划文档
│   ├── MILESTONE4-8_DEVELOPMENT_PLAN.md
│   ├── DEVELOPMENT_ROADMAP.md
│   ├── PRODUCTION_FIXES_REPORT.md     # ⭐ 最新修复
│   └── ...                             # 其他活跃规划
│
├── testing/                            # 测试文档
│   ├── E2E_TEST_PLAN.md
│   └── QUICK_TEST_CHECKLIST.md
│
├── archive/                            # 归档文档
│   ├── planning/                      # 已完成的里程碑
│   ├── reports/                       # 历史报告
│   ├── early-design/                  # 早期设计
│   └── ...                            # 其他归档文件
│
├── deployment/                         # 部署文档
└── architecture/                       # 架构文档
```

## 🔗 外部资源

- **[Supabase Dashboard](https://supabase.com/dashboard)** - 数据库管理
- **[Vercel Dashboard](https://vercel.com/dashboard)** - 部署管理
- **[OpenAI API](https://platform.openai.com/)** - AI 服务

## 📝 文档维护

- **主要开发文档**: 根目录的 [CLAUDE.md](../CLAUDE.md)
- **API 文档**: `docs/api/`
- **操作手册**: `docs/guides/`
- **活跃规划**: `docs/planning/`
- **测试文档**: `docs/testing/`
- **归档文档**: `docs/archive/`（已完成或过时的文档）

### 归档规则

文档归档标准：
1. **已完成的里程碑** → `archive/planning/`
2. **历史测试报告** → `archive/reports/`
3. **早期设计资料** → `archive/early-design/`
4. **过时的部署报告** → `archive/`

## ✍️ 贡献文档

如需添加或更新文档，请遵循以下规范：

1. **API 文档**: 使用 Markdown 格式，包含完整的请求/响应示例
2. **操作指南**: 提供分步说明，标注⚠️ 警告和 ✅ 验证步骤
3. **架构文档**: 包含图表和代码示例
4. **归档文档**: 保留时间戳和版本信息，移至对应archive子目录

---

**最后更新**: 2025-11-27 (更新：添加90天挑战、十大招系统、最新生产修复、重组归档结构)
