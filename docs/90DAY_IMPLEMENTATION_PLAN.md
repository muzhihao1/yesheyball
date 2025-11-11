# 🛠️ 90天训练系统技术实施计划

## 概述
本文档详细说明如何将现有系统改造为90天十大招训练系统。

---

## 📊 现状分析

### 当前系统架构
1. **30天课程系统**（`server/dailyCourses.ts`）- 52集课程，用户按天学习
2. **Level 1-8系统**（V2.1） - 数据库中的训练级别
3. **tasks.tsx双Tab界面** - Tab1: 30天课程，Tab2: Level 4-8

### 存在的问题
- ❌ 30天和Level 1-8是两个独立系统，未融合
- ❌ 没有"傅家俊十大招"的明确分类
- ❌ 缺少专项训练模块
- ❌ 训练周期太短（52天）

---

## 🎯 改造目标

### 新系统架构
```
90天训练系统
├── 十大招系统训练（主线）
│   ├── 第1招：基本功（15天）
│   ├── 第2招：发力（15天）
│   ├── 第3招：高效五分点（7天）
│   ├── 第4招：准度（11天）
│   ├── 第5招：杆法（12天）
│   ├── 第6招：分离角（7天）
│   ├── 第7招：走位（9天）
│   ├── 第8招：轻松清蛇彩（7天）
│   ├── 第9招：技能（4天）
│   └── 第10招：思路（3天）
│
└── 专项训练（辅助）
    ├── 五分点精准训练
    ├── 力度分级训练
    └── 分离角精准控制
```

---

## 📝 数据库结构调整

### 第一步：创建十大招表（tencore_skills）

```sql
-- 创建十大招主表
CREATE TABLE tencore_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_number INTEGER NOT NULL UNIQUE CHECK (skill_number BETWEEN 1 AND 10),
  skill_name VARCHAR(50) NOT NULL,
  description TEXT,
  training_days INTEGER NOT NULL, -- 该招需要的训练天数
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入十大招数据
INSERT INTO tencore_skills (skill_number, skill_name, description, training_days, order_index) VALUES
(1, '基本功', '握杆、手架、站位、入位等台球基础', 15, 1),
(2, '发力', '大力、中力、小力三种力度控制', 15, 2),
(3, '高效五分点', '傅家俊五分点瞄准法', 7, 3),
(4, '准度', '平行法、重合法、度数法三大瞄准系统', 11, 4),
(5, '杆法', '高中低杆和加塞技术', 12, 5),
(6, '分离角', '90度分离角原理及力量配合', 7, 6),
(7, '走位', '点线面三维走位思维', 9, 7),
(8, '轻松清蛇彩', '清台能力和实战水平', 7, 8),
(9, '技能', '开球、翻袋、解球等特殊技术', 4, 9),
(10, '思路', '比赛心态和战术思维', 3, 10);
```

### 第二步：创建90天训练计划表（ninety_day_curriculum）

```sql
-- 创建90天训练计划表
CREATE TABLE ninety_day_curriculum (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number INTEGER NOT NULL UNIQUE CHECK (day_number BETWEEN 1 AND 90),
  tencore_skill_id UUID NOT NULL REFERENCES tencore_skills(id),
  training_type VARCHAR(20) NOT NULL CHECK (training_type IN ('系统', '专项', '测试', '理论', '考核')),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  original_course_ref VARCHAR(50), -- 原52集课程引用，如"第1集"
  objectives JSONB, -- 训练目标 ["目标1", "目标2"]
  key_points JSONB, -- 技术要点
  practice_requirements JSONB, -- 练习要求
  estimated_duration INTEGER, -- 预计训练时长（分钟）
  difficulty VARCHAR(10) CHECK (difficulty IN ('初级', '中级', '高级')),
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_ninety_day_curriculum_day ON ninety_day_curriculum(day_number);
CREATE INDEX idx_ninety_day_curriculum_skill ON ninety_day_curriculum(tencore_skill_id);
CREATE INDEX idx_ninety_day_curriculum_type ON ninety_day_curriculum(training_type);
```

### 第三步：创建专项训练表（specialized_training）

```sql
-- 创建专项训练表
CREATE TABLE specialized_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL, -- '五分点', '力度', '分离角'
  name VARCHAR(100) NOT NULL,
  description TEXT,
  training_method TEXT, -- 训练方法详细说明
  evaluation_criteria JSONB, -- 评估标准 {"初级": "...", "中级": "...", "高级": "..."}
  related_tencore_skills JSONB, -- 关联的十大招 [3, 4, 5]
  difficulty VARCHAR(10) CHECK (difficulty IN ('初级', '中级', '高级')),
  estimated_duration INTEGER, -- 预计训练时长（分钟）
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入专项训练数据
INSERT INTO specialized_training (category, name, description, training_method, evaluation_criteria, related_tencore_skills, difficulty, estimated_duration, order_index) VALUES
('五分点', '1分点瞄准训练', '练习1分点瞄准法', '摆放15个不同位置的球，使用1分点瞄准',
 '{"初级": "进球率>70%", "中级": "进球率>80%", "高级": "进球率>90%"}',
 '[3, 4]', '初级', 30, 1),

('力度', '小力训练（0.5-2米）', '精准控制小力度走位', '母球精准走位到0.5-2米范围内目标点',
 '{"初级": "误差±30cm", "中级": "误差±20cm", "高级": "误差±10cm"}',
 '[2, 7]', '初级', 20, 1),

('分离角', '小力分离角（70-85度）', '掌握小力击球的分离角', '使用小力击球，观察70-85度分离角变化',
 '{"初级": "能区分差异", "中级": "可预判±10度", "高级": "精准控制±5度"}',
 '[2, 6]', '中级', 25, 1);
```

### 第四步：创建用户训练进度表（user_ninety_day_progress）

```sql
-- 创建用户90天训练进度表
CREATE TABLE user_ninety_day_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  current_day INTEGER NOT NULL DEFAULT 1 CHECK (current_day BETWEEN 1 AND 90),
  completed_days JSONB DEFAULT '[]', -- 已完成的天数数组 [1, 2, 3]
  tencore_progress JSONB DEFAULT '{}', -- 十大招完成度 {"1": 60, "2": 40}
  specialized_progress JSONB DEFAULT '{}', -- 专项训练完成度
  total_training_time INTEGER DEFAULT 0, -- 总训练时长（分钟）
  last_training_date TIMESTAMP WITH TIME ZONE,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  estimated_completion_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

-- 创建索引
CREATE INDEX idx_user_ninety_day_progress_user ON user_ninety_day_progress(user_id);
```

---

## 🔧 后端API开发

### API结构

```typescript
// server/routes.ts 新增API

/**
 * GET /api/tencore/skills
 * 获取十大招列表
 */
app.get('/api/tencore/skills', isAuthenticated, async (req, res) => {
  // 返回十大招列表及每招的完成度
});

/**
 * GET /api/ninety-day/curriculum
 * 获取90天课程内容
 */
app.get('/api/ninety-day/curriculum', isAuthenticated, async (req, res) => {
  // 返回90天课程，支持按天查询或按招式查询
});

/**
 * GET /api/ninety-day/progress
 * 获取用户90天训练进度
 */
app.get('/api/ninety-day/progress', isAuthenticated, async (req, res) => {
  // 返回用户当前进度、完成度、十大招掌握情况
});

/**
 * POST /api/ninety-day/complete-day
 * 完成当天训练
 */
app.post('/api/ninety-day/complete-day', isAuthenticated, async (req, res) => {
  // 标记当天训练完成，更新进度
});

/**
 * GET /api/specialized-training
 * 获取专项训练列表
 */
app.get('/api/specialized-training', isAuthenticated, async (req, res) => {
  // 返回所有专项训练内容
});

/**
 * POST /api/specialized-training/complete
 * 完成专项训练
 */
app.post('/api/specialized-training/complete', isAuthenticated, async (req, res) => {
  // 记录专项训练完成情况和评分
});
```

---

## 💻 前端UI改造

### tasks.tsx改造方案

```typescript
// client/src/pages/tasks.tsx

// 新UI结构：
// 1. 顶部：90天进度条（当前第X天，完成度Y%）
// 2. 中部：当前训练内容（当天的课程）
// 3. 底部：两个Tab
//    - Tab1: 十大招系统训练（主线）
//    - Tab2: 专项训练（辅助）

export default function Tasks() {
  // 获取90天进度
  const { data: progress } = useNinetyDayProgress();

  // 获取当天课程
  const { data: todayCourse } = useTodayCourse(progress?.current_day);

  // 获取十大招列表
  const { data: tencoreSkills } = useTencoreSkills();

  // 获取专项训练列表
  const { data: specializedTraining } = useSpecializedTraining();

  return (
    <div className="p-4 space-y-6">
      {/* 90天进度条 */}
      <ProgressBar current={progress?.current_day} total={90} />

      {/* 当前训练内容 */}
      <CurrentTrainingCard course={todayCourse} />

      {/* Tab切换 */}
      <Tabs defaultValue="tencore">
        <TabsList>
          <TabsTrigger value="tencore">十大招系统训练</TabsTrigger>
          <TabsTrigger value="specialized">专项训练</TabsTrigger>
        </TabsList>

        {/* Tab1: 十大招 */}
        <TabsContent value="tencore">
          {tencoreSkills?.map(skill => (
            <TencoreSkillCard key={skill.id} skill={skill} />
          ))}
        </TabsContent>

        {/* Tab2: 专项训练 */}
        <TabsContent value="specialized">
          <SpecializedTrainingList items={specializedTraining} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 新增组件

1. **ProgressBar.tsx** - 90天进度条
2. **CurrentTrainingCard.tsx** - 当天训练内容卡片
3. **TencoreSkillCard.tsx** - 十大招卡片（显示完成度、剩余天数）
4. **SpecializedTrainingList.tsx** - 专项训练列表

---

## 📦 数据迁移策略

### 迁移步骤

1. **保留现有数据** - 不删除任何现有表
2. **创建新表** - 创建十大招相关的新表
3. **数据映射** - 将52集课程映射到90天计划
4. **用户迁移** - 现有用户自动开始90天训练

### 迁移SQL脚本

```sql
-- 1. 创建迁移脚本
-- sql/90day_migration.sql

BEGIN;

-- 创建新表（上面已定义）
-- ...

-- 迁移用户进度
INSERT INTO user_ninety_day_progress (user_id, current_day, start_date)
SELECT
  id as user_id,
  LEAST(current_day, 90) as current_day,
  NOW() as start_date
FROM users
WHERE current_day IS NOT NULL;

COMMIT;
```

---

## 🧪 测试计划

### 功能测试

| 测试项 | 测试内容 | 预期结果 |
|--------|----------|----------|
| 十大招列表 | GET /api/tencore/skills | 返回10个招式 |
| 90天课程 | GET /api/ninety-day/curriculum | 返回90天内容 |
| 用户进度 | GET /api/ninety-day/progress | 返回正确进度 |
| 完成训练 | POST /api/ninety-day/complete-day | 进度+1 |
| 专项训练 | GET /api/specialized-training | 返回专项内容 |

### UI测试

- [ ] 90天进度条显示正确
- [ ] 当天训练内容正确加载
- [ ] 十大招Tab显示10个招式
- [ ] 专项训练Tab显示所有专项
- [ ] 完成训练后进度更新

---

## 📅 实施时间线

### 第1阶段：数据库设计（1天）
- [ ] 创建新表结构
- [ ] 编写数据导入脚本
- [ ] 测试数据库结构

### 第2阶段：后端API开发（2天）
- [ ] 实现十大招API
- [ ] 实现90天课程API
- [ ] 实现专项训练API
- [ ] 实现进度追踪API

### 第3阶段：前端UI改造（3天）
- [ ] 改造tasks.tsx主页面
- [ ] 开发新组件（进度条、卡片等）
- [ ] 集成API
- [ ] 样式调整

### 第4阶段：测试与优化（2天）
- [ ] 功能测试
- [ ] UI/UX测试
- [ ] 性能优化
- [ ] Bug修复

### 第5阶段：部署上线（1天）
- [ ] 数据库迁移
- [ ] 生产环境部署
- [ ] 线上验证
- [ ] 用户通知

**总计：9天**

---

## 🔄 回滚方案

如果新系统出现问题，可以快速回滚：

1. **保留旧数据** - 所有旧表未删除
2. **Feature Flag** - 使用环境变量控制新旧系统
3. **数据备份** - 部署前完整备份数据库
4. **快速切换** - 修改前端路由即可切换

```typescript
// 环境变量控制
const USE_NINETY_DAY_SYSTEM = process.env.ENABLE_90DAY === 'true';

if (USE_NINETY_DAY_SYSTEM) {
  // 显示90天系统
} else {
  // 显示原30天系统
}
```

---

## 📊 监控指标

上线后需要监控的关键指标：

1. **用户参与度**
   - 日活用户数
   - 平均每日训练时长
   - 完成率（每日/每招/总体）

2. **系统性能**
   - API响应时间
   - 数据库查询性能
   - 前端加载速度

3. **用户反馈**
   - 用户满意度调查
   - 功能使用率
   - Bug报告数量

---

## ✅ 验收标准

### 功能完整性
- [x] 十大招系统完整实现
- [x] 90天课程内容完整录入
- [x] 专项训练功能可用
- [x] 进度追踪准确

### 性能要求
- [ ] 页面加载时间 < 2秒
- [ ] API响应时间 < 500ms
- [ ] 数据库查询优化

### 用户体验
- [ ] UI界面美观清晰
- [ ] 操作流程顺畅
- [ ] 移动端适配良好
- [ ] 无明显Bug

---

**文档版本**：V1.0
**创建日期**：2025-01-11
**作者**：Claude AI
**状态**：待审核
