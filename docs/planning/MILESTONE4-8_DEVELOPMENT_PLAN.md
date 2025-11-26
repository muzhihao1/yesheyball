# Milestone 4-8 开发计划

**项目**: 三个月一杆清台 - 核心留存功能开发
**计划制定日期**: 2025-11-26
**计划周期**: 3周（15个工作日）
**预期完成日期**: 2025-12-20
**文档版本**: v1.0

---

## 📋 执行摘要

### 当前状态
- ✅ **Milestone 3 (社交功能) 已完成**
  - 训练成绩分享卡系统
  - 好友邀请系统（邀请码+QR码）
  - 排行榜入口集成
  - 代码质量：TypeScript 100%通过，生产就绪

### 待开发里程碑
本计划覆盖5个里程碑（M4-M8），按优先级分为P0/P1/P2三个等级：

| 里程碑 | 名称 | 优先级 | 工期 | 状态 |
|--------|------|--------|------|------|
| **M4** | Onboarding完整流程 | P0 | 4天 | 待开发 |
| **M5** | Hero区重构 | P0 | 2-3天 | 待开发 |
| **M6** | 日常任务+连胜系统 | P0 | 2天 | 待开发 |
| **M7** | 训练记录体验优化 | P1 | 2-3天 | 待开发 |
| **M8** | 能力闭环+排行榜增强 | P2 | 2天 | 待开发 |

**总计**: 14-16天（考虑并行开发，实际15天完成）

### 核心目标
- **解决新用户流失问题**：通过引导流程让新用户理解产品价值（M4）
- **提升首屏吸引力**：3秒内传达核心价值（M5）
- **建立回访习惯**：通过日常任务和连胜激励每日打开（M6）
- **降低操作摩擦**：优化训练记录体验（M7）
- **增强数据驱动**：让用户数据指向行动（M8）

---

## 🎯 里程碑详细规划

## Milestone 4: Onboarding完整流程（P0）

**目标**: 新用户在首次登录后，通过"理解价值 → 水平测试 → 获取计划 → 开始训练"的完整引导，理解产品价值并开始使用。

**工期**: 4天（Day 1-4）

### 4.1 范围定义

#### 前端组件开发
1. **WelcomePage.tsx** - 欢迎页
   - 展示3个痛点共鸣文案
   - 品牌价值承诺
   - "开始水平测试"CTA按钮
   - 页面切换动画

2. **QuestionPage.tsx** - 水平测试页优化
   - 为每个选项添加hint提示
   - 添加进度指示器（"第X/4题"）
   - 优化选项按钮hover/selected状态
   - 返回上一题功能
   - 答案存储到state

3. **ResultPage.tsx** - 结果页
   - "正在生成专属计划..."加载动画
   - 显示推荐起始天数
   - 显示初始能力预估（5维雷达图）
   - ThreeDayPlanCard组件（复用设计）
   - 调用后端API保存结果

4. **路由强制跳转逻辑** - App.tsx修改
   - 检查onboardingCompleted状态
   - 新用户强制跳转/onboarding
   - localStorage + 后端双保险机制

#### 后端开发
1. **API开发**
   - `POST /api/onboarding/complete`
   - 接受参数：startDay, initialScores, answers
   - 返回：完成状态和用户信息

2. **数据库Schema**
   ```sql
   ALTER TABLE users
   ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE,
   ADD COLUMN recommended_start_day INTEGER,
   ADD COLUMN onboarding_answers JSONB;
   ```

3. **计分算法** (已定义)
   ```typescript
   function computeRecommendedStart(answers: AnswerMap) {
     const totalScore = QUESTIONS.reduce((sum, q) => {
       return sum + answers[q.id] * q.weight;
     }, 0);

     if (totalScore <= 2) return 1;    // 完全新手
     if (totalScore <= 4) return 5;    // 有点基础
     if (totalScore <= 6) return 10;   // 中等水平
     return 15;                         // 有经验
   }
   ```

### 4.2 技术复杂度
- **评级**: 中等
- **关键难点**:
  1. 路由拦截逻辑（避免影响老用户）
  2. 状态持久化（localStorage + 后端同步）
  3. 计分算法验证（单元测试覆盖）

### 4.3 工作量分配
- **前端**（前端开发A）: 2.5天
  - WelcomePage: 0.5天
  - QuestionPage优化: 0.5天
  - ResultPage + ThreeDayPlanCard: 1天
  - 路由逻辑: 0.5天

- **后端**（后端开发）: 1天
  - Schema设计: 0.25天
  - API开发: 0.5天
  - 测试: 0.25天

- **联调测试**: 0.5天

### 4.4 依赖关系
- ⚠️ **依赖设计稿**：3个页面设计（欢迎页、测试页、结果页）
- ✅ **无功能依赖**：可独立开发

### 4.5 验收标准
- [ ] 新用户首次登录自动跳转/onboarding
- [ ] 欢迎页显示3个痛点文案
- [ ] 4个测试问题可逐题作答，有进度指示
- [ ] 答题后显示推荐起始天数（1/5/10/15之一）
- [ ] 结果页显示未来3天训练计划卡片
- [ ] 点击"开始训练"跳转到/ninety-day-challenge
- [ ] 后端正确保存onboardingCompleted状态
- [ ] 老用户不受影响，直接进入挑战页
- [ ] TypeScript编译通过，无类型错误
- [ ] API响应时间 < 500ms

---

## Milestone 5: Hero区重构（P0）

**目标**: 3秒内传达产品价值，10秒内看到行动路径。

**工期**: 2-3天（Day 4-6，与M4部分并行）

### 5.1 范围定义

#### 前端组件开发
1. **主文案重构** - NinetyDayChallenge.tsx
   - 主标题："用90天，从新手到一杆清台"
   - 副标题："每天30分钟，已有1000+新手完成清台"
   - 主按钮：动态显示"开始我的第X天训练"

2. **MilestoneProgressBar.tsx** - 里程碑进度条
   - 三段式进度条（基础/进阶/实战）
   - 颜色渐变（浅绿→中绿→深绿）
   - 显示当前阶段和剩余天数
   - 使用shadcn/ui Progress组件

3. **真实背景图**
   - 准备台球场景高清图（1920x1080）
   - CSS背景图片 + 半透明overlay
   - 移动端background-position调整

4. **HowToStartGuide.tsx** - 三步引导
   - 三步卡片（测试→计划→训练）
   - 每步可点击跳转
   - 带图标和hover效果

### 5.2 技术实现

```css
/* 背景图实现 */
.hero-section {
  background-image:
    linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)),
    url('/assets/billiard-scene.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .hero-section {
    background-position: center 30%;
    background-attachment: scroll;
  }
}
```

### 5.3 技术复杂度
- **评级**: 低-中等
- **关键难点**:
  1. 进度条三段式颜色过渡效果
  2. 背景图移动端适配
  3. 响应式布局优化

### 5.4 工作量分配
- **前端**（前端开发B）: 2天
  - Header文案: 0.25天
  - MilestoneProgressBar: 0.5天
  - 背景图实现: 0.5天
  - HowToStartGuide: 0.75天

- **设计准备**: 0.5天（背景图选择/优化）
- **测试优化**: 0.5天（移动端适配）

### 5.5 依赖关系
- ⚠️ **依赖设计稿**：Hero区整体设计
- ⚠️ **依赖图片资源**：高质量背景图
- ✅ **无后端依赖**：纯前端工作
- ✅ **可并行开发**：与M4同时进行

### 5.6 验收标准
- [ ] 主标题"用90天，从新手到一杆清台"显示正确
- [ ] 副标题显示"已有1000+新手完成清台"
- [ ] 背景图在桌面端清晰显示
- [ ] 背景图在移动端正确适配（无拉伸变形）
- [ ] 进度条显示正确阶段（基础/进阶/实战）
- [ ] 主按钮动态显示"开始我的第X天训练"
- [ ] 点击主按钮滚动到训练表单
- [ ] "如何开始"三步可点击跳转
- [ ] 响应式布局在所有设备正常
- [ ] 首屏加载时间 < 3秒

---

## Milestone 6: 日常任务+连胜系统（P0）

**目标**: 每天给用户3个可完成的小任务，通过连胜机制激励每日打开。

**工期**: 2天（Day 7-8）

### 6.1 范围定义

#### 前端组件开发
1. **DailyGoalsPanel移植**
   - 检查现有DailyGoalsPanel组件
   - 移植到NinetyDayChallenge.tsx的Hero下方
   - 调整样式适配新位置
   - 完成任务显示XP奖励提示

2. **StreakIndicator.tsx** - 连胜指示器
   - 集成到header.tsx用户头像旁
   - 两种状态显示：
     - 今日已训练：🔥橙色高亮 + "连续训练X天"
     - 今日未训练：⚪灰色 + "今天还没训练，别断档"
   - Hover tooltip显示详细信息
     - 当前连胜
     - 最长连胜
     - 今日训练状态

#### 后端API验证
- `GET /api/goals/daily` - 返回今日任务列表
  ```typescript
  [
    { id: 1, text: "完成今日训练", reward: 20, completed: false },
    { id: 2, text: "复习一个理论知识", reward: 10, completed: false },
    { id: 3, text: "做5道练习题", reward: 15, completed: false },
  ]
  ```

- `GET /api/user/streak` - 返回连胜数据
  ```typescript
  {
    currentStreak: 3,
    longestStreak: 7,
    todayTrained: false,
    last7Days: [true, true, true, false, false, false, false]
  }
  ```

### 6.2 技术实现

```typescript
// StreakIndicator.tsx 核心实现
<Tooltip>
  <TooltipTrigger>
    <div className={cn(
      "flex items-center gap-1 px-2 py-1 rounded",
      todayTrained ? "bg-orange-100" : "bg-gray-100"
    )}>
      <Flame className={todayTrained ? "text-orange-500" : "text-gray-400"} />
      <span className={todayTrained ? "text-orange-600" : "text-gray-500"}>
        {currentStreak}
      </span>
    </div>
  </TooltipTrigger>
  <TooltipContent>
    <p>当前连胜: {currentStreak}天</p>
    <p>最长连胜: {longestStreak}天</p>
    <p>今日状态: {todayTrained ? "已完成 ✅" : "待训练 ⏰"}</p>
  </TooltipContent>
</Tooltip>
```

### 6.3 技术复杂度
- **评级**: 中等
- **关键难点**:
  1. 实时连胜更新（训练提交后需更新header状态）
  2. 今日训练判断逻辑（时区处理）
  3. 游戏化反馈（XP奖励动画效果）

### 6.4 工作量分配
- **前端**（前端开发A）: 1.5天
  - DailyGoalsPanel移植/调整: 0.5天
  - StreakIndicator组件: 0.75天
  - Tooltip和hover效果: 0.25天

- **后端验证**（后端开发）: 0.5天
  - API测试和数据验证
  - 可能的小修复

### 6.5 依赖关系
- ⚠️ **依赖后端API**: /api/goals/daily 和 /api/user/streak
- ⚠️ **依赖M4完成**: 需要训练记录系统正常工作
- ❌ **不可并行**: 必须在M4之后

### 6.6 验收标准
- [ ] 挑战页显示3个日常任务
- [ ] 任务列表正确获取自API
- [ ] 任务完成后显示+XP动画
- [ ] Header显示连胜火焰图标
- [ ] 今日已训练：橙色高亮🔥，显示连胜天数
- [ ] 今日未训练：灰色提示⚪，显示提醒文案
- [ ] Hover连胜显示tooltip（当前/最长/今日状态）
- [ ] 训练提交后实时更新连胜状态（无需刷新页面）
- [ ] 跨日期时连胜正确重置/延续
- [ ] 时区处理正确（UTC转本地时间）

---

## Milestone 7: 训练记录体验优化（P1）

**目标**: 降低表单摩擦，支持编辑最近记录。

**工期**: 2-3天（Day 9-11，与M4-M5部分并行）

### 7.1 范围定义

#### 前端组件开发
1. **TrainingForm预设按钮**
   - 添加4个预设选项按钮组
   ```typescript
   const PRESETS = [
     { total: 10, success: 5, label: "10球/5成功" },
     { total: 20, success: 10, label: "20球/10成功" },
     { total: 30, success: 15, label: "30球/15成功" },
     { total: 50, success: 25, label: "50球/25成功" },
   ];
   ```
   - 点击预设按钮自动填充数值
   - 保留手动输入选项

2. **滑条输入组件**
   - 使用shadcn/ui Slider组件
   - 双滑条实现：
     - 总击球次数：10-100
     - 成功次数：0-总击球次数（动态上限）
   - 实时显示当前值
   - 同步更新数字输入框

3. **友好提示改进**
   - 实时校验：成功次数 ≤ 总击球次数
   - 错误提示："成功次数不能大于总击球次数哦 😊"
   - 成功提示："太棒了！今日训练已完成 🎉"
   - 使用toast组件显示提示

4. **RecentRecordCard.tsx** - 最近记录卡片
   - 显示最近一次记录：
     - 时间："2小时前"
     - 球数："20/10"
     - 星级："⭐⭐⭐⭐"
   - 操作按钮：
     - "编辑"：重新打开表单，预填数据
     - "删除"：确认后删除

#### 后端API开发
- `PATCH /api/training-sessions/:id`
  - 更新训练记录
  - 权限检查（只能编辑自己的记录）

- `DELETE /api/training-sessions/:id`
  - 删除训练记录
  - 权限检查（只能删除自己的记录）

### 7.2 技术实现

```typescript
// 双滑条输入实现
<div className="space-y-4">
  <div>
    <Label>总击球次数: {totalBalls}</Label>
    <Slider
      value={[totalBalls]}
      onValueChange={(v) => {
        setTotalBalls(v[0]);
        // 确保成功次数不超过总次数
        if (successBalls > v[0]) {
          setSuccessBalls(v[0]);
        }
      }}
      min={10}
      max={100}
      step={5}
    />
  </div>

  <div>
    <Label>成功次数: {successBalls}</Label>
    <Slider
      value={[successBalls]}
      onValueChange={(v) => setSuccessBalls(v[0])}
      min={0}
      max={totalBalls}  // 动态上限
      step={1}
    />
  </div>
</div>
```

### 7.3 技术复杂度
- **评级**: 低-中等
- **关键难点**:
  1. 滑条双向绑定（成功次数不能超过总次数）
  2. 记录编辑的状态同步（表单预填+提交后刷新列表）
  3. 删除操作的二次确认

### 7.4 工作量分配
- **前端**（前端开发B）: 1.5天
  - 预设按钮: 0.25天
  - 滑条输入: 0.5天
  - RecentRecordCard: 0.5天
  - 编辑/删除功能: 0.25天

- **后端**（后端开发）: 1天
  - PATCH/DELETE API: 0.5天
  - 权限检查: 0.25天
  - 测试: 0.25天

- **测试**: 0.5天

### 7.5 依赖关系
- ✅ **无前置依赖**：优化现有功能
- ✅ **可并行开发**：与M4/M5同时进行

### 7.6 验收标准
- [ ] 训练表单有4个预设选项按钮
- [ ] 点击预设按钮正确填充数值
- [ ] 滑条可正确输入数值
- [ ] 成功次数滑条上限动态跟随总次数
- [ ] 实时校验生效（成功≤总数）
- [ ] Toast提示正确显示
- [ ] 最近记录卡片显示正确信息
- [ ] 点击"编辑"按钮预填表单数据
- [ ] 编辑提交后数据正确更新
- [ ] 删除操作有二次确认
- [ ] 删除后记录正确移除
- [ ] 只能编辑/删除自己的记录（权限检查）

---

## Milestone 8: 能力闭环+排行榜增强（P2）

**目标**: 数据指向行动，增加社交参照。

**工期**: 2天（Day 11-12，与M7部分并行）

### 8.1 范围定义

#### 前端组件开发
1. **WeaknessRecommendation.tsx** - 弱项推荐卡片
   - 集成到profile.tsx能力雷达图下方
   - 显示最低分能力项
   - 提供训练建议
   - 行动按钮：
     - "去专项训练" → 跳转/tasks#weakest-skill
     - "去完成今日训练" → 跳转/ninety-day-challenge

2. **排行榜Tab切换** - ranking.tsx修改
   - 实现Tab切换：
     - 周榜（默认）：最近7天训练时长
     - 月榜：最近30天训练时长
     - 总榜：总训练时长
   - 空态处理：
     - 显示："暂无数据，邀请好友一起占位"
     - "邀请好友"按钮（复用InviteModal）

3. **趋势图空态优化** - profile.tsx
   - 空态时不显示空白图表
   - 改为CTA按钮：
     - 文案："完成第一次训练，解锁成长曲线"
     - 点击跳转/ninety-day-challenge

#### 后端API增强
- `GET /api/ranking?period=week|month|all`
  - 支持时间范围参数
  - 返回对应时段的排行数据

### 8.2 技术实现

```typescript
// WeaknessRecommendation 核心逻辑
function computeWeakness(abilityScores: AbilityScores) {
  const entries = Object.entries(abilityScores);
  const [weakestSkill, weakestScore] = entries
    .sort(([,a], [,b]) => a - b)[0];

  const skillNameMap = {
    accuracy: { name: '准度', action: '瞄准训练' },
    positioning: { name: '走位', action: '定位球练习' },
    spin: { name: '杆法', action: '旋转球训练' },
    power: { name: '发力', action: '力量控制' },
    strategy: { name: '策略', action: '战术分析' },
  };

  return {
    skill: weakestSkill,
    score: weakestScore,
    ...skillNameMap[weakestSkill],
  };
}
```

### 8.3 技术复杂度
- **评级**: 低
- **关键难点**:
  1. 能力分数的实时计算和排序
  2. 排行榜缓存策略（避免频繁查询）
  3. Tab切换的数据加载优化

### 8.4 工作量分配
- **前端**（前端开发B）: 1.5天
  - WeaknessRecommendation: 0.5天
  - 排行榜Tab: 0.5天
  - 空态优化: 0.5天

- **后端**（后端开发）: 0.5天
  - 排行榜时间范围参数
  - 缓存策略实现

### 8.5 依赖关系
- ✅ **排行榜基础已存在**：M3完成
- ✅ **可独立开发**：无依赖

### 8.6 验收标准
- [ ] "我的"页显示弱项推荐卡片
- [ ] 弱项推荐正确识别最低分能力
- [ ] 点击"去专项训练"正确跳转
- [ ] 点击"去完成今日训练"正确跳转
- [ ] 挑战页和header都有排行榜入口
- [ ] 排行榜三个Tab（周/月/总）正常切换
- [ ] 排行榜数据按时间范围正确筛选
- [ ] 排行榜空态显示邀请好友CTA
- [ ] 趋势图空态显示训练CTA按钮
- [ ] 排行榜加载性能优化（缓存生效）

---

## 📅 开发时间表

### 第1周（Day 1-5）：P0核心功能

**目标**: 完成Onboarding和Hero区重构

| 天数 | 前端A（关键路径） | 前端B（并行路径） | 后端 | 测试 |
|------|------------------|------------------|------|------|
| **Day 1** | M4: WelcomePage开发 | M5: Hero区设计审查 | M4: API设计 | - |
| **Day 2** | M4: QuestionPage优化 | M5: MilestoneProgressBar | M4: Schema + API开发 | - |
| **Day 3** | M4: ResultPage开发 | M5: 背景图实现 | M4: API测试 | - |
| **Day 4** | M4: 路由逻辑 + 联调 | M5: HowToStartGuide | - | M4单元测试 |
| **Day 5** | M4: 完成测试 | M5: 完成测试 | - | M4+M5集成测试 |

**并行任务**:
- 前端B可在Day 1-2开始M7预设按钮和滑条开发
- 设计师Day 1-2完成M6任务面板和连胜指示器设计

### 第2周（Day 6-10）：P0完成+P1开始

**目标**: 完成任务+连胜系统，启动记录优化

| 天数 | 前端A | 前端B | 后端 | 测试 |
|------|-------|-------|------|------|
| **Day 6** | M6: DailyGoalsPanel移植 | M7: RecentRecordCard | M6: API验证 | - |
| **Day 7** | M6: StreakIndicator开发 | M7: 编辑/删除功能 | M7: PATCH/DELETE API | - |
| **Day 8** | M6: 联调 + 完成 | M7: 联调 | M7: 权限检查 | P0全面测试 |
| **Day 9** | 协助测试 | M7: 完成测试 | M7: API测试 | P0回归测试 |
| **Day 10** | **P0功能发布** | M8: WeaknessRecommendation | M8: 排行榜API增强 | P0生产验证 |

**里程碑**:
- Day 10: **P0功能灰度发布**（Onboarding + Hero + 任务连胜）

### 第3周（Day 11-15）：P2+测试部署

**目标**: 完成所有功能，全面测试和部署

| 天数 | 前端A | 前端B | 后端 | 测试 |
|------|-------|-------|------|------|
| **Day 11** | 协助测试 | M8: 排行榜Tab + 空态 | M8: 缓存策略 | M7功能测试 |
| **Day 12** | 协助测试 | M8: 完成 | - | **P1功能发布** |
| **Day 13** | 全面测试 | 全面测试 | Bug修复 | **回归测试** |
| **Day 14** | Bug修复 | Bug修复 | Bug修复 | **兼容性测试** |
| **Day 15** | 文档整理 | 文档整理 | 部署准备 | **P2功能发布** |

**里程碑**:
- Day 12: **P1功能发布**（训练记录优化）
- Day 15: **P2功能发布**（能力闭环+排行榜）

---

## 📊 资源分配

### 团队构成
- **前端开发A**（资深）: 关键路径（M4 → M6），协助测试
- **前端开发B**（中级）: 并行路径（M5 → M7 → M8）
- **后端开发**（1人）: 支持所有里程碑，按优先级切换
- **测试工程师**（1人）: 全程参与，Day 12-15重点投入
- **UI/UX设计师**（1人）: 提前1周交付设计稿

### 设计资源需求
- **M4**: 3个页面设计（欢迎页、测试页、结果页）
- **M5**: 1个Hero区整体设计 + 1张背景图
- **M6**: 2个组件设计（任务面板、连胜指示器）
- **M7**: 表单优化设计
- **M8**: 弱项推荐卡片设计

**设计排期**: Day -5 至 Day 2（提前完成）

### 工作量汇总
| 里程碑 | 前端 | 后端 | 测试 | 总计 |
|--------|------|------|------|------|
| M4 | 2.5天 | 1天 | 0.5天 | 4天 |
| M5 | 2天 | 0天 | 0.5天 | 2.5天 |
| M6 | 1.5天 | 0.5天 | 0天 | 2天 |
| M7 | 1.5天 | 1天 | 0.5天 | 3天 |
| M8 | 1.5天 | 0.5天 | 0天 | 2天 |
| **总计** | **9天** | **3天** | **1.5天** | **13.5天** |

**考虑并行和缓冲**: 实际15天完成（3周）

---

## ⚠️ 风险管理

### 技术风险

#### 风险1：Onboarding强制跳转影响老用户
- **影响**: 老用户登录后被迫进入引导流程
- **概率**: 中
- **应对策略**:
  1. 后端字段`onboardingCompleted`检查
  2. LocalStorage双保险
  3. 老用户自动设置`completed=true`（数据迁移脚本）
  4. 灰度发布：先10%新用户测试，48小时后100%

#### 风险2：Hero区背景图加载慢影响体验
- **影响**: 首屏加载时间增加
- **概率**: 高
- **应对策略**:
  1. WebP格式压缩（文件大小减少30-50%）
  2. 图片CDN加速（使用Vercel Image Optimization）
  3. 懒加载策略（below-the-fold内容延迟加载）
  4. Skeleton占位符（避免布局抖动）

#### 风险3：连胜系统时区问题
- **影响**: 跨时区用户的"今日训练"判断错误
- **概率**: 中
- **应对策略**:
  1. 服务器统一使用UTC时间存储
  2. 客户端转换为用户本地时区显示
  3. "今日"定义：用户当地时间0:00-23:59
  4. 充分测试：UTC+8（中国）、UTC-8（美国）、UTC+0（欧洲）

#### 风险4：训练记录编辑的并发冲突
- **影响**: 多设备编辑导致数据覆盖
- **概率**: 低
- **应对策略**:
  1. 乐观锁机制（添加`version`字段）
  2. 最后修改时间戳检查
  3. 冲突时提示用户刷新并重新编辑

### 资源风险

#### 风险5：设计资源延迟
- **影响**: 前端开发阻塞
- **概率**: 中
- **应对策略**:
  1. 设计稿提前1周启动（Day -5开始）
  2. 先交付低保真原型（Wireframe）
  3. 前端先实现逻辑，后套设计样式
  4. 建立设计组件库，提高复用率

#### 风险6：后端人力不足
- **影响**: API开发延迟，前端等待
- **概率**: 低
- **应对策略**:
  1. 前端Mock数据先行开发（使用MSW）
  2. API设计提前评审（OpenAPI/Swagger文档）
  3. 优先开发关键路径API（M4 → M6）
  4. 前端工程师支援简单API开发（Node.js/Express）

### 进度风险

#### 风险7：功能范围蔓延（Scope Creep）
- **影响**: 超期，质量下降
- **概率**: 高
- **应对策略**:
  1. 严格遵守MVP原则（Minimum Viable Product）
  2. 每日站会review进度和范围
  3. P2功能可延后到下个Sprint
  4. 建立变更控制流程（Change Request Form）
  5. 产品经理最终决策权

#### 风险8：测试时间被压缩
- **影响**: 质量问题遗漏到生产
- **概率**: 中
- **应对策略**:
  1. 开发阶段同步单元测试（TDD）
  2. 自动化测试脚本（Jest + React Testing Library）
  3. 预留3天测试buffer（Day 13-15）
  4. Bug优先级分级：P0（阻塞）、P1（严重）、P2（一般）、P3（优化）
  5. P2/P3 bug可延后修复

---

## ✅ 验收与测试

### 测试策略

#### 第1阶段：单元测试（开发中同步）
**负责人**: 各开发工程师
**工具**: Jest + React Testing Library + Vitest

**覆盖范围**:
- M4计分算法单元测试（`computeRecommendedStart`）
- M6连胜计算逻辑测试（`calculateStreak`）
- 组件渲染测试（所有新增组件）
- API接口测试（Postman/Newman）

**验收标准**:
- 单元测试覆盖率 > 80%
- 所有关键函数100%覆盖

#### 第2阶段：集成测试（Day 8, 12-13）
**负责人**: 测试工程师 + 前端开发A

**测试场景**:
- **新用户完整流程**:
  1. 注册 → 自动跳转Onboarding
  2. 完成水平测试 → 查看推荐计划
  3. 开始训练 → 完成Day 1
  4. 查看任务 → 获得XP奖励
  5. 分享成绩 → 生成分享图

- **老用户回访流程**:
  1. 登录 → 直接进入挑战页（不触发Onboarding）
  2. 查看连胜状态
  3. 完成训练 → 连胜+1
  4. 隔日登录 → 连胜延续

- **API集成测试**:
  - 前后端数据流验证
  - 错误处理和边界情况（401/403/404/500）

#### 第3阶段：系统测试（Day 13-14）
**负责人**: 全团队

**功能测试清单**:
- [ ] M4: Onboarding流程（10个用例）
- [ ] M5: Hero区展示（5个用例）
- [ ] M6: 任务+连胜（8个用例）
- [ ] M7: 训练记录优化（6个用例）
- [ ] M8: 能力闭环+排行榜（5个用例）

**兼容性测试**:
- 桌面浏览器:
  - [ ] Chrome (latest)
  - [ ] Safari (latest)
  - [ ] Firefox (latest)
  - [ ] Edge (latest)
- 移动浏览器:
  - [ ] iOS Safari (iOS 15+)
  - [ ] Chrome Android (latest)
- 平板:
  - [ ] iPad (Safari)

**性能测试**:
- [ ] 首屏加载时间 < 3秒（Lighthouse）
- [ ] API响应时间 P99 < 1秒
- [ ] 图片加载优化（WebP + CDN）
- [ ] 资源大小：JS < 500KB, CSS < 100KB

**安全测试**:
- [ ] XSS注入测试（输入框、URL参数）
- [ ] CSRF防护验证（POST请求）
- [ ] 认证授权测试（JWT过期、无效token）
- [ ] 权限测试（只能编辑/删除自己的记录）

#### 第4阶段：验收测试（Day 14）
**负责人**: 产品经理 + UI/UX设计师

**UAT（User Acceptance Testing）清单**:
- [ ] 产品经理走查所有功能点
- [ ] 设计师视觉还原度验收（>95%）
- [ ] 关键场景Smoke Test
- [ ] 回归测试（确保老功能未被破坏）

---

## 🚀 部署策略

### 分阶段发布计划

#### 阶段1：P0功能发布（Day 10）
**范围**: M4(Onboarding) + M5(Hero) + M6(任务+连胜)

**发布流程**:
1. **灰度发布10%新用户**
   - Feature Flag: `ENABLE_ONBOARDING=true` for 10% new users
   - 监控指标：
     - Onboarding完成率
     - 首屏加载时间
     - API错误率
   - 监控时长：24小时

2. **扩大到50%**（Day 10下午）
   - 如无P0/P1级别bug
   - 继续监控24小时

3. **100%全量发布**（Day 11）
   - 如无重大问题
   - 营销配合，推广新功能

**回滚计划**:
- Feature Flag快速关闭
- Nginx配置切回老版本
- 数据库回滚脚本（`onboarding_completed`字段置空）

#### 阶段2：P1功能发布（Day 12）
**范围**: M7(训练记录优化)

**发布流程**:
- 直接100%发布（优化类功能，风险低）
- 监控错误日志和用户反馈
- 关注表单提交成功率

#### 阶段3：P2功能发布（Day 15）
**范围**: M8(能力闭环+排行榜增强)

**发布流程**:
- 直接100%发布
- 营销配合，推广排行榜功能
- 鼓励用户邀请好友（排行榜空态CTA）

### 监控指标

#### 核心业务指标
1. **新用户留存率**
   - Day 1: 目标 > 60%（基线50%）
   - Day 7: 目标 > 30%（基线20%）
   - Day 30: 目标 > 15%（基线10%）

2. **引导完成率**
   - 目标 > 80%完成4题测试
   - 目标 > 70%点击"开始训练"

3. **日活用户（DAU）**
   - 目标较基线提升20%

4. **连胜用户占比**
   - 目标 > 30%用户有3天+连胜

5. **分享率**
   - 目标每完成训练5%用户分享

#### 技术指标
1. 首屏加载时间（P95）< 3秒
2. API响应时间（P99）< 1秒
3. 错误率 < 0.1%
4. 服务可用性 > 99.9%

#### 用户体验指标
1. NPS分数（Net Promoter Score）
2. 用户反馈情绪分析（正面/负面）
3. 训练记录提交成功率 > 99%

---

## 📋 里程碑验收标准

### Milestone 4 (Onboarding) 验收标准
**验收人**: 产品经理 + QA

- [ ] 新用户首次登录自动跳转/onboarding
- [ ] 欢迎页显示3个痛点文案
- [ ] 4个测试问题可逐题作答，有进度指示器
- [ ] 答题后显示推荐起始天数（1/5/10/15之一）
- [ ] 结果页显示未来3天训练计划卡片
- [ ] 点击"开始训练"跳转到/ninety-day-challenge
- [ ] 后端正确保存`onboardingCompleted`状态
- [ ] 老用户不受影响，直接进入挑战页
- [ ] TypeScript编译通过，无类型错误
- [ ] API `/api/onboarding/complete`响应时间 < 500ms
- [ ] 数据库字段正确创建
- [ ] localStorage与后端状态同步

### Milestone 5 (Hero区) 验收标准
**验收人**: UI/UX设计师 + 产品经理

- [ ] 主标题"用90天，从新手到一杆清台"显示正确
- [ ] 副标题显示"已有1000+新手完成清台"
- [ ] 背景图在桌面端清晰显示（无模糊、拉伸）
- [ ] 背景图在移动端正确适配（无拉伸变形）
- [ ] 进度条显示正确阶段（基础/进阶/实战）
- [ ] 进度条颜色渐变效果正常
- [ ] 主按钮动态显示"开始我的第X天训练"
- [ ] 点击主按钮滚动到训练表单
- [ ] "如何开始"三步可点击跳转
- [ ] 响应式布局在所有设备正常（Desktop/Tablet/Mobile）
- [ ] 首屏加载时间 < 3秒

### Milestone 6 (任务+连胜) 验收标准
**验收人**: 产品经理 + QA

- [ ] 挑战页显示3个日常任务
- [ ] 任务列表正确获取自API `/api/goals/daily`
- [ ] 任务完成后显示+XP动画
- [ ] Header显示连胜火焰图标
- [ ] 今日已训练：橙色高亮🔥，显示连胜天数
- [ ] 今日未训练：灰色提示⚪，显示提醒文案
- [ ] Hover连胜显示tooltip（当前/最长/今日状态）
- [ ] 训练提交后实时更新连胜状态（无需刷新页面）
- [ ] 跨日期时连胜正确重置/延续
- [ ] 时区处理正确（测试UTC+8、UTC-8、UTC+0）
- [ ] API `/api/user/streak`数据结构正确

### Milestone 7 (记录优化) 验收标准
**验收人**: QA + 前端开发A

- [ ] 训练表单有4个预设选项按钮
- [ ] 点击预设按钮正确填充数值
- [ ] 滑条可正确输入数值（0-100）
- [ ] 成功次数滑条上限动态跟随总次数
- [ ] 实时校验生效（成功≤总数）
- [ ] 错误提示toast正确显示
- [ ] 成功提示toast正确显示
- [ ] 最近记录卡片显示正确信息（时间/球数/星级）
- [ ] 点击"编辑"按钮预填表单数据
- [ ] 编辑提交后数据正确更新
- [ ] 删除操作有二次确认弹窗
- [ ] 删除后记录正确移除
- [ ] 只能编辑/删除自己的记录（权限检查）
- [ ] API `/api/training-sessions/:id` PATCH/DELETE正常工作

### Milestone 8 (能力闭环+排行榜) 验收标准
**验收人**: 产品经理 + QA

- [ ] "我的"页显示弱项推荐卡片
- [ ] 弱项推荐正确识别最低分能力（5维中最低）
- [ ] 弱项推荐显示具体训练建议
- [ ] 点击"去专项训练"正确跳转到/tasks#{skill}
- [ ] 点击"去完成今日训练"正确跳转到/ninety-day-challenge
- [ ] 挑战页和header都有排行榜入口
- [ ] 排行榜三个Tab（周/月/总）正常切换
- [ ] 排行榜数据按时间范围正确筛选
- [ ] 排行榜排序正确（训练时长降序）
- [ ] 排行榜空态显示"暂无数据，邀请好友一起占位"
- [ ] 排行榜空态"邀请好友"按钮正确打开邀请弹窗
- [ ] 趋势图空态显示"完成第一次训练，解锁成长曲线"CTA
- [ ] 排行榜加载性能优化（缓存生效，< 1秒）

---

## 🎯 成功标准

### 项目成功标准

**交付标准**:
- [ ] P0功能Day 10发布，灰度测试通过
- [ ] P1功能Day 12发布，无重大bug
- [ ] P2功能Day 15发布，全功能上线
- [ ] 技术债务为0，代码质量保持100% TypeScript通过
- [ ] 所有功能有完整文档和测试覆盖（>80%）

**业务指标**:
- [ ] 新用户Day 1留存率提升20%（50% → 60%）
- [ ] Onboarding完成率 > 80%
- [ ] 日活用户（DAU）提升15%
- [ ] 连胜用户占比 > 30%
- [ ] 训练记录提交成功率 > 99%

**技术指标**:
- [ ] 首屏加载时间P95 < 3秒
- [ ] API响应时间P99 < 1秒
- [ ] 错误率 < 0.1%
- [ ] 服务可用性 > 99.9%

**用户体验**:
- [ ] NPS分数 > 50（推荐者 > 批评者）
- [ ] 用户正面反馈 > 80%
- [ ] 无P0/P1级别用户投诉

---

## 📝 下一步行动

### 立即行动（Week 0, Day -5 至 Day 0）

**产品经理**:
- [ ] 召开项目启动会，对齐目标和时间表
- [ ] 完成M4-M6的详细PRD文档
- [ ] 与设计师确认设计排期

**UI/UX设计师**:
- [ ] Day -5: 开始M4欢迎页设计
- [ ] Day -4: 完成M4测试页、结果页设计
- [ ] Day -3: 开始M5 Hero区设计
- [ ] Day -2: 完成M6任务面板、连胜指示器设计
- [ ] Day -1: 设计师交付所有P0设计稿

**后端开发**:
- [ ] Day -2: M4 API设计评审（OpenAPI文档）
- [ ] Day -1: M6 API设计评审
- [ ] Day 0: 准备数据库迁移脚本

**前端开发**:
- [ ] Day -1: 搭建M4基础组件框架
- [ ] Day 0: 配置Mock服务（MSW）
- [ ] Day 0: 环境准备，依赖安装

**测试工程师**:
- [ ] Day 0: 准备测试用例模板
- [ ] Day 0: 配置自动化测试环境

### 项目启动会议议程（Day 0）

**时间**: 90分钟
**参与人**: 全团队

**议程**:
1. 项目目标和背景（10分钟）
2. 5个里程碑详细讲解（30分钟）
3. 时间表和资源分配（15分钟）
4. 风险识别和应对策略（15分钟）
5. 验收标准和测试计划（10分钟）
6. Q&A（10分钟）

**输出物**:
- 会议纪要
- 风险登记表
- 责任分配矩阵（RACI）

---

## 📚 附录

### A. 技术栈
- **前端**: React, TypeScript, Wouter, TanStack Query, shadcn/ui, Tailwind CSS
- **后端**: Node.js, Express, Drizzle ORM, PostgreSQL
- **部署**: Vercel, Vercel Blob Storage
- **测试**: Jest, React Testing Library, Vitest, Postman
- **CI/CD**: GitHub Actions, Vercel自动部署

### B. 相关文档
1. **DEVELOPMENT_ROADMAP.md** - 原始开发路线图
2. **MILESTONE3_COMPLETION_SUMMARY.md** - M3完成总结
3. **CLAUDE.md** - 技术架构文档
4. **shared/schema.ts** - 数据库Schema定义

### C. API文档
详见各里程碑的后端API说明：
- M4: `/api/onboarding/complete`
- M6: `/api/goals/daily`, `/api/user/streak`
- M7: `/api/training-sessions/:id` (PATCH/DELETE)
- M8: `/api/ranking?period=week|month|all`

### D. 代码规范
遵循项目现有规范：
- **组件命名**: PascalCase (ShareCard.tsx)
- **函数命名**: camelCase (handleSubmit)
- **常量命名**: UPPER_SNAKE_CASE (PRESET_OPTIONS)
- **文件命名**: kebab-case (training-form.tsx)
- **提交规范**: Conventional Commits
  ```
  feat: Add onboarding welcome page
  fix: Correct streak calculation logic
  refactor: Extract WeaknessRecommendation component
  docs: Update development plan
  ```

---

## 🔄 版本历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| v1.0 | 2025-11-26 | Claude | 初始版本，基于sequential-thinking深度分析 |

---

**下一步行动**:
1. ✅ Review开发计划（本文档）
2. 📅 召开项目启动会（Day 0）
3. 🎨 启动设计稿制作（Day -5至Day -1）
4. 💻 开始M4 Onboarding开发（Day 1）
5. 📝 每日Stand-up更新进度

---

*本文档由Claude Code使用Sequential Thinking深度分析生成，基于DEVELOPMENT_ROADMAP.md和MILESTONE3完成情况。*
*最后更新: 2025-11-26 16:30 CST*
