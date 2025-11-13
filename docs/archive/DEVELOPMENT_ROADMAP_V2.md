# 《耶氏台球》V2.0 开发路线图

**文档版本**: 1.0
**创建日期**: 2025-11-10
**负责人**: 开发团队
**状态**: 待批准

---

## 📋 执行摘要

### 项目愿景
将《耶氏台球》从"训练记录工具"升级为"沉浸式台球技能成长伴侣"，通过游戏化机制和结构化课程体系，帮助用户在三个月内实现"一杆清台"的目标。

### 核心交付成果
1. **游戏化激励系统**：连胜纪录、每日目标、即时反馈、成就徽章
2. **系统训练模块**：傅家俊"十大招"完整课程体系
3. **专项训练模块**：8大核心技能强化道场
4. **完整UI/UX重构**：移动优先的现代化界面

### 总体时间线
- **项目周期**: 11周（2025-11-17 ~ 2026-02-14）
- **总工作量**: 85人/天
- **团队配置**: 1名后端工程师 + 1名前端工程师

### 关键成功指标
- **短期（MVP上线后）**: 日活跃度（DAU）提升30%+，次日留存率提升20%+
- **中期（完整课程上线后）**: 平均连续使用天数（Streak）>7天
- **长期（成就系统上线后）**: 90天清台挑战完成率>15%

---

## 🎯 产品范围与优先级矩阵

### 功能模块优先级定义
- **P0 (必须有)**: 核心功能，MVP必备，直接影响产品价值
- **P1 (应该有)**: 重要功能，显著提升体验，第二阶段交付
- **P2 (可以有)**: 增强功能，锦上添花，资源允许时交付

### 优先级矩阵

| 功能模块 | 具体功能点 | 优先级 | 所属Phase | 价值/理由 |
|---------|-----------|--------|----------|----------|
| **游戏化机制** | 每日目标系统（50/100/200 XP） | **P0** | Phase 1 | 核心激励循环，提升日活 |
| **游戏化机制** | 即时反馈（S/A/B/C评级） | **P0** | Phase 1 | 强化训练成就感，提供明确反馈 |
| **游戏化机制** | 连胜纪录强化（🔥火焰标志） | **P1** | Phase 3 | 培养每日训练习惯 |
| **游戏化机制** | 技能生疏机制（15天） | **P1** | Phase 3 | 智能引导科学复习 |
| **游戏化机制** | 成就徽章系统 | **P1** | Phase 5 | 满足长期挑战欲 |
| **游戏化机制** | 三个月清台挑战 | **P2** | Phase 5 | 强化产品卖点 |
| **系统训练** | 第一招：基本功（2章节，10关卡） | **P0** | Phase 2 | 核心课程内容 |
| **系统训练** | 第二招：发力 | **P0** | Phase 2 | 核心课程内容 |
| **系统训练** | 第三招：高效五分点 | **P0** | Phase 2 | 核心课程内容 |
| **系统训练** | 第四招~第十招 | **P1** | Phase 4 | 完整课程体系 |
| **专项训练** | 8大专项训练计划 | **P1** | Phase 4 | "哪里不行练哪里" |
| **UI/UX** | 训练火焰动画 | **P1** | Phase 3 | 视觉强化连胜概念 |
| **UI/UX** | 每日目标进度条 | **P0** | Phase 1 | 可视化目标进度 |
| **UI/UX** | 成就馆页面 | **P1** | Phase 5 | 展示用户荣誉 |
| **UI/UX** | 90天挑战页面 | **P2** | Phase 5 | 专属挑战展示 |

---

## 🗺️ 迭代路线图

### Phase 0: 技术基建与数据建模（1.5周）
**时间**: 2025-11-17 ~ 2025-11-26
**工作量**: 7人/天

#### 目标
在编码前，统一数据结构和接口协议，降低后期重构风险。

#### 核心任务
1. **数据库设计**：创建新表
   - `daily_goals` - 每日目标配置和完成记录
   - `training_ratings` - 训练评级记录（S/A/B/C）
   - `skill_mastery_status` - 技能精通状态追踪
   - `user_achievements` - 用户成就解锁记录
   - `system_training_progress` - 系统训练进度
   - `specialized_training_records` - 专项训练记录

2. **API设计**：定义所有新模块的API端点和数据契约

3. **核心算法POC**：
   - S/A/B/C评级算法伪代码
   - 技能生疏状态更新逻辑

4. **UI/UX组件库规划**：确定火焰动画、进度条等通用组件设计规范

#### 关键里程碑
- ✅ 数据库迁移脚本完成
- ✅ API接口文档评审通过
- ✅ 技术方案评审完成

#### 依赖
- 产品经理提供所有机制的精确数值和逻辑规则

---

### Phase 1: 核心激励循环（2.5周）
**时间**: 2025-11-27 ~ 2025-12-15
**工作量**: 18人/天

#### 目标
快速上线高频功能，让用户立即感受到新版本的价值。

#### 核心功能
1. **每日目标系统**
   - 后端：目标生成、进度更新、完成状态API
   - 前端：目标设定UI、进度条组件、达成庆祝动画
   - 目标选项：休闲玩家（50 XP）、认真球手（100 XP）、职业学徒（200 XP）

2. **即时反馈优化**
   - 后端：评级算法实现
   ```javascript
   // 评级逻辑伪代码
   function calculateRating(successRate) {
     if (successRate >= 0.9) return 'S'; // 90%+
     if (successRate >= 0.75) return 'A'; // 75%+
     if (successRate >= 0.6) return 'B';  // 60%+
     return 'C';                           // <60%
   }
   ```
   - 前端：S/A/B/C评级UI、激励性文案、音效

#### 数据库表设计

```sql
-- 每日目标表
CREATE TABLE daily_goals (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    goal_date DATE NOT NULL,
    target_xp INT NOT NULL,           -- 目标XP（50/100/200）
    completed_xp INT DEFAULT 0,       -- 已完成XP
    is_achieved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, goal_date)
);

-- 训练评级表
CREATE TABLE training_ratings (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    skill_id VARCHAR(50) NOT NULL,
    level_id VARCHAR(50) NOT NULL,
    rating ENUM('S', 'A', 'B', 'C') NOT NULL,
    success_rate DECIMAL(5,2),        -- 成功率
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_training_ratings_user_skill ON training_ratings(user_id, skill_id);
```

#### API端点

| Method | Path | 功能 |
|--------|------|------|
| GET | `/api/daily-goals/today` | 获取今日目标 |
| POST | `/api/daily-goals/set` | 设定每日目标 |
| GET | `/api/daily-goals/progress` | 获取今日进度 |
| POST | `/api/training-sessions/complete` | 提交训练结果并获取评级 |
| GET | `/api/training-ratings/history` | 获取历史评级记录 |

#### 前端组件

- `DailyGoalSelector.tsx` - 每日目标选择组件
- `DailyProgressBar.tsx` - 进度条组件（带动画）
- `TrainingResultModal.tsx` - 训练结束评级弹窗
- `RatingBadge.tsx` - S/A/B/C评级徽章组件

#### 关键里程碑
- ✅ MVP上线到生产环境
- ✅ UAT完成（5-10名种子用户测试）
- ✅ 用户反馈收集完成

#### 成功指标（KPIs）
- 每日目标设定率 > 60%
- 每日目标完成率 > 40%
- S/A评级获得率 > 50%

---

### Phase 2: 系统训练前三招（2周）
**时间**: 2025-12-16 ~ 2025-12-29
**工作量**: 14人/天

#### 目标
推出核心的"系统训练"模块，建立用户学习主线。

#### 核心功能
1. **系统训练模块框架**
   - 课程结构：招式（Skills）→ 章节（Episodes）→ 关卡（Stages）
   - 关卡类型：理论关卡（Theory）、训练关卡（Drill）、挑战关卡（Challenge）

2. **前三招内容集成**
   - 第一招：基本功（2章节，10关卡）
     - 章节一：稳固的根基（5关卡）
     - 章节二：笔直的出杆（5关卡）
   - 第二招：发力（4关卡）
   - 第三招：高效五分点（3关卡）

3. **技能树状态UI**（初步）
   - 展示招式的"精通"状态（暂无"生疏"）

#### 数据库表设计

```sql
-- 系统训练进度表
CREATE TABLE system_training_progress (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    skill_id VARCHAR(50) NOT NULL,    -- 招式ID (skill_01~skill_10)
    episode_id VARCHAR(50) NOT NULL,  -- 章节ID
    stage_id VARCHAR(50) NOT NULL,    -- 关卡ID
    status ENUM('locked', 'unlocked', 'completed') DEFAULT 'locked',
    completed_at TIMESTAMP,
    UNIQUE(user_id, stage_id)
);
CREATE INDEX idx_system_training_user_skill ON system_training_progress(user_id, skill_id);
```

#### 内容数据结构（JSON配置）

```json
{
  "skill_id": "skill_01",
  "name": "基本功",
  "episodes": [
    {
      "episode_id": "ep_01_01",
      "name": "稳固的根基",
      "stages": [
        {
          "stage_id": "s1.1.1",
          "type": "theory",
          "name": "万丈高楼平地起：认识四大动作",
          "content": "讲解手架、握杆、入位、姿势的重要性...",
          "xp_reward": 10
        },
        {
          "stage_id": "s1.1.2",
          "type": "drill",
          "name": "手架：稳如泰山",
          "instructions": "凤眼式手架练习：手掌紧贴台面...",
          "target": "完成5次，每次保持30秒",
          "xp_reward": 20
        }
      ]
    }
  ]
}
```

#### 关键里程碑
- ✅ 前三招课程内容上线
- ✅ 用户可以完成第一招的全部关卡
- ✅ 课程进度追踪正常工作

#### 依赖（⚠️ 关键）
- **内容团队必须交付前三招的最终内容**（文字、图片、视频链接）

---

### Phase 3: 留存机制强化（2周）
**时间**: 2025-12-30 ~ 2026-01-12
**工作量**: 13人/天

#### 目标
引入增强的连续行为激励和回归机制。

#### 核心功能
1. **连胜纪录强化**
   - 🔥火焰标志UI（动画效果）
   - 连胜天数显著展示
   - 每日完成首个训练后的庆祝动画

2. **技能生疏机制**
   - 后端定时任务：每日检测15天未练习的技能
   - 状态更新：精通 → 生疏
   - 前端UI：展示"生疏"状态及"巩固挑战"入口

3. **复活机制**（P2）
   - 允许用户通过特定方式恢复中断的连胜

#### 核心算法

```javascript
// 技能生疏状态更新（定时任务）
async function updateSkillMasteryStatus() {
  const RUSTY_THRESHOLD_DAYS = 15;
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - RUSTY_THRESHOLD_DAYS);

  // 查找所有状态为"精通"且超过15天未练习的记录
  const recordsToUpdate = await db.skillMasteryStatus.findMany({
    where: {
      status: '精通',
      lastCompletedAt: { lt: thresholdDate }
    }
  });

  // 批量更新为"生疏"
  await db.skillMasteryStatus.updateMany({
    where: { id: { in: recordsToUpdate.map(r => r.id) } },
    data: { status: '生疏', updatedAt: new Date() }
  });

  console.log(`技能生疏状态更新完成，共处理 ${recordsToUpdate.length} 条记录`);
}
```

#### 数据库表设计

```sql
-- 技能精通状态表
CREATE TABLE skill_mastery_status (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    skill_id VARCHAR(50) NOT NULL,
    status ENUM('精通', '生疏') DEFAULT '精通',
    last_completed_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, skill_id)
);
CREATE INDEX idx_skill_mastery_user ON skill_mastery_status(user_id);
```

#### API端点

| Method | Path | 功能 |
|--------|------|------|
| GET | `/api/mastery/status` | 获取所有技能精通状态 |
| POST | `/api/mastery/consolidate` | 完成巩固挑战 |
| GET | `/api/streak/current` | 获取当前连胜天数 |

#### 关键里程碑
- ✅ 连胜纪录火焰动画上线
- ✅ 技能生疏机制正常运行
- ✅ 定时任务稳定执行

---

### Phase 4: 完整课程体系（3周）
**时间**: 2026-01-13 ~ 2026-01-31
**工作量**: 22人/天

#### 目标
完善所有训练内容，构建最完整的台球技能库。

#### 核心功能
1. **系统训练内容补全**
   - 第四招：准度（7种瞄准方法）
   - 第五招：杆法（基础+高级杆法）
   - 第六招：分离角（90度法则）
   - 第七招：走位（点线面走位）
   - 第八招：轻松清蛇彩
   - 第九招：技能（9种高级技能）
   - 第十招：思路（进攻/防守/心态）

2. **专项训练模块**
   - 专项1：基本功（4个训练计划）
   - 专项2：发力（4个训练计划）
   - 专项3：高效五分点（3个训练计划）
   - 专项4：准度（4个训练计划）
   - 专项5：杆法（4个训练计划）
   - 专项6：分离角（3个训练计划）
   - 专项7：走位（4个训练计划）
   - 专项8：清蛇彩（3个训练计划）

#### 关键里程碑
- ✅ 十大招全部上线
- ✅ 专项训练模块上线
- ✅ UAT完成（扩大测试范围）

#### 依赖（⚠️ 关键）
- **所有剩余课程内容必须交付**

---

### Phase 5: 长期目标与成就（1.5周）
**时间**: 2026-02-02 ~ 2026-02-11
**工作量**: 11人/天

#### 目标
提供终极挑战和荣誉展示，满足高阶用户的追求。

#### 核心功能
1. **成就徽章系统**
   - 后端：成就触发器逻辑
   - 前端："成就馆"页面
   - 徽章类别：
     - **持之以恒**：铜（7天）、银（30天）、金（100天）、钻石（365天）
     - **技能大师**：完成各招式的所有挑战
     - **五分点之王**：定杆马拉松连续20颗
     - **清台狂人**：累计完成100次清蛇彩

2. **三个月清台挑战**
   - 90天倒计时系统
   - 每日打卡日历
   - 挑战专属页面

#### 数据库表设计

```sql
-- 用户成就表
CREATE TABLE user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    achievement_id VARCHAR(50) NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

-- 90天挑战表
CREATE TABLE ninety_day_challenge (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    start_date DATE NOT NULL,
    completed_days INT DEFAULT 0,
    status ENUM('active', 'completed', 'failed') DEFAULT 'active',
    UNIQUE(user_id, start_date)
);
```

#### 关键里程碑
- ✅ 成就系统上线
- ✅ 90天挑战上线
- ✅ Final Demo完成

---

## ⚠️ 风险管理总结

### 关键风险清单

| 风险ID | 风险描述 | 可能性 | 影响度 | 缓解策略 | 应急预案 |
|--------|---------|--------|--------|---------|---------|
| **R-01** | 课程内容无法按时交付 | 高 | 高 | 1. 建立内容交付时间表<br>2. 定义内容格式标准<br>3. 使用占位符内容开发 | Phase 2/4延期1周 |
| **R-02** | 技能生疏机制过于苛刻 | 中 | 中 | 1. 在Phase 3进行小范围UAT<br>2. 准备数值调整方案 | 将15天调整为30天 |
| **R-03** | 评级算法不被认可 | 中 | 中 | 1. Phase 1 UAT收集反馈<br>2. 提供算法可配置化 | 调整评级阈值 |
| **R-04** | 性能问题（定时任务） | 低 | 高 | 1. 技术预研验证<br>2. 优化查询逻辑 | 分批处理用户 |

---

## 📊 测试策略

### 单元测试
- **目标覆盖率**: 后端核心业务逻辑 > 80%
- **重点模块**: 评级算法、XP计算、技能状态更新

### 集成测试
- **关键场景**:
  - 用户完成训练 → 获得评级 → XP增加 → 每日目标进度更新
  - 技能完成 → 状态更新为"精通" → 15天后自动变"生疏"

### 用户验收测试（UAT）
- **UAT 1（Phase 1后）**: 5-10名种子用户，验证每日目标和评级系统
- **UAT 2（Phase 4后）**: 扩大到20-30名用户，验证完整课程体系

---

## 🎯 成功指标定义

### Phase 1 KPIs
- 每日目标设定率 > 60%
- 每日目标完成率 > 40%
- S/A评级获得率 > 50%

### Phase 2 KPIs
- 前三招完成率 > 30%
- 平均学习时长 > 20分钟/天

### Phase 3 KPIs
- 7天连胜达成率 > 25%
- 技能生疏后巩固率 > 60%

### Phase 4 KPIs
- 课程完整度（用户至少完成一招） > 50%
- 专项训练使用率 > 40%

### Phase 5 KPIs
- 徽章解锁率（至少1个） > 70%
- 90天挑战参与率 > 20%

---

## ✅ 下一步行动清单

### 立即执行（本周内）

1. **【P0】召开项目启动会**
   - 负责人：项目经理
   - 时间：本周三下午
   - 议程：宣讲开发蓝图、确认优先级、分配初期任务

2. **【P0】创建项目管理空间**
   - 负责人：产品经理
   - 工具：使用现有的项目管理系统
   - 任务：创建Phase 0-5的Epic和初期Story

3. **【P0】分发决策确认清单**
   - 负责人：产品负责人
   - 对象：业务方、内容团队
   - 截止：本周五

4. **【P0】技术栈确认与环境准备**
   - 负责人：技术负责人
   - 任务：确认所有新增技术组件、准备开发环境

### 下周执行

5. **【P1】Phase 0技术评审会**
   - 时间：下周一
   - 参与：全体开发团队
   - 产出：数据库设计最终方案、API契约文档

6. **【P1】与内容团队建立同步机制**
   - 时间：下周二
   - 形式：每周固定会议
   - 目标：明确内容交付时间表和格式规范

---

## 📋 决策确认清单

以下事项需要产品/业务负责人最终确认：

| 决策事项 | 建议方案 | 状态 | 最终决定 | 备注 |
|---------|---------|------|---------|------|
| **1. 优先级确认** | 维持当前P0/P1/P2划分 | ⏳ 待确认 | | 确保MVP聚焦 |
| **2. Phase 1范围确认** | 仅包含每日目标+即时反馈 | ⏳ 待确认 | | 其他功能后移 |
| **3. 技能生疏天数** | 15天 | ⏳ 待确认 | | 可根据UAT调整 |
| **4. 评级阈值确认** | S:90%, A:75%, B:60% | ⏳ 待确认 | | 基于行业标准 |
| **5. 内容交付时间表** | Phase 2前交付前三招 | ⏳ 待确认 | | 关键依赖 |
| **6. 成功指标确认** | 如上KPIs定义 | ⏳ 待确认 | | 基于市场基准 |

---

## 📝 附录

### A. 技术栈清单
- **前端**: React 18 + TypeScript + Vite + Tailwind CSS
- **后端**: Node.js + Express + TypeScript
- **数据库**: PostgreSQL (Supabase)
- **认证**: Supabase Auth
- **状态管理**: TanStack Query + Zustand
- **测试**: Vitest + React Testing Library + Playwright
- **CI/CD**: Vercel

### B. 团队协作机制
- **每日站会**: 每日上午10:00，15分钟
- **每周演示**: 每周五下午3:00，30分钟
- **代码审查**: 所有PR需至少1人批准
- **内容同步**: 每周二30分钟同步会

### C. 参考文档
- [产品升级计划V2.0原文](/Users/liasiloam/Vibecoding/1MyProducts/waytoheyball/WaytoHeyball_Product_Upgrade_Plan_V2.md)
- [Ultra MCP 规划输出](详见规划工具输出)

---

**文档结束**

*本文档为活文档（Living Document），将随项目进展持续更新。*
