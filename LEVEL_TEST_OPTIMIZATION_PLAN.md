# 水平测试功能完整优化方案

## 📋 概述

本方案解决的核心问题：**已完成 onboarding 的用户（如 muzhihao1）仍在首页看到"水平测试"和"获取计划"步骤，造成混淆和冗余。**

修复方案：根据用户状态（new/active/completed）条件化渲染界面，并为活跃用户提供可选的"重新测试"功能入口。

---

## 🎯 已完成的代码修改

### ✅ 第 1 步：创建 RetestConfirmationModal 组件
**文件**: `/client/src/components/RetestConfirmationModal.tsx`
- 二次确认弹窗，明确告知用户后果
- 使用警告样式（红色）强调不可逆性
- "确认并重新测试"按钮清晰表达操作结果

### ✅ 第 2 步：修改 ChallengeHero 组件
**文件**: `/client/src/components/ninety-day/ChallengeHero.tsx`
- 添加 `userStatus?: 'new' | 'active' | 'completed'` 属性
- 根据 userStatus 条件化 steps 数组：
  - `'new'`: 显示完整引导步骤
  - `'active'/'completed'`: 隐藏步骤（为 []）
- 使用 `{steps.length > 0 && (...)}` 包装整个"如何开始"卡片，仅新用户显示

### ✅ 第 3 步：修改 NinetyDayChallenge 页面
**文件**: `/client/src/pages/NinetyDayChallenge.tsx`
- 添加 `userStatus` 计算逻辑：
  ```typescript
  const userStatus: 'new' | 'active' | 'completed' = (() => {
    if (!abilityScores?.clearance) return 'new';
    const isPlanCompleted = currentDay >= 90 || challengeProgress?.challenge_completed_days === 90;
    if (!isPlanCompleted) return 'active';
    return 'completed';
  })();
  ```
- 传递 `userStatus={userStatus}` 给 ChallengeHero 组件

---

## 📝 待完成的代码修改

### ⏳ 第 4 步：在 Profile 页面添加"重新测试"按钮

**文件**: `/client/src/pages/profile.tsx`

在页面底部添加一个"学习设置"卡片：

```tsx
import { RetestConfirmationModal } from '@/components/RetestConfirmationModal';
import { useLocation } from 'wouter';

// 在 Profile 组件内添加：
const [, navigate] = useLocation();
const [showRetestModal, setShowRetestModal] = useState(false);

const handleRetestClick = () => {
  setShowRetestModal(true);
};

const handleConfirmRetest = () => {
  // 导航到水平测试页面，带上 isRetest=true 标志
  navigate('/onboarding?isRetest=true');
  setShowRetestModal(false);
};

// 在 JSX 中添加：
<Card className="border-2 border-amber-200">
  <CardHeader>
    <CardTitle>学习设置</CardTitle>
  </CardHeader>
  <CardContent className="space-y-3">
    <p className="text-sm text-gray-600">
      已有学习计划？可以随时重新进行水平测试，系统会为你生成新的学习路线。
    </p>
    <Button
      variant="outline"
      className="w-full"
      onClick={handleRetestClick}
    >
      重新进行水平测试
    </Button>
  </CardContent>
</Card>

<RetestConfirmationModal
  isOpen={showRetestModal}
  onClose={() => setShowRetestModal(false)}
  onConfirm={handleConfirmRetest}
/>
```

### ⏳ 第 5 步：修改 LevelAssessment 处理 isRetest 参数

**文件**: `/client/src/components/LevelAssessment.tsx`

添加重新测试模式的支持：

```tsx
const searchParams = new URLSearchParams(window.location.search);
const isRetest = searchParams.get('isRetest') === 'true';

// 在提交问卷结果时，调用后端 API 时带上 isRetest 标志：
const submitAnswersPayload = {
  answers: userAnswers,
  isRetest: isRetest, // 新增
};

// 后端根据 isRetest 决定是创建新计划还是覆盖现有计划
```

### ⏳ 第 6 步：后端 API 支持

需要后端支持以下逻辑：

```typescript
// 新增或修改的 API 端点：POST /api/v1/level-test/submit

interface SubmitLevelTestRequest {
  answers: Record<number, number>;
  isRetest: boolean; // 新增：标记是重新测试
}

// 处理逻辑：
if (isRetest) {
  // 1. 获取用户当前的活跃计划
  // 2. 将其标记为 is_active = false，记录 deactivated_reason = 'retest'
  // 3. 根据新的测试分数生成新计划，设置 is_active = true
} else {
  // 首次测试：直接创建计划
}

// 4. 更新 user.has_completed_onboarding = true
// 5. 记录到 level_test_history 表
```

---

## 📊 用户状态流程图

```
新用户 (首次访问)
  ↓
  首页显示"水平测试"引导
  ↓
  完成 LevelAssessment
  ↓
  获得能力评分 (clearanceScore)
  ↓
[状态转变] → 活跃用户 (Active User)
  ↓
  首页隐藏引导，显示当日训练
  ↓
  训练 90 天（可选：在 Profile 点击"重新测试"重置）
  ↓
  到达第 90 天
  ↓
[状态转变] → 完成用户 (Completed User)
  ↓
  首页显示完成激励页面
  ↓
  可在 Profile 点击"开启新一轮挑战"重新开始
```

---

## ✅ 验收标准

### 新用户路径
- [ ] 登录后直接看到"水平测试"和"获取计划"引导
- [ ] 完成测试后，这些引导立即消失

### 活跃用户路径
- [ ] 用户 muzhihao1 首页不再看到"水平测试"和"获取计划"
- [ ] Profile 页面有"重新进行水平测试"按钮
- [ ] 点击按钮弹出确认对话框（警告后果）
- [ ] 确认后导航到水平测试页面，生成新计划

### 完成用户路径
- [ ] 90 天完成后，首页显示完成激励信息
- [ ] Profile 显示"开启新一轮挑战"选项

---

## 🚀 部署步骤

1. **合并代码**：将已完成的 3 个修改合并到 main
2. **实现第 4-5 步**：完成 Profile 页面和 LevelAssessment 修改
3. **后端支持**：确保后端 API 支持 isRetest 参数
4. **测试验证**：
   - 新账户从零开始
   - 已有账户（muzhihao1）不显示引导
   - 点击重新测试成功重置计划
5. **上线**：部署到生产环境

---

## 📌 技术决策

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 重新测试入口 | Profile 页面 | 低频操作，放在设置区域符合用户心智 |
| 确认机制 | 二次确认弹窗 | 清晰表达后果，防止误操作 |
| 后果处理 | 覆盖现有计划 | 简洁直观，避免计划并存造成混淆 |
| 数据保留 | 存档旧计划 | 保留历史数据用于分析 |

