# "中八大师之路" V2.1 开发实施方案

## 文档版本
- **版本**: V2.1 Phase 1
- **创建日期**: 2025-11-10
- **最后更新**: 2025-11-10
- **状态**: 待执行

## 执行摘要

本文档详细规划了"十大招"系统训练和"专项训练"功能的完整开发实施方案。基于Ultra MCP规划方法论，采用"分阶段垂直交付"策略，将在2-3周内通过3个Sprint完成从数据库到前端的全栈开发。

### 核心目标
1. 实现结构化的"十大招"系统训练课程体系
2. 提供8大核心技能的专项训练功能
3. 完善用户训练进度追踪机制
4. 增强前端UI/UX体验

### 关键指标
- **开发周期**: 2-3周（3个Sprint）
- **工作量估算**: 108-120小时
- **团队配置**: 1后端 + 1前端工程师
- **代码覆盖率**: ≥80%
- **部署策略**: Blue-green deployment

---

## 一、架构设计

### 1.1 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 训练计划主页  │  │ 关卡地图页面  │  │ 专项训练列表  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ 训练单元详情  │  │ 进度追踪组件  │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                        API Layer                             │
│  GET  /api/training/levels                                   │
│  GET  /api/training/levels/{levelId}                        │
│  GET  /api/training/units/{unitId}                          │
│  POST /api/training/progress/start                          │
│  POST /api/training/progress/update                         │
│  POST /api/training/progress/complete                       │
└─────────────────────────────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                          │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ training_levels  │  │ skills            │                │
│  └──────────────────┘  └──────────────────┘                │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ training_units   │  │ sub_skills        │                │
│  └──────────────────┘  └──────────────────┘                │
│  ┌───────────────────────────────────────┐                 │
│  │ user_training_progress (核心进度表)     │                 │
│  └───────────────────────────────────────┘                 │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ specialized_...  │  │ specialized_...  │                │
│  │ trainings        │  │ training_plans   │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 技术栈

**前端**:
- React 18 + TypeScript
- Vite (构建工具)
- Tailwind CSS (样式)
- TanStack Query (数据获取)
- Wouter (路由)

**后端**:
- Node.js + Express + TypeScript
- Drizzle ORM (数据库ORM)
- Zod (数据验证)
- Supabase Auth (认证)

**数据库**:
- PostgreSQL (Supabase)
- JSONB (灵活内容存储)

**DevOps**:
- GitHub (版本控制)
- Vercel (部署平台)
- GitHub Actions (CI/CD)

---

## 二、数据库设计

### 2.1 新增表结构

#### 2.1.1 training_levels (训练关卡表)

```sql
CREATE TABLE training_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_number INTEGER NOT NULL UNIQUE,  -- 1-8
    title VARCHAR(100) NOT NULL,           -- 如"第一招：站姿与握杆"
    description TEXT,
    prerequisite_level_id UUID REFERENCES training_levels(id),
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_training_levels_number ON training_levels(level_number);
CREATE INDEX idx_training_levels_order ON training_levels(order_index);
```

#### 2.1.2 skills (技能主表)

```sql
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_id UUID NOT NULL REFERENCES training_levels(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,      -- 如"站姿"
    skill_order INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(level_id, skill_order)
);

CREATE INDEX idx_skills_level ON skills(level_id);
```

#### 2.1.3 sub_skills (子技能表)

```sql
CREATE TABLE sub_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    sub_skill_name VARCHAR(100) NOT NULL,  -- 如"脚位"
    sub_skill_order INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(skill_id, sub_skill_order)
);

CREATE INDEX idx_sub_skills_skill ON sub_skills(skill_id);
```

#### 2.1.4 training_units (训练单元表)

```sql
CREATE TABLE training_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sub_skill_id UUID NOT NULL REFERENCES sub_skills(id) ON DELETE CASCADE,
    unit_type VARCHAR(20) NOT NULL,        -- 'theory', 'practice', 'challenge'
    unit_order INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    content JSONB NOT NULL,                -- 灵活的内容结构
    xp_reward INTEGER DEFAULT 10,
    estimated_minutes INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sub_skill_id, unit_order),
    CHECK (unit_type IN ('theory', 'practice', 'challenge'))
);

CREATE INDEX idx_training_units_sub_skill ON training_units(sub_skill_id);
CREATE INDEX idx_training_units_type ON training_units(unit_type);
```

**Content JSONB 结构示例**:

```typescript
// 理论单元
{
  "type": "theory",
  "text": "正确的站姿是台球技术的基础...",
  "images": [
    "https://example.com/stance1.jpg",
    "https://example.com/stance2.jpg"
  ],
  "video": "https://example.com/stance-tutorial.mp4"
}

// 练习单元
{
  "type": "practice",
  "instructions": "在镜子前重复练习正确站姿30次",
  "demo_video": "https://example.com/demo.mp4",
  "success_criteria": {
    "type": "repetitions",
    "target": 30
  }
}

// 挑战单元
{
  "type": "challenge",
  "instructions": "在实际台面上完成10次连续正确站姿击球",
  "success_criteria": {
    "type": "success_rate",
    "target": 0.8  // 80% 成功率
  }
}
```

#### 2.1.5 user_training_progress (核心进度表)

```sql
CREATE TABLE user_training_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level_id UUID NOT NULL REFERENCES training_levels(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES training_units(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'not_started',
    progress_data JSONB,                   -- 存储进度详情
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, unit_id),
    CHECK (status IN ('not_started', 'in_progress', 'completed'))
);

CREATE INDEX idx_progress_user ON user_training_progress(user_id);
CREATE INDEX idx_progress_level ON user_training_progress(level_id);
CREATE INDEX idx_progress_status ON user_training_progress(user_id, status);
```

**Progress Data JSONB 结构**:

```typescript
{
  "started_at": "2025-11-10T10:00:00Z",
  "last_activity_at": "2025-11-10T10:15:00Z",
  "attempts": 3,
  "current_count": 25,        // 对于练习单元
  "success_rate": 0.75,       // 对于挑战单元
  "notes": "需要调整站姿角度"
}
```

#### 2.1.6 specialized_trainings (专项训练主表)

```sql
CREATE TABLE specialized_trainings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_category VARCHAR(50) NOT NULL,   -- '准度', '走位', '防守'等
    training_name VARCHAR(100) NOT NULL,
    description TEXT,
    difficulty_level INTEGER DEFAULT 1,    -- 1-5
    thumbnail_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (difficulty_level BETWEEN 1 AND 5)
);

CREATE INDEX idx_specialized_category ON specialized_trainings(skill_category);
```

#### 2.1.7 specialized_training_plans (专项训练计划表)

```sql
CREATE TABLE specialized_training_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_id UUID NOT NULL REFERENCES specialized_trainings(id) ON DELETE CASCADE,
    plan_order INTEGER NOT NULL,
    exercise_name VARCHAR(200) NOT NULL,
    exercise_description TEXT,
    demo_video_url VARCHAR(500),
    target_metrics JSONB,                  -- 目标指标
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(training_id, plan_order)
);

CREATE INDEX idx_plans_training ON specialized_training_plans(training_id);
```

### 2.2 Drizzle ORM Schema 定义

```typescript
// shared/schema.ts

import { pgTable, uuid, varchar, text, integer, boolean, jsonb, timestamp, check } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Training Levels
export const trainingLevels = pgTable('training_levels', {
  id: uuid('id').defaultRandom().primaryKey(),
  levelNumber: integer('level_number').notNull().unique(),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description'),
  prerequisiteLevelId: uuid('prerequisite_level_id').references(() => trainingLevels.id),
  orderIndex: integer('order_index').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Skills
export const skills = pgTable('skills', {
  id: uuid('id').defaultRandom().primaryKey(),
  levelId: uuid('level_id').notNull().references(() => trainingLevels.id, { onDelete: 'cascade' }),
  skillName: varchar('skill_name', { length: 100 }).notNull(),
  skillOrder: integer('skill_order').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Sub Skills
export const subSkills = pgTable('sub_skills', {
  id: uuid('id').defaultRandom().primaryKey(),
  skillId: uuid('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
  subSkillName: varchar('sub_skill_name', { length: 100 }).notNull(),
  subSkillOrder: integer('sub_skill_order').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Training Units
export const trainingUnits = pgTable('training_units', {
  id: uuid('id').defaultRandom().primaryKey(),
  subSkillId: uuid('sub_skill_id').notNull().references(() => subSkills.id, { onDelete: 'cascade' }),
  unitType: varchar('unit_type', { length: 20 }).notNull(),
  unitOrder: integer('unit_order').notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  content: jsonb('content').notNull(),
  xpReward: integer('xp_reward').default(10),
  estimatedMinutes: integer('estimated_minutes').default(5),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// User Training Progress
export const userTrainingProgress = pgTable('user_training_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  levelId: uuid('level_id').notNull().references(() => trainingLevels.id, { onDelete: 'cascade' }),
  unitId: uuid('unit_id').notNull().references(() => trainingUnits.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).notNull().default('not_started'),
  progressData: jsonb('progress_data'),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Specialized Trainings
export const specializedTrainings = pgTable('specialized_trainings', {
  id: uuid('id').defaultRandom().primaryKey(),
  skillCategory: varchar('skill_category', { length: 50 }).notNull(),
  trainingName: varchar('training_name', { length: 100 }).notNull(),
  description: text('description'),
  difficultyLevel: integer('difficulty_level').default(1),
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Specialized Training Plans
export const specializedTrainingPlans = pgTable('specialized_training_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  trainingId: uuid('training_id').notNull().references(() => specializedTrainings.id, { onDelete: 'cascade' }),
  planOrder: integer('plan_order').notNull(),
  exerciseName: varchar('exercise_name', { length: 200 }).notNull(),
  exerciseDescription: text('exercise_description'),
  demoVideoUrl: varchar('demo_video_url', { length: 500 }),
  targetMetrics: jsonb('target_metrics'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// TypeScript Types for Content
export interface TheoryContent {
  type: 'theory';
  text: string;
  images?: string[];
  video?: string;
}

export interface PracticeContent {
  type: 'practice';
  instructions: string;
  demo_video: string;
  success_criteria: {
    type: 'repetitions';
    target: number;
  };
}

export interface ChallengeContent {
  type: 'challenge';
  instructions: string;
  success_criteria: {
    type: 'success_rate';
    target: number;
  };
}

export type TrainingUnitContent = TheoryContent | PracticeContent | ChallengeContent;

export interface ProgressData {
  started_at: string;
  last_activity_at: string;
  attempts: number;
  current_count?: number;
  success_rate?: number;
  notes?: string;
}
```

---

## 三、API 设计

### 3.1 API 端点规范

#### 3.1.1 GET /api/training/levels
获取所有训练关卡列表（含用户进度）

**请求**:
```http
GET /api/training/levels
Authorization: Bearer <token>
```

**响应**:
```json
{
  "levels": [
    {
      "id": "uuid",
      "levelNumber": 1,
      "title": "第一招：站姿与握杆",
      "description": "掌握正确的站姿和握杆方法",
      "orderIndex": 1,
      "userProgress": {
        "totalUnits": 15,
        "completedUnits": 3,
        "inProgressUnits": 1,
        "progressPercentage": 20,
        "isLocked": false
      }
    }
  ]
}
```

#### 3.1.2 GET /api/training/levels/{levelId}
获取特定关卡的详细信息

**请求**:
```http
GET /api/training/levels/uuid-here
Authorization: Bearer <token>
```

**响应**:
```json
{
  "level": {
    "id": "uuid",
    "levelNumber": 1,
    "title": "第一招：站姿与握杆",
    "skills": [
      {
        "id": "uuid",
        "skillName": "站姿",
        "skillOrder": 1,
        "subSkills": [
          {
            "id": "uuid",
            "subSkillName": "脚位",
            "units": [
              {
                "id": "uuid",
                "unitType": "theory",
                "title": "理论：正确的脚位",
                "xpReward": 10,
                "estimatedMinutes": 5,
                "userProgress": {
                  "status": "completed",
                  "completedAt": "2025-11-08T10:00:00Z"
                }
              }
            ]
          }
        ]
      }
    ]
  }
}
```

#### 3.1.3 GET /api/training/units/{unitId}
获取训练单元内容

**请求**:
```http
GET /api/training/units/uuid-here
Authorization: Bearer <token>
```

**响应**:
```json
{
  "unit": {
    "id": "uuid",
    "title": "理论：正确的脚位",
    "unitType": "theory",
    "content": {
      "type": "theory",
      "text": "正确的脚位是站姿的基础...",
      "images": ["url1", "url2"],
      "video": "video-url"
    },
    "xpReward": 10,
    "estimatedMinutes": 5,
    "subSkill": {
      "id": "uuid",
      "subSkillName": "脚位"
    },
    "userProgress": {
      "status": "in_progress",
      "progressData": {
        "started_at": "2025-11-10T10:00:00Z"
      }
    }
  }
}
```

#### 3.1.4 POST /api/training/progress/start
开始训练单元

**请求**:
```http
POST /api/training/progress/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "unitId": "uuid"
}
```

**响应**:
```json
{
  "progress": {
    "id": "uuid",
    "status": "in_progress",
    "progressData": {
      "started_at": "2025-11-10T10:00:00Z"
    }
  }
}
```

#### 3.1.5 POST /api/training/progress/update
更新训练进度

**请求**:
```http
POST /api/training/progress/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "unitId": "uuid",
  "progressData": {
    "current_count": 15,
    "notes": "已完成一半"
  }
}
```

**响应**:
```json
{
  "progress": {
    "id": "uuid",
    "status": "in_progress",
    "progressData": {
      "started_at": "2025-11-10T10:00:00Z",
      "last_activity_at": "2025-11-10T10:15:00Z",
      "current_count": 15,
      "notes": "已完成一半"
    }
  }
}
```

#### 3.1.6 POST /api/training/progress/complete
完成训练单元

**请求**:
```http
POST /api/training/progress/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "unitId": "uuid",
  "finalProgressData": {
    "success_rate": 0.9,
    "notes": "完成得很好"
  }
}
```

**响应**:
```json
{
  "progress": {
    "id": "uuid",
    "status": "completed",
    "completedAt": "2025-11-10T10:30:00Z"
  },
  "xpAwarded": 10,
  "userStats": {
    "totalXp": 1250,
    "level": 5,
    "nextLevelXp": 1500
  }
}
```

---

## 四、开发计划

### 4.1 Sprint 划分

#### Sprint 1: 数据库 + 核心API（4-5天）

**目标**: 建立数据基础，实现基本的读取功能

**任务列表**:
- [ ] T1.1 项目初始化
  - Git分支创建: `feature/v2.1-training-system`
  - 环境配置检查
  - 依赖项更新
  - **工时**: 2小时

- [ ] T1.2 数据库Schema实现
  - 在 `shared/schema.ts` 中添加所有新表定义
  - 编写Drizzle ORM migrations
  - 执行 `npm run db:push` 同步到Supabase
  - **工时**: 6小时

- [ ] T1.3 Core API - Read Endpoints
  - `GET /api/training/levels`
  - `GET /api/training/levels/{levelId}`
  - `GET /api/training/units/{unitId}`
  - 添加到 `server/routes.ts`
  - **工时**: 8小时

- [ ] T1.4 Database Queries
  - 在 `server/storage.ts` 中实现查询函数
  - 处理级联查询（levels -> skills -> subSkills -> units）
  - 优化查询性能
  - **工时**: 6小时

- [ ] T1.5 Zod Validation Schemas
  - 为所有新API请求/响应定义Zod schemas
  - 添加到 `shared/schema.ts`
  - **工时**: 3小时

- [ ] T1.6 单元测试
  - API endpoint测试
  - 数据库查询测试
  - 覆盖率 ≥80%
  - **工时**: 6小时

**Sprint 1 交付物**:
- ✅ 数据库完全同步
- ✅ 3个读取API可用
- ✅ 单元测试通过
- ✅ 代码审查完成

**预计工时**: 31小时

---

#### Sprint 2: 完整API + 内容数据 + 基础UI（6-7天）

**目标**: 实现进度追踪功能，填充初始内容，开发基础前端

**任务列表**:
- [ ] T2.1 Progress API - Write Endpoints
  - `POST /api/training/progress/start`
  - `POST /api/training/progress/update`
  - `POST /api/training/progress/complete`
  - XP奖励计算集成
  - **工时**: 10小时

- [ ] T2.2 Content Data Population
  - 准备"十大招"内容数据（与内容团队协作）
  - 编写数据导入脚本
  - 填充 training_levels, skills, sub_skills, training_units
  - **工时**: 12小时（含内容准备）

- [ ] T2.3 Frontend - 训练计划主页改版
  - 重构 `client/src/pages/training.tsx`
  - 显示8个关卡卡片
  - 显示用户进度百分比
  - 锁定/解锁状态显示
  - **工时**: 8小时

- [ ] T2.4 Frontend - 关卡地图页面增强
  - 在 `client/src/pages/levels.tsx` 中添加地图视图
  - 展示技能树结构
  - 可视化进度路径
  - **工时**: 10小时

- [ ] T2.5 Custom Hooks
  - `useTrainingLevels()`
  - `useTrainingLevel(levelId)`
  - `useTrainingUnit(unitId)`
  - `useTrainingProgress()`
  - 添加到 `client/src/hooks/`
  - **工时**: 5小时

- [ ] T2.6 集成测试
  - E2E测试：完整的训练流程
  - API集成测试
  - **工时**: 6小时

**Sprint 2 交付物**:
- ✅ 所有6个API端点可用
- ✅ 初始内容数据已导入
- ✅ 2个前端页面基础版本完成
- ✅ 集成测试通过

**预计工时**: 51小时

---

#### Sprint 3: 完整UI + 专项训练 + 测试 + 发布（5天）

**目标**: 完成所有UI，实现专项训练，全面测试，生产发布

**任务列表**:
- [ ] T3.1 Frontend - 专项训练列表页面
  - 新页面: `client/src/pages/specialized-training.tsx`
  - 显示8大核心技能分类
  - 难度级别筛选
  - **工时**: 6小时

- [ ] T3.2 Frontend - 训练单元详情页面
  - 新页面: `client/src/pages/training-unit.tsx`
  - 根据 unitType 渲染不同内容
  - 进度追踪UI
  - 完成按钮交互
  - **工时**: 8小时

- [ ] T3.3 Specialized Training API
  - `GET /api/specialized-trainings`
  - `GET /api/specialized-trainings/{id}/plans`
  - **工时**: 4小时

- [ ] T3.4 UI/UX Polish
  - 响应式设计调整
  - 动画和过渡效果
  - 加载状态优化
  - 错误处理UI
  - **工时**: 6小时

- [ ] T3.5 全面测试
  - 回归测试
  - 性能测试
  - 移动端测试
  - 浏览器兼容性测试
  - **工时**: 8小时

- [ ] T3.6 文档更新
  - API文档
  - 用户使用指南
  - 技术文档更新
  - **工时**: 3小时

- [ ] T3.7 Production Deployment
  - 环境变量配置验证
  - Vercel部署
  - 数据库migration执行
  - Smoke testing
  - **工时**: 3小时

**Sprint 3 交付物**:
- ✅ 所有前端页面完成
- ✅ 专项训练功能可用
- ✅ 全面测试通过
- ✅ 生产环境部署成功

**预计工时**: 38小时

---

### 4.2 总体时间线

| Sprint | 开始日期 | 结束日期 | 工作日 | 预计工时 |
|--------|---------|---------|--------|---------|
| Sprint 1 | 2025-11-11 | 2025-11-15 | 5天 | 31小时 |
| Sprint 2 | 2025-11-18 | 2025-11-26 | 7天 | 51小时 |
| Sprint 3 | 2025-11-27 | 2025-12-03 | 5天 | 38小时 |
| **总计** | | | **17天** | **120小时** |

---

## 五、质量保证

### 5.1 Definition of Done (DoD)

每个任务必须满足：
- [ ] 代码通过TypeScript strict模式检查
- [ ] 单元测试覆盖率 ≥80%
- [ ] 所有测试通过（npm run test）
- [ ] Code review已完成并批准
- [ ] 无console.error或未处理的Promise rejection
- [ ] 符合ESLint规则
- [ ] 文档已更新（如有API变更）

### 5.2 测试策略

**单元测试**:
- 所有API endpoint处理函数
- 数据库查询函数
- 数据验证逻辑
- 工具函数

**集成测试**:
- API完整请求/响应流程
- 数据库事务完整性
- 认证/授权流程

**E2E测试**:
- 用户注册 -> 选择训练 -> 完成单元 -> 获得XP
- 关卡解锁逻辑
- 进度持久化

### 5.3 Code Review标准

**必须检查项**:
- 类型安全：无any类型使用
- 错误处理：所有async函数有try-catch
- 安全：输入验证，SQL注入防护
- 性能：避免N+1查询，合理使用索引
- 可读性：清晰的命名，适当的注释
- 一致性：遵循项目代码风格

---

## 六、风险管理

### 6.1 技术风险

| 风险 | 影响 | 概率 | 缓解策略 |
|------|------|------|---------|
| JSONB查询性能问题 | 高 | 中 | 提前进行性能测试，必要时添加GIN索引 |
| 数据库迁移失败 | 高 | 低 | 本地充分测试，保留回滚脚本 |
| 前端状态管理复杂度 | 中 | 中 | 使用TanStack Query缓存，避免prop drilling |
| API响应时间过长 | 中 | 低 | 实现分页，使用数据库连接池 |

### 6.2 项目风险

| 风险 | 影响 | 概率 | 缓解策略 |
|------|------|------|---------|
| 内容数据准备延迟 | 高 | 中 | 提前准备示例数据，并行开发 |
| 需求变更 | 中 | 中 | 采用敏捷方法，Sprint间调整 |
| 时间估算不准确 | 中 | 高 | 预留20%缓冲时间 |
| 团队成员缺席 | 高 | 低 | 交叉培训，文档完善 |

---

## 七、DevOps 配置

### 7.1 Git Workflow

**分支策略**:
```
main (生产)
  ↑
develop (开发主分支)
  ↑
feature/v2.1-training-system (本次开发)
  ↑
feature/v2.1-sprint-1-database
feature/v2.1-sprint-2-api
feature/v2.1-sprint-3-ui
```

**提交规范**:
```
feat: 添加训练关卡API端点
fix: 修复进度更新时的XP计算错误
refactor: 重构训练单元内容类型定义
test: 添加训练进度API集成测试
docs: 更新API文档
```

### 7.2 CI/CD Pipeline

**GitHub Actions配置** (.github/workflows/v2.1-ci.yml):

```yaml
name: V2.1 CI/CD

on:
  push:
    branches: [ feature/v2.1-* ]
  pull_request:
    branches: [ develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run check
      - run: npm run test
      - run: npm run build

  deploy-preview:
    needs: test
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### 7.3 环境变量（新增）

```bash
# Vercel Environment Variables
DATABASE_URL=postgresql://...  # 已有
VITE_SUPABASE_URL=https://...  # 已有
VITE_SUPABASE_ANON_KEY=...     # 已有
SUPABASE_SERVICE_ROLE_KEY=...  # 已有
SESSION_SECRET=...             # 已有
OPENAI_API_KEY=...             # 已有

# V2.1 新增（如需要）
VITE_TRAINING_CONTENT_CDN=https://cdn.example.com  # 内容CDN URL
```

---

## 八、监控与成功指标

### 8.1 技术指标

- **构建成功率**: ≥95%
- **测试覆盖率**: ≥80%
- **API响应时间**: P95 < 500ms
- **错误率**: <1%
- **部署频率**: 每Sprint至少1次

### 8.2 业务指标

- **用户完成率**: 第一周内至少10%用户完成第一个训练单元
- **留存率**: 7日留存率 ≥40%
- **训练时长**: 平均每日训练时长 ≥15分钟
- **进度完成度**: 30天内至少30%用户完成第一招

---

## 九、发布计划

### 9.1 Beta发布

**时间**: 2025-11-26（Sprint 2结束）
**对象**: 内部测试用户（50人）
**功能范围**:
- 前3招系统训练可用
- 基础UI功能
- 进度追踪

**收集反馈**:
- Bug报告
- UX改进建议
- 性能问题

### 9.2 正式发布

**时间**: 2025-12-03（Sprint 3结束）
**对象**: 全体用户
**功能范围**:
- 完整10招系统训练
- 8大专项训练
- 完整UI/UX
- 所有测试通过

**发布清单**:
- [ ] 生产数据库备份
- [ ] 环境变量验证
- [ ] Smoke测试通过
- [ ] 监控配置就绪
- [ ] 回滚计划准备
- [ ] 用户通知准备

---

## 十、附录

### 10.1 关键决策记录

**决策1**: 使用JSONB存储训练单元内容
- **理由**: 提供最大灵活性，未来可轻松扩展新内容类型
- **权衡**: 查询性能略低于结构化字段，但可通过索引优化

**决策2**: 独立的user_training_progress表
- **理由**: 清晰的数据结构，易于查询和维护
- **权衡**: 增加表数量，但提高了数据完整性

**决策3**: 3个Sprint的分阶段交付
- **理由**: 降低风险，每个Sprint都有可演示的增量价值
- **权衡**: 需要更细致的任务拆分和依赖管理

### 10.2 参考资料

- [Drizzle ORM文档](https://orm.drizzle.team/)
- [Supabase文档](https://supabase.com/docs)
- [TanStack Query文档](https://tanstack.com/query)
- [Vercel部署指南](https://vercel.com/docs)
- [PostgreSQL JSONB文档](https://www.postgresql.org/docs/current/datatype-json.html)

### 10.3 联系人

- **项目负责人**: [待填写]
- **后端开发**: [待填写]
- **前端开发**: [待填写]
- **内容团队**: [待填写]
- **QA**: [待填写]

---

**文档结束**

本文档将随着开发进展持续更新。所有变更将通过Git提交历史追踪。
