# 中八大师之路 (WayToHeyball)

中式八球智能训练系统 - 结合AI教练与游戏化学习的专业台球训练平台

## 🎱 项目简介

这是一个全栈Web应用，为中式八球爱好者提供系统化、个性化的训练方案。通过游戏化的关卡地图、AI智能反馈和数据分析，帮助用户科学提升球技。

### 核心功能

- **🎯 关卡地图系统**: 8个技能等级，400+精心设计的训练习题
- **🤖 AI教练反馈**: GPT-4o驱动的个性化训练建议和图像识别
- **📊 进度追踪**: 经验值、等级、连胜天数等多维度数据统计
- **📅 训练计划**: 30天系统课程，循序渐进提升技术
- **📔 训练日记**: 记录训练心得，AI生成深度洞察
- **🏆 排行榜**: 与其他学员良性竞争，激励持续练习

## 🚀 快速开始

### 环境要求

- Node.js 18+
- PostgreSQL 数据库 (推荐使用 Supabase)
- OpenAI API Key

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.example` 到 `.env`，填入必要的配置：

```bash
DATABASE_URL=postgresql://...
SESSION_SECRET=your-secret-key
OPENAI_API_KEY=sk-...
```

### 开发模式

```bash
npm run dev          # 启动开发服务器 (http://localhost:5000)
```

### 生产构建

```bash
npm run build        # 构建前端和后端
npm run start        # 启动生产服务器
```

## 📁 项目结构

```
WayToHeyball/
├── client/              # React 前端应用
│   ├── public/         # 静态资源
│   └── src/            # 源代码
│       ├── pages/      # 页面组件
│       ├── components/ # UI组件
│       ├── hooks/      # 自定义Hooks
│       └── lib/        # 工具函数
├── server/              # Express 后端API
│   ├── index.ts        # 应用入口
│   ├── routes.ts       # 路由定义
│   ├── auth.ts         # 认证逻辑
│   └── db.ts           # 数据库连接
├── shared/              # 前后端共享代码
│   └── schema.ts       # 数据库Schema和类型
├── docs/                # 📚 项目文档
│   ├── README.md       # 文档索引
│   ├── api/            # API文档
│   ├── guides/         # 操作指南
│   └── archive/        # 归档文档
├── migrations/          # 数据库迁移
├── api/                 # Vercel Serverless入口
└── scripts/             # 构建脚本
```

## 🛠️ 技术栈

### 前端
- **React 18** + **TypeScript**
- **Wouter** 路由
- **TanStack Query** 数据获取
- **Tailwind CSS** + **shadcn/ui** 样式
- **Vite** 构建工具

### 后端
- **Node.js** + **Express**
- **TypeScript** (ESM)
- **Drizzle ORM** + **PostgreSQL**
- **OpenAI API** (GPT-4o)
- **Vercel Serverless Functions**

## 📖 文档

- **[开发指南 (CLAUDE.md)](./CLAUDE.md)** - 详细的开发文档和架构说明
- **[文档中心 (docs/)](./docs/)** - API文档、操作指南、归档文档
- **[十大招系统 API](./docs/api/ten-core-skills.md)** - Ten Core Skills V3 API文档
- **[SQL执行指南](./docs/guides/sql-execution.md)** - 数据库初始化步骤

更多文档请查看 [/docs 目录](./docs/)。

## 🔧 常用命令

```bash
npm run dev          # 开发模式（前端+后端）
npm run build        # 构建生产版本
npm run start        # 启动生产服务器
npm run check        # TypeScript类型检查
npm run db:push      # 推送数据库Schema变更
```

## 🚢 部署

项目已配置用于 Vercel 无服务器部署：

1. 连接GitHub仓库到Vercel
2. 配置环境变量
3. 自动构建和部署

详细步骤参见 [CLAUDE.md - 部署章节](./CLAUDE.md#production-deployment-vercel)。

## 📝 开发规范

- 使用 TypeScript 严格模式
- 服务端代码必须使用 `.js` 扩展名导入 (ESM)
- API 路由使用 Zod 进行输入验证
- 遵循 RESTful API 设计原则
- 代码提交前运行 `npm run check`

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**技术支持**: 如有问题，请查看 [CLAUDE.md](./CLAUDE.md) 或 [文档中心](./docs/) 或提交 Issue。
