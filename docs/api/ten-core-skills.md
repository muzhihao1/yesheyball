# Ten Core Skills System V3 API Documentation
# 十大招系统V3 API文档

## 概览

本文档描述了十大招（Ten Core Skills）系统的所有API端点。该系统使用VARCHAR主键（如`skill_1`, `unit_1_1_1`）而非UUID。

**基础URL**: `http://localhost:5000` (开发环境)

**认证**: 部分端点需要用户认证（标记为🔒）

---

## 数据模型

### Skill (技能)
```typescript
{
  id: string;              // 'skill_1' to 'skill_10'
  title: string;           // "第一招：基本功"
  description: string;     // 技能描述
  skillOrder: number;      // 1-10
  iconName: string;        // 'basics.svg'
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### SubSkill (子技能)
```typescript
{
  id: string;              // 'sub_skill_1_1', 'sub_skill_1_2'
  skillId: string;         // 关联到skills.id
  title: string;           // "1.1 站位与姿势"
  description: string;
  subSkillOrder: number;   // 子技能顺序
  unlockCondition: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### TrainingUnit (训练单元)
```typescript
{
  id: string;              // 'unit_1_1_1', 'unit_1_1_2'
  subSkillId: string;      // 关联到sub_skills.id
  unitType: 'theory' | 'practice' | 'challenge';
  title: string;           // "理论：核心站位要点"
  content: {               // JSONB格式
    text: string;
    images?: string[];
    videos?: string[];
    keyPoints?: string[];
    steps?: string[];
  };
  goalDescription: string; // 过关目标
  xpReward: number;        // 经验值奖励
  unitOrder: number;       // 单元顺序
  estimatedMinutes: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### UserSkillProgress (用户技能进度)
```typescript
{
  id: number;
  userId: string;
  skillId: string;
  completedSubSkills: number;    // 已完成的子技能数
  totalSubSkills: number;        // 总子技能数
  progressPercentage: number;    // 进度百分比 0-100
  lastAccessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### UserUnitCompletion (用户单元完成记录)
```typescript
{
  id: number;
  userId: string;
  unitId: string;
  completedAt: Date;
  score: number | null;          // 0-100
  notes: string | null;
  xpEarned: number;
}
```

---

## API端点

### 1. 获取所有技能

**GET** `/api/skills-v3`

获取十大招列表（按skillOrder排序）

**请求**:
```bash
curl http://localhost:5000/api/skills-v3
```

**响应** (200 OK):
```json
{
  "skills": [
    {
      "id": "skill_1",
      "title": "第一招：基本功",
      "description": "掌握最核心的台球动作基础：站位、手架、出杆",
      "skillOrder": 1,
      "iconName": "basics.svg",
      "isActive": true,
      "createdAt": "2025-01-13T10:00:00.000Z",
      "updatedAt": "2025-01-13T10:00:00.000Z"
    },
    // ... skill_2 to skill_10
  ]
}
```

---

### 2. 获取单个技能

**GET** `/api/skills-v3/:skillId`

获取指定技能的详细信息

**路径参数**:
- `skillId` (string): 技能ID，如 `skill_1`

**请求**:
```bash
curl http://localhost:5000/api/skills-v3/skill_1
```

**响应** (200 OK):
```json
{
  "skill": {
    "id": "skill_1",
    "title": "第一招：基本功",
    "description": "掌握最核心的台球动作基础：站位、手架、出杆",
    "skillOrder": 1,
    "iconName": "basics.svg",
    "isActive": true,
    "createdAt": "2025-01-13T10:00:00.000Z",
    "updatedAt": "2025-01-13T10:00:00.000Z"
  }
}
```

**错误响应** (404):
```json
{
  "message": "Skill not found"
}
```

---

### 3. 获取技能的子技能列表

**GET** `/api/skills-v3/:skillId/sub-skills`

获取指定技能下的所有子技能（按subSkillOrder排序）

**路径参数**:
- `skillId` (string): 技能ID，如 `skill_1`

**请求**:
```bash
curl http://localhost:5000/api/skills-v3/skill_1/sub-skills
```

**响应** (200 OK):
```json
{
  "subSkills": [
    {
      "id": "sub_skill_1_1",
      "skillId": "skill_1",
      "title": "1.1 站位与姿势",
      "description": "找到最稳固的身体姿态",
      "subSkillOrder": 1,
      "unlockCondition": null,
      "isActive": true,
      "createdAt": "2025-01-13T10:00:00.000Z",
      "updatedAt": "2025-01-13T10:00:00.000Z"
    },
    {
      "id": "sub_skill_1_2",
      "skillId": "skill_1",
      "title": "1.2 手架",
      "description": "让每杆手架稳定支撑为止",
      "subSkillOrder": 2,
      "unlockCondition": null,
      "isActive": true,
      "createdAt": "2025-01-13T10:00:00.000Z",
      "updatedAt": "2025-01-13T10:00:00.000Z"
    },
    {
      "id": "sub_skill_1_3",
      "skillId": "skill_1",
      "title": "1.3 出杆",
      "description": "保证出杆的平、直、稳",
      "subSkillOrder": 3,
      "unlockCondition": null,
      "isActive": true,
      "createdAt": "2025-01-13T10:00:00.000Z",
      "updatedAt": "2025-01-13T10:00:00.000Z"
    }
  ]
}
```

---

### 4. 获取单个子技能

**GET** `/api/sub-skills-v3/:subSkillId`

获取指定子技能的详细信息

**路径参数**:
- `subSkillId` (string): 子技能ID，如 `sub_skill_1_1`

**请求**:
```bash
curl http://localhost:5000/api/sub-skills-v3/sub_skill_1_1
```

**响应** (200 OK):
```json
{
  "subSkill": {
    "id": "sub_skill_1_1",
    "skillId": "skill_1",
    "title": "1.1 站位与姿势",
    "description": "找到最稳固的身体姿态",
    "subSkillOrder": 1,
    "unlockCondition": null,
    "isActive": true,
    "createdAt": "2025-01-13T10:00:00.000Z",
    "updatedAt": "2025-01-13T10:00:00.000Z"
  }
}
```

---

### 5. 获取子技能的训练单元列表

**GET** `/api/sub-skills-v3/:subSkillId/units`

获取指定子技能下的所有训练单元（按unitOrder排序）

**路径参数**:
- `subSkillId` (string): 子技能ID，如 `sub_skill_1_1`

**请求**:
```bash
curl http://localhost:5000/api/sub-skills-v3/sub_skill_1_1/units
```

**响应** (200 OK):
```json
{
  "units": [
    {
      "id": "unit_1_1_1",
      "subSkillId": "sub_skill_1_1",
      "unitType": "theory",
      "title": "理论：核心站位要点",
      "content": {
        "text": "正确的站位是稳定击球的基石。核心要点包括：\n1. 双脚与肩同宽...",
        "image": "/images/skills/stance_diagram.png",
        "keyPoints": [
          "双脚与肩同宽",
          "重心分配80-15-5原则",
          "下巴靠近球杆",
          "保持水平视线"
        ]
      },
      "goalDescription": "阅读并理解核心站位要点",
      "xpReward": 5,
      "unitOrder": 1,
      "estimatedMinutes": 5,
      "isActive": true,
      "createdAt": "2025-01-13T10:00:00.000Z",
      "updatedAt": "2025-01-13T10:00:00.000Z"
    },
    {
      "id": "unit_1_1_2",
      "subSkillId": "sub_skill_1_1",
      "unitType": "practice",
      "title": "练习：站位重复性训练",
      "content": {
        "text": "重复20次从站立到俯身准备的动作...",
        "steps": [
          "自然站立，放松全身",
          "俯身到击球姿势",
          "感受重心分布",
          "检查视线是否水平",
          "起身，重复"
        ]
      },
      "goalDescription": "重复20次从站立到俯身准备的动作",
      "xpReward": 10,
      "unitOrder": 2,
      "estimatedMinutes": 10,
      "isActive": true,
      "createdAt": "2025-01-13T10:00:00.000Z",
      "updatedAt": "2025-01-13T10:00:00.000Z"
    }
  ]
}
```

---

### 6. 获取单个训练单元

**GET** `/api/training-units-v3/:unitId`

获取指定训练单元的详细信息（包含完整content JSONB数据）

**路径参数**:
- `unitId` (string): 训练单元ID，如 `unit_1_1_1`

**请求**:
```bash
curl http://localhost:5000/api/training-units-v3/unit_1_1_1
```

**响应** (200 OK):
```json
{
  "unit": {
    "id": "unit_1_1_1",
    "subSkillId": "sub_skill_1_1",
    "unitType": "theory",
    "title": "理论：核心站位要点",
    "content": {
      "text": "正确的站位是稳定击球的基石...",
      "image": "/images/skills/stance_diagram.png",
      "keyPoints": ["...", "..."]
    },
    "goalDescription": "阅读并理解核心站位要点",
    "xpReward": 5,
    "unitOrder": 1,
    "estimatedMinutes": 5,
    "isActive": true,
    "createdAt": "2025-01-13T10:00:00.000Z",
    "updatedAt": "2025-01-13T10:00:00.000Z"
  }
}
```

---

### 7. 获取用户技能进度 🔒

**GET** `/api/user/skills-v3/progress`

获取当前用户在所有技能中的学习进度

**认证**: 需要登录

**查询参数** (可选):
- `skillId` (string): 筛选特定技能的进度

**请求**:
```bash
# 获取所有技能进度
curl -H "Cookie: session_id=xxx" \
  http://localhost:5000/api/user/skills-v3/progress

# 获取特定技能进度
curl -H "Cookie: session_id=xxx" \
  "http://localhost:5000/api/user/skills-v3/progress?skillId=skill_1"
```

**响应** (200 OK):
```json
{
  "progress": [
    {
      "id": 1,
      "userId": "user123",
      "skillId": "skill_1",
      "completedSubSkills": 1,
      "totalSubSkills": 3,
      "progressPercentage": 33,
      "lastAccessedAt": "2025-01-13T15:30:00.000Z",
      "createdAt": "2025-01-13T10:00:00.000Z",
      "updatedAt": "2025-01-13T15:30:00.000Z"
    }
  ]
}
```

---

### 8. 获取用户单元完成记录 🔒

**GET** `/api/user/units-v3/completions`

获取当前用户完成的训练单元记录（按完成时间倒序）

**认证**: 需要登录

**查询参数** (可选):
- `unitId` (string): 筛选特定单元的完成记录

**请求**:
```bash
# 获取所有完成记录
curl -H "Cookie: session_id=xxx" \
  http://localhost:5000/api/user/units-v3/completions

# 获取特定单元的完成记录
curl -H "Cookie: session_id=xxx" \
  "http://localhost:5000/api/user/units-v3/completions?unitId=unit_1_1_1"
```

**响应** (200 OK):
```json
{
  "completions": [
    {
      "id": 5,
      "userId": "user123",
      "unitId": "unit_1_1_2",
      "completedAt": "2025-01-13T15:30:00.000Z",
      "score": 85,
      "notes": "站位练习完成，感觉不错",
      "xpEarned": 10
    },
    {
      "id": 3,
      "userId": "user123",
      "unitId": "unit_1_1_1",
      "completedAt": "2025-01-13T15:00:00.000Z",
      "score": null,
      "notes": null,
      "xpEarned": 5
    }
  ]
}
```

---

### 9. 完成训练单元 🔒

**POST** `/api/training-units-v3/:unitId/complete`

标记训练单元为已完成，自动更新用户技能进度和XP

**认证**: 需要登录

**路径参数**:
- `unitId` (string): 训练单元ID，如 `unit_1_1_1`

**请求体**:
```json
{
  "score": 90,           // 可选，0-100
  "notes": "练习很顺利"   // 可选，用户笔记
}
```

**请求**:
```bash
curl -X POST \
  -H "Cookie: session_id=xxx" \
  -H "Content-Type: application/json" \
  -d '{"score": 90, "notes": "练习很顺利"}' \
  http://localhost:5000/api/training-units-v3/unit_1_1_1/complete
```

**响应** (200 OK):
```json
{
  "message": "Training unit completed successfully",
  "completion": {
    "id": 10,
    "userId": "user123",
    "unitId": "unit_1_1_1",
    "completedAt": "2025-01-13T16:00:00.000Z",
    "score": 90,
    "notes": "练习很顺利",
    "xpEarned": 5
  }
}
```

**自动触发的副作用**:
1. 创建或更新 `user_unit_completions` 记录
2. 自动计算该子技能的完成进度
3. 更新或创建 `user_skill_progress` 记录
4. 如果子技能全部完成，自动增加 `completedSubSkills` 计数

**错误响应**:
```json
// 400 Bad Request - 评分无效
{
  "message": "Score must be between 0 and 100"
}

// 404 Not Found - 单元不存在
{
  "message": "Training unit not found: unit_1_1_999"
}

// 503 Service Unavailable - 数据库不可用
{
  "message": "Database not available"
}
```

---

### 10. 获取课程日关联的训练单元

**GET** `/api/curriculum/:dayNumber/units`

获取90天课程中某一天关联的训练单元列表

**路径参数**:
- `dayNumber` (number): 天数，1-90

**请求**:
```bash
curl http://localhost:5000/api/curriculum/1/units
```

**响应** (200 OK):
```json
{
  "units": [
    {
      "id": 1,
      "dayNumber": 1,
      "unitId": "unit_1_1_1",
      "unitOrder": 1,
      "isRequired": true,
      "createdAt": "2025-01-13T10:00:00.000Z"
    },
    {
      "id": 2,
      "dayNumber": 1,
      "unitId": "unit_1_1_2",
      "unitOrder": 2,
      "isRequired": true,
      "createdAt": "2025-01-13T10:00:00.000Z"
    }
  ]
}
```

**错误响应**:
```json
// 400 Bad Request
{
  "message": "Day number must be between 1 and 90"
}
```

---

## 典型使用流程

### 场景1：展示十大招技能树

```javascript
// 1. 获取所有技能
const { skills } = await fetch('/api/skills-v3').then(r => r.json());

// 2. 获取用户在每个技能的进度
const { progress } = await fetch('/api/user/skills-v3/progress').then(r => r.json());

// 3. 展示技能列表，显示进度百分比
skills.forEach(skill => {
  const userProgress = progress.find(p => p.skillId === skill.id);
  console.log(`${skill.title}: ${userProgress?.progressPercentage || 0}%`);
});
```

### 场景2：展示某个技能的详细学习路径

```javascript
const skillId = 'skill_1';

// 1. 获取技能信息
const { skill } = await fetch(`/api/skills-v3/${skillId}`).then(r => r.json());

// 2. 获取所有子技能
const { subSkills } = await fetch(`/api/skills-v3/${skillId}/sub-skills`).then(r => r.json());

// 3. 对每个子技能，获取训练单元
for (const subSkill of subSkills) {
  const { units } = await fetch(`/api/sub-skills-v3/${subSkill.id}/units`).then(r => r.json());
  console.log(`${subSkill.title} - ${units.length}个单元`);
}
```

### 场景3：用户完成一个训练单元

```javascript
const unitId = 'unit_1_1_1';

// 1. 获取单元详情
const { unit } = await fetch(`/api/training-units-v3/${unitId}`).then(r => r.json());

// 2. 用户学习/练习...

// 3. 完成单元
const result = await fetch(`/api/training-units-v3/${unitId}/complete`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    score: 95,
    notes: '掌握了站位要点'
  })
}).then(r => r.json());

console.log(`获得 ${result.completion.xpEarned} XP!`);

// 4. 刷新进度
const { progress } = await fetch('/api/user/skills-v3/progress?skillId=skill_1').then(r => r.json());
```

### 场景4：90天课程集成

```javascript
const dayNumber = 1;

// 1. 获取当天课程信息（使用现有90-day API）
const { curriculum } = await fetch(`/api/ninety-day/curriculum?dayNumber=${dayNumber}`).then(r => r.json());

// 2. 获取当天关联的训练单元
const { units } = await fetch(`/api/curriculum/${dayNumber}/units`).then(r => r.json());

// 3. 根据units获取详细训练内容
for (const mapping of units) {
  const { unit } = await fetch(`/api/training-units-v3/${mapping.unitId}`).then(r => r.json());
  console.log(`${unit.title} - ${unit.estimatedMinutes}分钟`);
}
```

---

## 错误处理

所有API遵循统一的错误响应格式：

```json
{
  "message": "错误描述信息"
}
```

**HTTP状态码**:
- `200` - 成功
- `400` - 请求参数错误
- `401` - 未认证（需要登录）
- `404` - 资源不存在
- `500` - 服务器内部错误
- `503` - 数据库不可用

---

## 前端开发建议

### 使用TanStack Query

```typescript
// hooks/useSkillsV3.ts
import { useQuery } from '@tanstack/react-query';

export function useSkillsV3() {
  return useQuery({
    queryKey: ['/api/skills-v3'],
    queryFn: () => fetch('/api/skills-v3').then(r => r.json()),
  });
}

export function useSubSkills(skillId: string) {
  return useQuery({
    queryKey: ['/api/skills-v3', skillId, 'sub-skills'],
    queryFn: () => fetch(`/api/skills-v3/${skillId}/sub-skills`).then(r => r.json()),
    enabled: !!skillId,
  });
}

export function useTrainingUnits(subSkillId: string) {
  return useQuery({
    queryKey: ['/api/sub-skills-v3', subSkillId, 'units'],
    queryFn: () => fetch(`/api/sub-skills-v3/${subSkillId}/units`).then(r => r.json()),
    enabled: !!subSkillId,
  });
}
```

### Mutation示例

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCompleteUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { unitId: string; score?: number; notes?: string }) =>
      fetch(`/api/training-units-v3/${params.unitId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: params.score, notes: params.notes }),
      }).then(r => r.json()),
    onSuccess: () => {
      // 刷新进度数据
      queryClient.invalidateQueries({ queryKey: ['/api/user/skills-v3/progress'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/units-v3/completions'] });
    },
  });
}
```

---

## 数据库状态

**当前已插入数据**:
- ✅ 10个技能基础信息 (skill_1 到 skill_10)
- ✅ 第一招完整数据：
  - 3个子技能 (sub_skill_1_1, sub_skill_1_2, sub_skill_1_3)
  - 9个训练单元 (unit_1_1_1 到 unit_1_3_2)
- ✅ 90天课程已全部映射到对应技能

**待补充数据**:
- ⏳ 第二招到第十招的详细数据（sub_skills和training_units）
- ⏳ 专项训练计划数据
- ⏳ 90天课程与训练单元的具体关联（curriculum_day_units表）

---

## 版本历史

- **v3.0.0** (2025-01-13): 初始版本，完成基础API和第一招数据

---

**文档维护者**: Claude Code Assistant
**最后更新**: 2025-01-13
