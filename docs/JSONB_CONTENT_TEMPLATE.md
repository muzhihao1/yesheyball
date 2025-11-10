# V2.1 Training Unit JSONB Content Templates

**文档版本**: 1.0
**创建日期**: 2025-11-10
**目的**: 定义 `training_units` 表中 `content` 字段的标准 JSONB 结构

---

## 概述

`training_units` 表的 `content` 字段使用 JSONB 格式存储，根据 `unitType` 不同，其内部结构也不同。本文档定义了三种类型的标准结构。

---

## TypeScript 类型定义

```typescript
// Theory Unit Content (理论关卡)
interface TheoryContent {
  type: 'theory';
  text: string;              // Markdown 格式的理论内容
  images: string[];          // 图片 URL 数组（可选）
  video: string;             // 视频 URL（可选，当前为空字符串）
}

// Practice Unit Content (练习关卡)
interface PracticeContent {
  type: 'practice';
  instructions: string;      // Markdown 格式的练习说明
  demo_video: string;        // 示范视频 URL（可选，当前为空字符串）
  success_criteria: {        // 成功标准
    type: 'repetitions' | 'duration' | 'accuracy' | 'custom';
    target?: number;         // 目标值（如：重复次数、持续时间秒数）
    description?: string;    // 自定义成功标准描述
  };
}

// Challenge Unit Content (挑战关卡)
interface ChallengeContent {
  type: 'challenge';
  description: string;       // Markdown 格式的挑战说明
  success_criteria: {        // 通过标准
    type: 'score' | 'combo' | 'time' | 'custom';
    target?: number;         // 目标值
    description: string;     // 详细说明
  };
  hints?: string[];          // 提示数组（可选）
  demo_video?: string;       // 示范视频 URL（可选）
}
```

---

## 示例 1: Theory Unit (理论关卡)

**使用场景**: 讲解概念、原理、技巧要点

```json
{
  "type": "theory",
  "text": "# 台球四大基本动作\n\n台球的四大基本动作是：\n1. **手架 (Bridge)** - 稳定球杆的支撑点\n2. **握杆 (Grip)** - 正确握持球杆的方式\n3. **入位 (Stance)** - 标准的站姿和瞄准姿势\n4. **姿势 (Posture)** - 整体的身体协调和平衡\n\n这四个动作是所有台球技巧的基础，必须反复练习直到形成肌肉记忆。\n\n## 为什么基本功如此重要？\n\n- ✅ 稳定的手架 = 准确的出杆\n- ✅ 正确的握杆 = 流畅的发力\n- ✅ 标准的入位 = 舒适的视角\n- ✅ 良好的姿势 = 持久的体能\n\n**记住**：职业选手与业余爱好者的最大区别，就在于基本功的扎实程度！",
  "images": [],
  "video": ""
}
```

**必填字段**:
- `type`: 必须为 `"theory"`
- `text`: Markdown 格式的理论内容，支持标题、列表、加粗等格式

**可选字段**:
- `images`: 图片 URL 数组，暂时可为空数组 `[]`
- `video`: 视频 URL，暂时为空字符串 `""`

---

## 示例 2: Practice Unit (练习关卡)

**使用场景**: 动作练习、技能训练、重复性训练

```json
{
  "type": "practice",
  "instructions": "# 凤眼式手架练习\n\n## 标准动作：\n1. 手掌平铺台面，虎口朝向球杆方向\n2. 拇指与食指形成\"凤眼\"，球杆从中穿过\n3. 其他三指自然弯曲，稳固支撑\n\n## 练习目标：\n- 完成 **5次** 标准手架定型\n- 每次保持 **30秒** 不动\n- 确保球杆可以在手架中自由滑动\n\n## 自我检查：\n- [ ] 手掌是否完全贴合台面？\n- [ ] 虎口是否紧贴球杆？\n- [ ] 手架是否稳定不晃动？",
  "demo_video": "",
  "success_criteria": {
    "type": "repetitions",
    "target": 5
  }
}
```

**必填字段**:
- `type`: 必须为 `"practice"`
- `instructions`: Markdown 格式的练习说明
- `success_criteria`: 成功标准对象
  - `type`: `"repetitions"` (重复次数) | `"duration"` (持续时间) | `"accuracy"` (准确率) | `"custom"` (自定义)
  - `target`: 目标数值（repetitions: 次数，duration: 秒数，accuracy: 百分比0-100）
  - `description`: 当 type 为 `"custom"` 时的描述文字

**可选字段**:
- `demo_video`: 示范视频 URL，暂时为空字符串 `""`

---

## 示例 3: Challenge Unit (挑战关卡)

**使用场景**: 综合测试、技能考核、阶段性挑战

```json
{
  "type": "challenge",
  "description": "# 基本功综合测试\n\n## 挑战说明：\n完成一套完整的基本功动作流程，包括：\n1. 标准手架定型（保持30秒）\n2. 正确握杆姿势（保持30秒）\n3. 标准入位动作（完成5次）\n4. 整体姿势协调性检查\n\n## 成功标准：\n- 所有动作必须符合标准姿势要求\n- 每个动作之间的衔接流畅自然\n- 完成时间不超过 5 分钟\n\n## 失败后怎么办：\n- 建议复习\"稳固的根基\"章节\n- 重点加强手架稳定性练习\n- 观看示范视频，对比自己的动作",
  "success_criteria": {
    "type": "custom",
    "description": "所有动作符合标准，且在5分钟内完成"
  },
  "hints": [
    "手架是基础，先确保手架稳固",
    "不要着急，慢慢来，准确性比速度更重要",
    "可以对着镜子检查自己的姿势"
  ],
  "demo_video": ""
}
```

**必填字段**:
- `type`: 必须为 `"challenge"`
- `description`: Markdown 格式的挑战说明
- `success_criteria`: 成功标准对象
  - `type`: `"score"` (分数) | `"combo"` (连击) | `"time"` (时间限制) | `"custom"` (自定义)
  - `description`: 详细的成功标准描述

**可选字段**:
- `hints`: 提示数组，帮助用户完成挑战
- `demo_video`: 示范视频 URL，暂时为空字符串 `""`
- `target`: 当 type 为 `"score"`, `"combo"`, `"time"` 时的目标数值

---

## 内容编写规范

### Markdown 格式要求

1. **标题层级**:
   - 使用 `#` 表示主标题（关卡名称）
   - 使用 `##` 表示次级标题（章节）
   - 使用 `###` 表示三级标题（细节）

2. **列表格式**:
   - 有序列表：使用 `1. 2. 3.`
   - 无序列表：使用 `- ` 或 `* `
   - 复选框列表：使用 `- [ ]` 未选中，`- [x]` 已选中

3. **强调格式**:
   - 加粗：`**文本**`
   - 斜体：`*文本*`
   - 代码：`` `文本` ``

4. **特殊符号**:
   - ✅ 正确/推荐
   - ❌ 错误/避免
   - ⚠️ 警告/注意

### 内容质量标准

1. **Theory (理论)**:
   - 清晰解释核心概念
   - 说明"为什么重要"
   - 提供关键要点（3-5个）
   - 指出常见错误

2. **Practice (练习)**:
   - 详细的步骤说明（逐步分解）
   - 明确的练习目标（可量化）
   - 自我检查清单（3-5项）
   - 预估练习时长

3. **Challenge (挑战)**:
   - 清晰的挑战目标
   - 明确的成功/失败标准
   - 提供有用的提示（2-3个）
   - 失败后的改进建议

---

## 数据验证清单

在填充内容前，确保：
- [ ] 所有 JSON 格式正确（无语法错误）
- [ ] `type` 字段与 `unitType` 一致
- [ ] 必填字段全部填写
- [ ] Markdown 内容格式正确
- [ ] 中文标点符号使用正确（，。！？）
- [ ] 没有未转义的特殊字符（如引号需要转义 `\"` ）

---

**最后更新**: 2025-11-10
**维护者**: Development Team
