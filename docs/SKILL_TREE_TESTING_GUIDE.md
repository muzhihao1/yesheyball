# 技能树系统 - 完整测试验证指南

**目标**: 系统化验证技能树系统的所有功能
**预计时间**: 15-20分钟
**状态**: ✅ 开发100%完成 | ⏳ 等待验证测试

---

## 📋 测试前提条件

### 必须完成
- [x] 后端API代码完成
- [x] 前端UI代码完成
- [x] TypeScript编译通过（0 errors）
- [ ] **种子数据已执行** ← 用户确认完成
- [ ] 开发服务器正常运行

### 环境检查
```bash
# 1. 确认端口5000可用
lsof -i:5000
# 如果有输出，执行: lsof -ti:5000 | xargs kill -9

# 2. 启动开发服务器
npm run dev

# 预期输出:
# > NODE_ENV=development tsx server/devServer.ts
# Connected to database successfully
# Server running on http://localhost:5000
```

---

## 🧪 第一阶段：数据库验证 (V1)

### 测试目标
验证种子数据已正确插入，8个技能节点和依赖关系完整。

### 验证步骤

#### 步骤1: 连接Supabase SQL Editor
1. 访问 https://supabase.com/dashboard
2. 选择项目 **waytoheyball**
3. 点击左侧 **SQL Editor**

#### 步骤2: 验证技能数据
```sql
-- 查询1: 技能总数（应返回8）
SELECT COUNT(*) as total_skills FROM skills;

-- 查询2: 查看所有技能
SELECT
  id,
  name,
  metadata->>'level' as level,
  metadata->>'icon' as icon,
  metadata->>'color' as color
FROM skills
ORDER BY id;

-- 查询3: 验证依赖关系（应返回7条）
SELECT
  sd.source_skill_id,
  s1.name as source_skill,
  sd.target_skill_id,
  s2.name as target_skill
FROM skill_dependencies sd
JOIN skills s1 ON sd.source_skill_id = s1.id
JOIN skills s2 ON sd.target_skill_id = s2.id
ORDER BY sd.source_skill_id;

-- 查询4: 验证解锁条件（应返回21条，Skill 1无条件）
SELECT COUNT(*) as total_conditions
FROM skill_unlock_conditions;
```

#### 预期结果
| 查询 | 预期结果 |
|------|---------|
| 查询1 | `total_skills: 8` |
| 查询2 | 8行数据，等级1-8，图标: 🌱🎯⚡💫🎓🏆👑⭐ |
| 查询3 | 7行依赖：1→2, 2→3, 3→4, 4→5, 5→6, 6→7, 7→8 |
| 查询4 | `total_conditions: 21-24` |

#### ✅ 验证标准
- [ ] 技能总数 = 8
- [ ] 所有技能名称正确（初窥门径 → 出神入化）
- [ ] 依赖关系线性连接
- [ ] 解锁条件存在且数量合理

---

## 🔌 第二阶段：后端API验证 (V2)

### 测试目标
验证4个API端点正常工作，返回正确数据。

### 环境准备
```bash
# 确保开发服务器正在运行
curl http://localhost:5000
# 预期: 返回HTML页面或"Cannot GET /"
```

### 测试用例

#### API-1: 获取完整技能树
```bash
curl -X GET http://localhost:5000/api/skill-tree \
  -H "Cookie: connect.sid=YOUR_SESSION_ID" \
  | jq '.'
```

**预期响应**:
```json
{
  "data": {
    "skills": [
      {
        "id": 1,
        "name": "初窥门径",
        "description": "掌握台球基础...",
        "position": {"x": 400, "y": 100},
        "metadata": {
          "icon": "🌱",
          "color": "#10b981",
          "level": 1
        },
        "isUnlocked": false,
        "conditions": []
      }
      // ... 7 more skills
    ],
    "dependencies": [
      {"sourceSkillId": 1, "targetSkillId": 2},
      // ... 6 more dependencies
    ],
    "userProgress": {
      "totalSkills": 8,
      "unlockedSkills": 0,
      "progressPercentage": 0,
      "nextUnlockableSkills": [1]
    }
  }
}
```

**✅ 验证点**:
- [ ] HTTP 200 OK
- [ ] `skills` 数组包含8个对象
- [ ] `dependencies` 数组包含7个对象
- [ ] `userProgress.totalSkills` = 8
- [ ] `userProgress.nextUnlockableSkills` 包含 `[1]`

---

#### API-2: 获取单个技能详情
```bash
curl -X GET http://localhost:5000/api/skills/1 \
  -H "Cookie: connect.sid=YOUR_SESSION_ID" \
  | jq '.'
```

**预期响应**:
```json
{
  "data": {
    "skill": {
      "id": 1,
      "name": "初窥门径",
      "description": "掌握台球基础：正确的握杆、站位和基本击球姿势",
      "isUnlocked": false,
      "canUnlock": true,
      "dependencies": [],
      "conditions": [],
      "blockingReasons": []
    }
  }
}
```

**✅ 验证点**:
- [ ] HTTP 200 OK
- [ ] `skill.name` = "初窥门径"
- [ ] `skill.canUnlock` = true（Skill 1无前置条件）
- [ ] `skill.dependencies` 为空数组

---

#### API-3: 解锁技能（成功场景）
```bash
curl -X POST http://localhost:5000/api/skills/1/unlock \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_SESSION_ID" \
  -d '{"context": {"triggeredBy": "manual"}}' \
  | jq '.'
```

**预期响应**:
```json
{
  "data": {
    "success": true,
    "unlocked": true,
    "skill": {
      "id": 1,
      "name": "初窥门径",
      "unlockedAt": "2025-11-10T..."
    },
    "rewards": {
      "exp": 50,
      "message": "恭喜解锁新技能！"
    },
    "nextSkills": [
      {"id": 2, "name": "小有所成", "canUnlock": false}
    ]
  }
}
```

**✅ 验证点**:
- [ ] HTTP 200 OK
- [ ] `success` = true
- [ ] `unlocked` = true
- [ ] `rewards.exp` 存在
- [ ] `nextSkills` 包含 Skill 2

---

#### API-4: 解锁技能（失败场景 - 依赖未满足）
```bash
curl -X POST http://localhost:5000/api/skills/3/unlock \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_SESSION_ID" \
  -d '{}' \
  | jq '.'
```

**预期响应**:
```json
{
  "message": "无法解锁技能：前置条件未满足",
  "details": {
    "unmetConditions": [...],
    "unmetDependencies": [
      {"skillId": 2, "name": "小有所成"}
    ]
  }
}
```

**✅ 验证点**:
- [ ] HTTP 400 Bad Request
- [ ] `message` 包含"前置条件未满足"
- [ ] `details.unmetDependencies` 包含 Skill 2

---

### 🔍 浏览器开发者工具测试

如果curl测试困难，可使用浏览器：

1. 打开 http://localhost:5000
2. 登录到应用
3. 打开 DevTools (F12) → Network 标签
4. 访问技能树页面
5. 观察网络请求

**预期请求**:
```
GET /api/skill-tree
Status: 200
Response: JSON with 8 skills
```

---

## 🎨 第三阶段：前端UI验证 (V3)

### 测试目标
验证前端页面正确加载、显示和交互。

### 测试步骤

#### 步骤1: 访问技能树页面
```
操作:
1. 在浏览器打开 http://localhost:5000
2. 登录（如有需要）
3. 点击底部导航 "成长路径" (TrendingUp图标)
   或直接访问: http://localhost:5000/skill-tree

预期:
- URL变为 /skill-tree
- 页面显示技能树画布
- 顶部显示进度统计
```

**✅ 验证点**:
- [ ] 页面成功加载，无404错误
- [ ] 看到React Flow画布
- [ ] 顶部显示 "耶氏台球成长路径"
- [ ] 显示用户进度：0/8 已解锁，0%完成

---

#### 步骤2: 验证节点显示
```
预期:
- 看到8个技能节点，垂直排列
- Skill 1: 蓝色边框，"🔓 可解锁" 徽章，脉动效果
- Skill 2-8: 灰色边框，"🔒 锁定" 徽章
- 每个节点显示：
  * 图标（🌱, 🎯, ⚡, 💫, 🎓, 🏆, 👑, ⭐）
  * 名称（初窥门径, 小有所成...）
  * 等级徽章（L1-L8）
- 节点之间有箭头连接（1→2→3→4→5→6→7→8）
```

**✅ 验证点**:
- [ ] 看到8个节点
- [ ] Skill 1 为蓝色可解锁状态
- [ ] 其他技能为灰色锁定状态
- [ ] 图标和名称正确显示
- [ ] 箭头连接线清晰可见

---

#### 步骤3: 测试节点交互
```
操作:
1. 悬停鼠标在节点上
2. 点击 Skill 1 节点

预期:
- 悬停时节点轻微放大（hover:scale-105）
- 点击后弹窗打开
- 弹窗标题: "初窥门径 L1"
- 显示技能描述
- 显示"立即解锁"按钮（蓝色，可点击）
```

**✅ 验证点**:
- [ ] 节点悬停有放大效果
- [ ] 点击后弹窗正确打开
- [ ] 弹窗内容完整（图标、名称、描述）
- [ ] 解锁按钮可点击

---

#### 步骤4: 测试迷你地图和控制
```
操作:
- 左下角: 迷你地图
- 右下角: 控制面板（+、-、适应视图）

预期:
- 迷你地图显示整个技能树缩略图
- Skill 1 在地图上显示为蓝色点
- Skill 2-8 在地图上显示为灰色点
- 点击控制面板按钮可缩放视图
```

**✅ 验证点**:
- [ ] 迷你地图可见且功能正常
- [ ] 节点颜色在地图上正确显示
- [ ] 控制面板按钮可用

---

## 🔄 第四阶段：端到端流程验证 (V4)

### 测试目标
模拟完整用户流程，验证解锁功能和状态更新。

### 完整用户场景

#### 场景1: 解锁第一个技能

**步骤1: 查看初始状态**
```
操作: 访问技能树页面
观察:
- 顶部进度: 0/8 已解锁
- Skill 1: 蓝色 "可解锁"
- Skill 2-8: 灰色 "锁定"
```

**步骤2: 打开技能详情**
```
操作: 点击 Skill 1
观察弹窗内容:
- 标题: "初窥门径 L1" 🌱
- 描述: "掌握台球基础..."
- 前置技能: 无（或空列表）
- 解锁条件: 无（或已全部满足）
- 按钮状态: "🔓 立即解锁" (蓝色，可点击)
```

**步骤3: 执行解锁**
```
操作: 点击 "立即解锁" 按钮
预期:
1. 按钮文字变为 "⏳ 解锁中..."
2. 按钮禁用（不可再次点击）
3. 2-3秒后，Toast通知显示: "🎉 技能解锁成功！"
4. 弹窗自动关闭
```

**步骤4: 验证状态更新**
```
观察页面变化:
- Skill 1:
  * 边框变绿色
  * 徽章变为 "✓ 已解锁"
  * 无脉动效果
- Skill 2:
  * 边框变蓝色（从灰色变化）
  * 徽章变为 "🔓 可解锁"
  * 开始脉动
- 顶部进度: 1/8 已解锁，12.5%完成
- 迷你地图: Skill 1变绿点，Skill 2变蓝点
```

**✅ 验证点**:
- [ ] 解锁过程无错误
- [ ] Skill 1 状态正确更新为"已解锁"
- [ ] Skill 2 状态正确更新为"可解锁"
- [ ] 进度统计正确更新
- [ ] Toast通知正常显示

---

#### 场景2: 验证依赖阻止

**步骤1: 尝试解锁Skill 3**
```
操作:
1. 点击 Skill 3 节点（灰色锁定状态）
2. 观察弹窗

预期:
- 弹窗打开
- 按钮文字: "🔒 未满足解锁条件"
- 按钮状态: 禁用（灰色）
- 前置技能列表显示:
  * Skill 2: "🔒 未解锁"（红色或灰色背景）
```

**步骤2: 尝试点击解锁按钮**
```
操作: 点击 "未满足解锁条件" 按钮
预期:
- 按钮无反应（已禁用）
- 或弹出提示: "请先完成上述所有条件和前置技能"
```

**✅ 验证点**:
- [ ] 无法解锁Skill 3
- [ ] 前置技能依赖正确显示
- [ ] 按钮正确禁用
- [ ] 错误提示清晰

---

#### 场景3: 连续解锁流程（可选）

如果Skill 2的解锁条件已满足（等级、课程等），可测试连续解锁：

```
1. 解锁 Skill 1 ✅
2. 解锁 Skill 2 → Skill 3 变为可解锁
3. 解锁 Skill 3 → Skill 4 变为可解锁
...
```

**✅ 验证点**:
- [ ] 每次解锁后，下一个技能正确变为可解锁
- [ ] 进度百分比正确增长（12.5% → 25% → 37.5%...）
- [ ] 状态传播正确

---

## 📊 第五阶段：问题识别和优化建议 (V5)

### 性能观察

#### 加载性能
```
测试: 首次访问技能树页面
观察指标:
- Time to First Byte (TTFB): < 500ms
- API响应时间: < 1s
- 页面完全加载: < 3s
- React Flow渲染: < 500ms
```

**✅ 性能标准**:
- [ ] API响应时间 < 1秒
- [ ] 页面首屏渲染 < 2秒
- [ ] 无明显卡顿或延迟

---

#### 交互性能
```
测试: 点击节点、缩放、拖拽
观察:
- 节点点击响应: 立即
- 弹窗打开速度: < 200ms
- 缩放/拖拽流畅度: 60fps
```

**✅ 交互标准**:
- [ ] 操作响应无延迟
- [ ] 动画流畅不掉帧
- [ ] 鼠标操作灵敏

---

### UI/UX问题排查

#### 常见问题检查清单

| 问题 | 检查方法 | 解决方案 |
|------|---------|---------|
| 节点重叠 | 观察是否有节点堆叠 | 调整position坐标 |
| 文字过长溢出 | 查看节点标签显示 | 添加text-overflow: ellipsis |
| 连接线不美观 | 观察箭头和曲线 | 调整strokeWidth或类型 |
| 颜色对比度低 | 检查锁定节点是否难以辨识 | 增强颜色对比 |
| 弹窗内容过多 | 尝试打开所有技能 | 添加滚动或分页 |

**✅ UI质量标准**:
- [ ] 所有文字清晰可读
- [ ] 颜色对比度足够
- [ ] 布局整洁无重叠
- [ ] 响应式设计适配移动端

---

### 错误场景测试

#### 网络错误
```
测试:
1. 断开网络连接
2. 刷新页面

预期:
- 显示错误页面
- 错误图标: ⚠️
- 错误消息: "加载失败 - 无法加载技能树数据"
- 重试按钮可用
```

#### API失败
```
测试:
1. 停止后端服务器
2. 尝试解锁技能

预期:
- Toast错误通知: "❌ 解锁失败"
- 详细错误信息显示
- 页面状态不变（不会错误更新）
```

**✅ 错误处理标准**:
- [ ] 错误信息友好且清晰
- [ ] 提供重试机制
- [ ] 页面不崩溃

---

## 📝 测试报告模板

完成所有测试后，填写以下报告：

```markdown
# 技能树系统测试报告

**测试日期**: YYYY-MM-DD
**测试人员**: [Your Name]
**测试环境**:
- OS: macOS / Windows / Linux
- Browser: Chrome 120+ / Firefox / Safari
- Node.js: v22.x
- Database: Supabase PostgreSQL

---

## 测试结果汇总

| 阶段 | 通过率 | 状态 |
|------|--------|------|
| V1: 数据库验证 | 4/4 (100%) | ✅ 通过 |
| V2: 后端API | 4/4 (100%) | ✅ 通过 |
| V3: 前端UI | 4/4 (100%) | ✅ 通过 |
| V4: 端到端流程 | 3/3 (100%) | ✅ 通过 |
| V5: 性能与优化 | - | ℹ️ 观察 |

**总体结论**: ✅ 系统功能完整，可以部署到生产环境

---

## 发现的问题

### 高优先级 (Must Fix)
- [ ] 无

### 中优先级 (Should Fix)
- [ ] [描述问题1]
- [ ] [描述问题2]

### 低优先级 (Nice to Have)
- [ ] 节点间距可以更大（视觉优化）
- [ ] 添加解锁动画（体验增强）

---

## 优化建议

1. **性能优化**:
   - 考虑添加虚拟化（如果节点超过50个）
   - 实现Service Worker缓存

2. **体验优化**:
   - 添加解锁成功动画（礼花效果）
   - 技能详情增加相关课程链接

3. **功能增强**:
   - 支持技能树分支（非线性路径）
   - 添加技能推荐系统

---

## 下一步行动

- [ ] 修复所有高优先级问题
- [ ] 部署到Staging环境
- [ ] 用户验收测试（UAT）
- [ ] 生产环境发布

---

**测试签名**: _____________
**日期**: _____________
```

---

## 🚀 生产部署检查清单

### 代码准备
- [ ] 所有测试通过
- [ ] TypeScript编译无错误
- [ ] 无console.log或调试代码
- [ ] 依赖包版本锁定（package-lock.json提交）

### 环境配置
- [ ] Vercel环境变量已设置
  - [ ] DATABASE_URL (Session Pooler)
  - [ ] VITE_SUPABASE_URL
  - [ ] VITE_SUPABASE_ANON_KEY
  - [ ] SESSION_SECRET
  - [ ] OPENAI_API_KEY
- [ ] 数据库种子数据已执行
- [ ] 数据库备份已创建

### 部署流程
- [ ] 推送代码到GitHub
- [ ] Vercel自动部署触发
- [ ] 检查构建日志无错误
- [ ] 访问生产URL验证功能

### 生产验证
- [ ] GET /api/skill-tree 返回数据
- [ ] 前端页面正常加载
- [ ] 解锁功能正常工作
- [ ] 无浏览器控制台错误

---

## 📞 故障排查

### 常见问题 Quick Fix

#### 问题1: API返回401 Unauthorized
```
原因: 用户未登录或session过期
解决:
1. 访问 / 页面重新登录
2. 确认Cookie中有 connect.sid
```

#### 问题2: 技能树显示空白
```
原因: API数据获取失败或种子数据未执行
解决:
1. 打开DevTools → Network，查看API请求
2. 如果API返回空数组，执行种子数据SQL
3. 验证: SELECT COUNT(*) FROM skills; 应返回8
```

#### 问题3: 解锁按钮点击无反应
```
原因: JavaScript错误或API端点失败
解决:
1. 打开DevTools → Console，查看错误信息
2. 检查Network标签，POST请求是否成功
3. 验证服务器日志
```

#### 问题4: 进度不更新
```
原因: 前端缓存未失效
解决:
1. 硬刷新页面 (Ctrl+Shift+R / Cmd+Shift+R)
2. 检查TanStack Query是否正确invalidate
```

---

## ✅ 测试完成标准

当以下所有条件满足时，系统验证完成：

1. ✅ 数据库包含8个技能和7个依赖
2. ✅ 4个API端点全部正常响应
3. ✅ 前端页面正确显示技能树
4. ✅ 可以成功解锁Skill 1
5. ✅ 依赖验证正常工作（无法跨级解锁）
6. ✅ 进度统计准确更新
7. ✅ 无JavaScript错误或控制台警告
8. ✅ 性能指标满足标准（< 3s加载）

**恭喜！🎉 系统已通过完整验证，可以安全部署到生产环境。**

---

**文档版本**: 1.0
**最后更新**: 2025-11-10
**维护者**: Development Team
