# Milestone 1 测试计划：新手引导完整流程

## 测试目标
验证新手引导流程（Onboarding Flow）的完整功能，确保新用户能够顺利完成水平测试并获得个性化的90天训练计划起点推荐。

## 测试环境
- **服务器状态**: Dev server running on http://localhost:5001
- **数据库**: PostgreSQL (Supabase Session Pooler)
- **TypeScript编译**: ✅ 通过 (无错误)
- **测试日期**: 2025-11-26

## 测试用例

### TC1: 新用户注册与自动跳转
**前置条件**: 用户未登录

**测试步骤**:
1. 访问 http://localhost:5001/register
2. 填写注册信息（邮箱 + 密码）
3. 点击"注册"按钮
4. 观察页面跳转行为

**预期结果**:
- ✅ 用户成功注册
- ✅ 自动跳转到 `/onboarding` 页面（因为 `onboardingCompleted` 为 false）
- ✅ 不会跳转到其他页面（如首页或90天挑战页）

**验证点**:
- 检查 `user.onboardingCompleted` 字段为 `false` 或 `null`
- 检查浏览器地址栏显示 `/onboarding`
- 检查浏览器控制台日志显示 `[Onboarding] Redirecting to onboarding page`

---

### TC2: 欢迎页面内容展示
**前置条件**: 已进入 `/onboarding` 页面，位于 step 0

**测试步骤**:
1. 观察欢迎页面内容
2. 检查各个区块的显示

**预期结果**:
- ✅ 显示品牌标题："欢迎来到三个月一杆清台训练系统"
- ✅ 显示主标题："用 90 天，从新手到一杆清台"
- ✅ 显示痛点共鸣区块（amber背景，3个痛点）:
  - 学了一段时间，也不知道自己有没有进步？
  - 不知道该练什么，只会乱打？
  - 找不到系统课程或靠谱教练？
- ✅ 显示价值承诺区块（emerald背景，3个价值点）:
  - 90天系统化训练计划
  - 个性化起步建议
  - 游戏化激励系统
- ✅ 显示CTA按钮："开始水平测试"，带有绿色渐变和阴影效果

**验证点**:
- 所有文案正确显示
- 样式符合设计（颜色、间距、图标）
- CTA按钮可点击

---

### TC3: 水平测试问卷流程
**前置条件**: 点击"开始水平测试"按钮，进入 step 1

**测试步骤**:
1. **问题1**: 选择"准度"选项（0/1/2）
2. **问题2**: 选择"走位"选项（0/1/2）
3. **问题3**: 选择"经验"选项（0/1/2）
4. **问题4**: 选择"时间"选项（0/1/2）
5. 点击"查看推荐计划"按钮

**预期结果**:
- ✅ 每个问题都有3个选项可选
- ✅ 选中的选项有视觉反馈（高亮/边框）
- ✅ 所有问题回答后，"查看推荐计划"按钮可点击
- ✅ 点击按钮后，进入 step 2（结果页）

**验证点**:
- `answers` 对象正确记录所有答案
- 按钮点击后触发 `computeRecommendedStart()` 函数

---

### TC4: 推荐起始天数计算
**前置条件**: 完成所有4个问题

**测试场景**:

#### 场景A: 新手用户（总分 0-2）
- **答案**: accuracy=0, positioning=0, experience=0, time=0
- **预期**: `recommendedStart = 1`（从第1天开始）

#### 场景B: 初级用户（总分 3-4）
- **答案**: accuracy=1, positioning=1, experience=1, time=0
- **预期**: `recommendedStart = 5`（从第5天开始）

#### 场景C: 中级用户（总分 5-6）
- **答案**: accuracy=2, positioning=1, experience=2, time=0
- **预期**: `recommendedStart = 10`（从第10天开始）

#### 场景D: 高级用户（总分 7-8）
- **答案**: accuracy=2, positioning=2, experience=2, time=2
- **预期**: `recommendedStart = 15`（从第15天开始）

**验证点**:
- `computeRecommendedStart()` 函数逻辑正确
- 不同总分对应正确的起始天数

---

### TC5: 3日计划展示
**前置条件**: 查看推荐计划（step 2）

**测试步骤**:
1. 观察3日计划卡片显示
2. 检查每日课程内容

**预期结果**:
- ✅ 显示3张课程卡片（第N天、N+1天、N+2天）
- ✅ 每张卡片显示:
  - 天数标题（如"第 1 天"）
  - 课程标题（如"基础姿势与握杆"）
  - 课程描述
  - 技能标签（如"准度"、"基本功"）
- ✅ 卡片样式正确（边框、阴影、间距）
- ✅ 显示"开始我的90天计划"按钮

**验证点**:
- `DAILY_COURSES` 数据正确加载
- 天数计算正确（recommendedStart, +1, +2）
- 如果天数超过90，正确处理边界情况

---

### TC6: API调用与数据持久化
**前置条件**: 点击"开始我的90天计划"按钮

**测试步骤**:
1. 点击按钮
2. 观察网络请求（浏览器DevTools Network标签）
3. 检查数据库记录

**预期结果**:
- ✅ 发送 `POST /api/onboarding/complete` 请求
- ✅ 请求体包含:
  ```json
  {
    "recommendedStartDay": 1,  // 根据测试场景
    "answers": {
      "accuracy": 0,
      "positioning": 0,
      "experience": 0,
      "time": 0
    }
  }
  ```
- ✅ 收到成功响应（200 OK）:
  ```json
  {
    "success": true,
    "user": { ... },
    "message": "Onboarding completed successfully"
  }
  ```
- ✅ 数据库 `users` 表更新:
  - `onboarding_completed = true`
  - `recommended_start_day = 1`
  - `onboarding_answers = {...}`
  - `challenge_current_day = 1` (如果之前为null)

**验证点**:
- API请求成功
- 数据库字段正确更新
- localStorage 同时保存 `onboarding_completed = 'true'`

---

### TC7: 跳转到90天挑战页
**前置条件**: API调用成功

**测试步骤**:
1. 观察页面跳转
2. 检查目标页面内容

**预期结果**:
- ✅ 自动跳转到 `/ninety-day-challenge` 页面
- ✅ 页面显示用户的90天挑战进度
- ✅ 当前天数应为推荐的起始天数（如第1天）

**验证点**:
- 浏览器地址栏显示 `/ninety-day-challenge`
- 页面正确加载（无错误）
- 用户数据正确显示

---

### TC8: 防止重复引导（已完成用户）
**前置条件**: 用户已完成引导（`onboardingCompleted = true`）

**测试步骤**:
1. 刷新页面或重新登录
2. 观察页面行为

**预期结果**:
- ✅ 不会自动跳转到 `/onboarding`
- ✅ 用户可以正常访问其他页面（首页、90天挑战、技能库等）
- ✅ 手动访问 `/onboarding` 页面时，显示"已完成引导"提示或直接跳转到首页

**验证点**:
- App.tsx 中的 `useEffect` 逻辑正确判断 `onboardingCompleted`
- 没有重定向循环
- 浏览器控制台没有相关错误日志

---

### TC9: 降级处理（API失败场景）
**前置条件**: 模拟API失败（关闭数据库或修改API返回500错误）

**测试步骤**:
1. 完成水平测试
2. 点击"开始我的90天计划"
3. 观察错误处理

**预期结果**:
- ✅ 捕获错误并记录到控制台
- ✅ 仍然保存 `localStorage` 数据作为备份
- ✅ 仍然跳转到 `/ninety-day-challenge` 页面（降级处理）
- ✅ 用户不会被卡在引导页面

**验证点**:
- 错误日志: `Error completing onboarding: ...`
- localStorage 保存成功
- 页面正常跳转
- 用户体验不受影响

---

### TC10: 跳过引导情况（已开始挑战的用户）
**前置条件**: 用户已有 `challenge_start_date`（表示已开始90天挑战）

**测试步骤**:
1. 登录已开始挑战的用户
2. 观察页面行为

**预期结果**:
- ✅ 不会强制跳转到 `/onboarding`
- ✅ 即使 `onboardingCompleted = false`，也不强制引导
- ✅ 用户可以正常访问90天挑战页面

**验证点**:
- App.tsx 逻辑正确判断 `hasChallengeStart`
- 已开始挑战的老用户不受影响

---

## 测试数据准备

### 新用户注册信息
```
Email: test-onboarding-001@example.com
Password: TestPass123!
```

### 水平测试答案组合
| 场景 | accuracy | positioning | experience | time | 总分 | 推荐起始 |
|------|----------|-------------|------------|------|------|----------|
| 新手 | 0        | 0           | 0          | 0    | 0    | 1        |
| 初级 | 1        | 1           | 1          | 0    | 3    | 5        |
| 中级 | 2        | 1           | 2          | 0    | 5    | 10       |
| 高级 | 2        | 2           | 2          | 2    | 8    | 15       |

---

## 测试工具

### 浏览器DevTools
- **Elements**: 检查DOM结构和样式
- **Console**: 查看日志和错误
- **Network**: 监控API请求和响应
- **Application**: 检查localStorage数据

### 数据库查询
```sql
-- 查看用户引导状态
SELECT id, email, onboarding_completed, recommended_start_day,
       onboarding_answers, challenge_current_day
FROM users
WHERE email = 'test-onboarding-001@example.com';

-- 重置用户引导状态（用于重复测试）
UPDATE users
SET onboarding_completed = false,
    recommended_start_day = NULL,
    onboarding_answers = NULL,
    challenge_current_day = NULL
WHERE email = 'test-onboarding-001@example.com';
```

---

## 通过标准

### 必须通过的测试用例
- ✅ TC1: 新用户注册与自动跳转
- ✅ TC2: 欢迎页面内容展示
- ✅ TC3: 水平测试问卷流程
- ✅ TC4: 推荐起始天数计算
- ✅ TC5: 3日计划展示
- ✅ TC6: API调用与数据持久化
- ✅ TC7: 跳转到90天挑战页
- ✅ TC8: 防止重复引导

### 建议通过的测试用例
- ⚠️ TC9: 降级处理（API失败场景）
- ⚠️ TC10: 跳过引导情况

---

## 已知问题与风险

### 潜在问题
1. **并发问题**: 如果用户在多个标签页同时完成引导，可能导致重复API调用
2. **网络延迟**: 慢速网络可能导致用户体验不佳
3. **边界情况**: 推荐起始天数为90时，3日计划展示可能超出范围

### 风险缓解
1. 使用 `localStorage` 双重保险机制
2. API调用添加 loading 状态提示
3. 3日计划展示时处理边界情况（天数 > 90）

---

## 测试报告模板

### 执行结果
| 用例编号 | 用例名称 | 状态 | 备注 |
|---------|---------|------|------|
| TC1     | 新用户注册与自动跳转 | ⏳ Pending | |
| TC2     | 欢迎页面内容展示 | ⏳ Pending | |
| TC3     | 水平测试问卷流程 | ⏳ Pending | |
| TC4     | 推荐起始天数计算 | ⏳ Pending | |
| TC5     | 3日计划展示 | ⏳ Pending | |
| TC6     | API调用与数据持久化 | ⏳ Pending | |
| TC7     | 跳转到90天挑战页 | ⏳ Pending | |
| TC8     | 防止重复引导 | ⏳ Pending | |
| TC9     | 降级处理 | ⏳ Pending | |
| TC10    | 跳过引导情况 | ⏳ Pending | |

### 发现的问题
（待测试后填写）

### 结论
（待测试后填写）

---

## 下一步行动
1. 执行所有测试用例
2. 记录测试结果和发现的问题
3. 修复发现的bug
4. 生成最终测试报告
5. 准备进入 Milestone 2 开发
