# “中八大师之路”V2.1 - 第一阶段开发需求文档

## 模块一：后端设计 (数据库与API)

**目标**：建立一个可扩展、结构清晰的数据库和API，用于存储和管理“傅家俊十大招”及“专项训练”的全部内容。

---

### 1. 数据库设计 (PostgreSQL + Drizzle ORM)

为了支持新增的训练内容，我们需要引入以下几张新表，并可能需要扩展现有表。

#### 1.1 `skills` - 十大招主表

存储“十大招”的顶层信息。

```sql
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,       -- 如: "第一招：基本功"
    description TEXT,                  -- 如: "掌握最核心的台球动作基础"
    skill_order INT NOT NULL UNIQUE    -- 招式顺序 (1-10)
);
```

#### 1.2 `sub_skills` - 子技能表 (关卡组)

存储每一招下的具体子技能或关卡组。

```sql
CREATE TABLE sub_skills (
    id SERIAL PRIMARY KEY,
    skill_id INT NOT NULL REFERENCES skills(id), -- 关联到`skills`表
    title VARCHAR(100) NOT NULL,                 -- 如: "1.1 手架"
    description TEXT,                            -- 如: "让每杆手架稳定支撑为止"
    sub_skill_order INT NOT NULL                 -- 子技能在招式内的顺序
);
```

#### 1.3 `training_units` - 训练单元表 (具体关卡)

存储每个子技能下的具体训练单元（理论、练习、挑战）。

```sql
CREATE TABLE training_units (
    id SERIAL PRIMARY KEY,
    sub_skill_id INT NOT NULL REFERENCES sub_skills(id), -- 关联到`sub_skills`表
    unit_type VARCHAR(20) NOT NULL CHECK (unit_type IN ('theory', 'practice', 'challenge')), -- 单元类型
    title VARCHAR(255) NOT NULL,                         -- 如: "理论：手架的五种基本类型"
    content JSONB,                                       -- 存储详细内容 (文本、图片URL、视频URL等)
    goal_description TEXT,                               -- 过关要求描述, 如: "连续完成10次V型手架击球不失误"
    xp_reward INT DEFAULT 10,                            -- 完成奖励的经验值
    unit_order INT NOT NULL                              -- 单元在子技能内的顺序
);
```

#### 1.4 `specialized_trainings` - 专项训练主表

存储8大专项训练的顶层信息。

```sql
CREATE TABLE specialized_trainings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,       -- 如: "基本功专项"
    description TEXT,                  -- 如: "针对性强化你的站位、手架和出杆稳定性"
    icon_name VARCHAR(50)              -- 用于前端展示的图标文件名, 如: "basics.svg"
);
```

#### 1.5 `specialized_training_plans` - 专项训练计划表

存储每个专项下的具体训练计划。

```sql
CREATE TABLE specialized_training_plans (
    id SERIAL PRIMARY KEY,
    training_id INT NOT NULL REFERENCES specialized_trainings(id), -- 关联到`specialized_trainings`表
    title VARCHAR(100) NOT NULL,                                 -- 如: "手架稳定性训练"
    description TEXT,                                            -- 训练计划的详细介绍
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')), -- 难度等级
    estimated_time_minutes INT,                                  -- 预计训练时长
    content JSONB                                                -- 包含训练步骤、方法、次数等详细信息
);
```

---

### 2. 后端API设计 (RESTful API)

以下是为实现内容填充所需的核心API接口。

#### 2.1 系统训练 (十大招) API

- **`GET /api/skills`**
  - **功能**: 获取所有“十大招”的列表，并附带用户的学习进度。
  - **返回**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "title": "第一招：基本功",
      "description": "掌握最核心的台球动作基础",
      "skill_order": 1,
      "progress": {
        "completed_sub_skills": 2, // 已完成的子技能数
        "total_sub_skills": 5      // 总子技能数
      }
    },
    // ... 其他九招
  ]
  ```

- **`GET /api/skills/:skill_id`**
  - **功能**: 获取某一招下的所有子技能（关卡组）列表，并附带用户完成状态。
  - **返回**: `200 OK`
  ```json
  {
    "skill_title": "第一招：基本功",
    "sub_skills": [
      {
        "id": 1,
        "title": "1.1 手架",
        "description": "让每杆手架稳定支撑为止",
        "status": "completed" // 'completed', 'unlocked', 'locked'
      },
      {
        "id": 2,
        "title": "1.2 站位",
        "description": "找到最稳固的身体姿态",
        "status": "unlocked"
      }
    ]
  }
  ```

- **`GET /api/sub_skills/:sub_skill_id`**
  - **功能**: 获取某个子技能下的所有训练单元（理论、练习、挑战）。
  - **返回**: `200 OK`
  ```json
  {
    "sub_skill_title": "1.1 手架",
    "units": [
      {
        "id": 1,
        "unit_type": "theory",
        "title": "理论：手架的五种基本类型",
        "content": { "text": "...", "image": "..." },
        "status": "completed"
      },
      {
        "id": 2,
        "unit_type": "practice",
        "title": "练习：V型手架击球",
        "goal_description": "连续完成10次V型手架击球不失误",
        "xp_reward": 15,
        "status": "unlocked"
      }
    ]
  }
  ```

#### 2.2 专项训练 API

- **`GET /api/specialized-trainings`**
  - **功能**: 获取所有专项训练的列表。
  - **返回**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "title": "基本功专项",
      "description": "针对性强化你的站位、手架和出杆稳定性",
      "icon_name": "basics.svg"
    },
    // ... 其他七个专项
  ]
  ```

- **`GET /api/specialized-trainings/:training_id`**
  - **功能**: 获取某个专项下的所有训练计划。
  - **返回**: `200 OK`
  ```json
  {
    "training_title": "基本功专项",
    "plans": [
      {
        "id": 1,
        "title": "手架稳定性训练",
        "difficulty": "medium",
        "estimated_time_minutes": 30
      },
      {
        "id": 2,
        "title": "出杆直线度校准",
        "difficulty": "hard",
        "estimated_time_minutes": 45
      }
    ]
  }
  ```

- **`GET /api/training-plans/:plan_id`**
  - **功能**: 获取某个具体训练计划的详细内容。
  - **返回**: `200 OK`
  ```json
  {
    "id": 1,
    "title": "手架稳定性训练",
    "description": "...",
    "difficulty": "medium",
    "estimated_time_minutes": 30,
    "content": {
      "steps": [
        { "step": 1, "instruction": "...", "reps": 20 },
        { "step": 2, "instruction": "...", "duration_seconds": 180 }
      ]
    }
  }
  ```

### 3. 验收标准

- [ ] 所有数据库表结构已使用 Drizzle ORM 在开发环境中正确创建。
- [ ] 所有 API 接口均已实现，并通过工具（如 Postman）测试，能够返回与设计文档一致的JSON格式和数据结构。
- [ ] API 能够正确处理用户认证，并根据用户ID返回对应的进度和状态。
- [ ] 数据库中已预置至少一个“招式”和一个“专项训练”的样本数据，用于前端开发人员接口调试。
# 模块二：系统训练内容数据

**目标**：提供“傅家俊十大招”的完整内容，用于填充数据库。

**格式**：以下内容将以JSON数组的形式提供，可以直接用于数据库的`skills`, `sub_skills`, 和 `training_units`表的填充。

---

### 1. `skills` 表数据

```json
[
  { "id": 1, "title": "第一招：基本功", "description": "掌握最核心的台球动作基础", "skill_order": 1 },
  { "id": 2, "title": "第二招：发力", "description": "学会控制母球的力量和速度", "skill_order": 2 },
  { "id": 3, "title": "第三招：高效五分点", "description": "建立精准的瞄准系统", "skill_order": 3 },
  { "id": 4, "title": "第四招：准度", "description": "提升击球的准确性", "skill_order": 4 },
  { "id": 5, "title": "第五招：杆法", "description": "精通各种杆法，控制母球走位", "skill_order": 5 },
  { "id": 6, "title": "第六招：分离角", "description": "理解母球与目标球的分离规律", "skill_order": 6 },
  { "id": 7, "title": "第七招：走位", "description": "为下一杆球创造更好的位置", "skill_order": 7 },
  { "id": 8, "title": "第八招：轻松清蛇彩", "description": "掌握连续得分的节奏和策略", "skill_order": 8 },
  { "id": 9, "title": "第九招：技能", "description": "学习各种特殊情况下的高级技巧", "skill_order": 9 },
  { "id": 10, "title": "第十招：思路", "description": "培养大局观和战术思维", "skill_order": 10 }
]
```

### 2. `sub_skills` 和 `training_units` 表数据 (以第一招为例)

这是一个嵌套的结构，展示了每一招、每一个子技能、以及每一个训练单元的完整内容。

```json
[
  {
    "skill_order": 1,
    "sub_skills": [
      {
        "sub_skill_order": 1,
        "title": "1.1 站位与姿势",
        "description": "找到最稳固的身体姿态",
        "units": [
          {
            "unit_order": 1,
            "unit_type": "theory",
            "title": "理论：核心站位要点",
            "content": {
              "text": "正确的站位是稳定击球的基石。核心要点包括：1. 双脚与肩同宽，主力腿（通常是后手侧的腿）稍稍靠后。2. 身体重心均匀分布在双脚上。3. 上半身俯身，下巴靠近球杆，保持水平视线。",
              "image": "/images/skills/stance_diagram.png"
            }
          },
          {
            "unit_order": 2,
            "unit_type": "practice",
            "title": "练习：站位重复性训练",
            "goal_description": "重复20次从站立到俯身准备的动作，每次都感受重心和视线的位置。",
            "xp_reward": 10
          }
        ]
      },
      {
        "sub_skill_order": 2,
        "title": "1.2 手架",
        "description": "让每杆手架稳定支撑为止",
        "units": [
          {
            "unit_order": 1,
            "unit_type": "theory",
            "title": "理论：开放式与封闭式手架",
            "content": {
              "text": "开放式手架（V型手架）适用于大部分击球，提供良好视野。封闭式手架（环形手架）在需要强力击球或精确控制时使用，能提供更强的稳定性。",
              "video": "/videos/skills/bridge_types.mp4"
            }
          },
          {
            "unit_order": 2,
            "unit_type": "practice",
            "title": "练习：V型手架稳定性",
            "goal_description": "使用V型手架，将母球沿直线从底库击打到顶库并返回，连续10次母球不碰到左右库边。",
            "xp_reward": 15
          },
          {
            "unit_order": 3,
            "unit_type": "challenge",
            "title": "挑战：高低杆手架切换",
            "goal_description": "交替进行一次高杆和一次低杆击球，连续完成5组（10次击球）手架不变形。",
            "xp_reward": 25
          }
        ]
      },
      {
        "sub_skill_order": 3,
        "title": "1.3 出杆",
        "description": "保证出杆的平、直、稳",
        "units": [
          {
            "unit_order": 1,
            "unit_type": "theory",
            "title": "理论：钟摆式出杆",
            "content": {
              "text": "出杆应像钟摆一样，只有小臂在动，大臂和手腕保持稳定。运杆要平顺，出杆要果断，击球后有自然的延伸动作。"
            }
          },
          {
            "unit_order": 2,
            "unit_type": "practice",
            "title": "练习：空杆直线训练",
            "goal_description": "不放球，沿着开球线进行空杆练习，感受球杆的直线运动，持续5分钟。",
            "xp_reward": 10
          }
        ]
      }
    ]
  }
  // ... 此处应包含第二招到第十招的完整数据
]
```

**注意**：为简洁起见，这里只展示了第一招的部分内容。在实际交付给Claude Code时，需要将我之前整理的《傅家俊台球十大招完整知识库》中的全部内容，按照这个JSON格式进行转换和填充。

### 3. 验收标准

- [ ] 数据库中已成功填充所有十大招、其下的所有子技能、以及每个子技能下的所有训练单元的完整数据。
- [ ] 数据结构与后端API的设计完全匹配。
- [ ] 图片和视频路径为占位符，但格式正确，方便后续替换。
# 模块三：专项训练内容数据

**目标**：提供8个专项训练的完整内容，用于填充数据库。

**格式**：以下内容将以JSON数组的形式提供，可以直接用于数据库的`specialized_trainings`和`specialized_training_plans`表的填充。

---

### 1. `specialized_trainings` 表数据

```json
[
  { "id": 1, "title": "基本功专项", "description": "针对性强化你的站位、手架和出杆稳定性", "icon_name": "basics.svg" },
  { "id": 2, "title": "发力专项", "description": "精准控制母球的力量与速度，实现细腻的控球", "icon_name": "power.svg" },
  { "id": 3, "title": "高效五分点专项", "description": "建立可靠的瞄准系统，让进球成为本能", "icon_name": "aiming.svg" },
  { "id": 4, "title": "准度专项", "description": "提升各种角度和距离下的击球成功率", "icon_name": "accuracy.svg" },
  { "id": 5, "title": "杆法专项", "description": "精通高、中、低、加塞等杆法，随心所欲控制母球", "icon_name": "cueing.svg" },
  { "id": 6, "title": "分离角专项", "description": "深入理解母球与目标球的碰撞分离规律", "icon_name": "separation.svg" },
  { "id": 7, "title": "走位专项", "description": "为下一杆创造绝佳机会，从单颗到连续的艺术", "icon_name": "positioning.svg" },
  { "id": 8, "title": "清蛇彩专项", "description": "系统性练习连续清彩能力，提升清台效率", "icon_name": "pattern.svg" }
]
```

### 2. `specialized_training_plans` 表数据

这是一个嵌套的结构，展示了每一个专项及其下的所有训练计划的完整内容。

```json
[
  {
    "training_id": 1, // 基本功专项
    "plans": [
      {
        "title": "手架稳定性强化",
        "description": "通过一系列静态和动态练习，打造岩石般稳固的手架。",
        "difficulty": "medium",
        "estimated_time_minutes": 30,
        "content": {
          "steps": [
            { "step": 1, "instruction": "静止支撑练习：保持V型手架姿势，将球杆置于手架上，保持3分钟不动，感受手指和手掌的支撑点。", "duration_seconds": 180 },
            { "step": 2, "instruction": "慢速推拉练习：将母球放在开球线，极慢速地将母球推至顶库并返回，重复20次，手架不能有任何晃动。", "reps": 20 },
            { "step": 3, "instruction": "长台击球练习：长台击打对岸的底袋目标球，完成10次成功击球。", "goal": "10次成功" }
          ]
        }
      },
      {
        "title": "出杆直线度校准",
        "description": "通过经典的空杆和瓶子练习，确保你的出杆绝对笔直。",
        "difficulty": "hard",
        "estimated_time_minutes": 45,
        "content": {
          "steps": [
            { "step": 1, "instruction": "空杆出杆：沿开球线进行空杆练习，杆头始终保持在一条直线上，持续5分钟。", "duration_seconds": 300 },
            { "step": 2, "instruction": "瓶口练习：在球台一端放置一个瓶口向上的空瓶子，从另一端出杆，杆头需能穿过瓶口而不碰到瓶壁，连续成功30次。", "reps": 30 }
          ]
        }
      }
    ]
  },
  {
    "training_id": 2, // 发力专项
    "plans": [
      {
        "title": "大力定杆训练",
        "description": "练习长距离大力击打，让母球停在原地。",
        "difficulty": "hard",
        "estimated_time_minutes": 30,
        "content": {
          "steps": [
            { "step": 1, "instruction": "将目标球放置于置球点，母球放置于开球线后。大力击打目标球入底袋，要求母球尽可能停在原地（移动范围不超过一个球直径）。", "reps": 30, "goal": "成功率达到70%" }
          ]
        }
      },
      {
        "title": "三力控制练习",
        "description": "练习区分大、中、小三种力量，为精确走位打下基础。",
        "difficulty": "medium",
        "estimated_time_minutes": 40,
        "content": {
          "steps": [
            { "step": 1, "instruction": "小力推击：将母球从底库推至顶库再返回，要求母球停在底库与开球线之间。重复10次。", "reps": 10 },
            { "step": 2, "instruction": "中力推击：将母球从底库推至顶库再返回，要求母球停在开球线与中线之间。重复10次。", "reps": 10 },
            { "step": 3, "instruction": "大力推击：将母球从底库推至顶库再返回，要求母球停在中线与顶库之间。重复10次。", "reps": 10 }
          ]
        }
      }
    ]
  },
  {
    "training_id": 7, // 走位专项
    "plans": [
      {
        "title": "一库走位练习",
        "description": "学习利用一次库边反弹来控制母球到下一个目标球的位置。",
        "difficulty": "easy",
        "estimated_time_minutes": 25,
        "content": {
          "steps": [
            { "step": 1, "instruction": "摆放一个简单的角度球，击打目标球入袋后，让母球吃一库走到指定区域（用巧粉盒标记）。重复练习20次。", "reps": 20, "goal": "母球停在目标区域内15次以上" }
          ]
        }
      },
      {
        "title": "两库走位练习",
        "description": "学习利用两次库边反弹进行长距离或精细角度的走位。",
        "difficulty": "medium",
        "estimated_time_minutes": 35,
        "content": {
          "steps": [
            { "step": 1, "instruction": "摆放一个需要两库走位的球形，击打目标球入袋后，让母球吃两库走到下一个目标球的理想位置。重复练习20次。", "reps": 20, "goal": "成功走位12次以上" }
          ]
        }
      }
    ]
  }
  // ... 此处应包含所有8个专项及其下所有训练计划的完整数据
]
```

**注意**：为简洁起见，这里只详细展示了“基本功专项”、“发力专项”和“走位专项”的部分内容。在实际交付给Claude Code时，需要将所有8个专项训练及其下的所有计划，按照这个JSON格式进行完整填充。

### 3. 验收标准

- [ ] 数据库中已成功填充所有8个专项训练及其下的所有训练计划的完整数据。
- [ ] 数据结构与后端API的设计完全匹配。
- [ ] 每个训练计划都包含清晰的描述、难度、预计时长和详细的训练步骤。
# 模块四：前端UI/UX设计

**目标**：将新增的“系统训练”和“专项训练”内容，以清晰、直观、有吸引力的方式呈现给用户。

---

### 1. 训练计划主页 (`/training-plan`)

此页面作为“系统训练”、“专项训练”和“自主训练”的总入口，需要进行改版。

**UI布局**：
- **顶部**：保留“每日目标”模块。
- **中部**：分为两个并排或上下排列的大卡片。
  - **左/上卡片：“系统训练：中八大师之路”**
    - 显示一个醒目的标题和“傅家俊十大招”的图标。
    - 显示一个总进度条，例如“已完成 3/10 招”。
    - 显示当前正在学习的招式，例如“正在进行：第三招 高效五分点”。
    - 一个“继续学习”的按钮，直接跳转到用户上次离开的关卡。
  - **右/下卡片：“专项训练道场”**
    - 显示标题“专项训练”。
    - 使用图标网格（4x2）的形式，展示8个专项训练的入口（基本功、发力、准度等）。
    - 每个图标下方显示专项的名称。
- **底部**：保留“自主训练”入口，但可以适当缩小尺寸。

**交互逻辑**：
- 点击“系统训练”卡片或“继续学习”按钮，跳转到“十大招”的关卡地图页面 (`/levels`)。
- 点击“专项训练”中的任意一个图标，跳转到该专项的训练计划列表页面 (`/specialized-training/:training_id`)。

### 2. 系统训练 - 关卡地图页面 (`/levels`)

此页面目前已实现得很好，主要是**内容展示的增强**。

**UI布局**：
- **关卡节点**：当用户点击一个关卡节点（例如“1.2 手架”）时，弹出的模态框需要重新设计。
- **模态框设计**：
  - **顶部**：显示子技能标题（“1.2 手架”）和描述。
  - **中部**：垂直列出该子技能下的所有训练单元（理论、练习、挑战）。
    - 每个训练单元应显示其类型（用图标表示：书本📖代表理论，哑铃💪代表练习，奖杯🏆代表挑战）、标题和完成状态（已完成/未锁定/已锁定）。
    - “理论”单元可以直接点击查看内容。
    - “练习”和“挑战”单元旁边有一个“开始”按钮。

**交互逻辑**：
- 只有完成了前一个单元，下一个单元才会解锁。
- 点击“理论”单元，弹出一个新的模态框或页面，展示理论内容（文本、图片、视频）。
- 点击“练习”或“挑战”的“开始”按钮，进入训练界面。

### 3. 专项训练 - 计划列表页面 (`/specialized-training/:training_id`)

这是一个新页面，用于展示某个专项下的所有训练计划。

**UI布局**：
- **页面标题**：显示专项的名称，例如“基本功专项”。
- **计划列表**：以卡片列表的形式，垂直展示该专项下的所有训练计划。
- **计划卡片**：每张卡片应包含：
  - 训练计划的标题（例如“手架稳定性强化”）。
  - 难度等级（用不同颜色的标签表示：简单-绿色，中等-蓝色，困难-红色）。
  - 预计训练时长（例如“预计30分钟”）。
  - 一个“查看详情”或“开始训练”的按钮。

**交互逻辑**：
- 点击卡片或按钮，跳转到该训练计划的详情页面 (`/training-plan/:plan_id`)。

### 4. 专项训练 - 计划详情页面 (`/training-plan/:plan_id`)

这是一个新页面，用于展示一个具体训练计划的详细步骤。

**UI布局**：
- **页面标题**：显示训练计划的名称。
- **信息栏**：在标题下方，用图标和文字显示难度、预计时长、总步骤数。
- **步骤列表**：清晰地列出该计划的所有训练步骤。
  - 每个步骤应包含：步骤编号、详细的操作说明、以及目标（次数、时长或成功率）。
- **底部**：一个醒目的“开始训练”按钮。

**交互逻辑**：
- 点击“开始训练”按钮，进入一个引导式的训练界面。
- 训练界面可以是一个计时器，或者是一个需要用户手动确认完成每个步骤的交互式列表。

### 5. 验收标准

- [ ] “训练计划”主页已按照新设计进行改版，入口清晰。
- [ ] “关卡地图”页面的关卡模态框已更新，能正确展示理论、练习、挑战等训练单元。
- [ ] 新增的“专项训练计划列表”和“计划详情”页面已开发完成，并能从后端API正确获取和展示数据。
- [ ] 所有页面的UI风格与现有设计保持一致，交互流畅，没有明显的卡顿或错误。
- [ ] 在不同屏幕尺寸下（特别是移动端）的响应式布局表现良好。
