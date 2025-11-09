# 耶氏台球网站改进任务清单

## 项目背景

**产品定位**：面向台球初学者的游戏化训练平台  
**商业模式**：前期免费，后续高级关卡付费（Freemium模式）  
**核心目标**：让用户先用起来，建立使用习惯，再引导付费转化

**技术栈**：
- 前端：React 18 + TypeScript + Wouter + TanStack Query + Tailwind CSS + shadcn/ui + Framer Motion
- 后端：Express + TypeScript + Drizzle ORM + PostgreSQL + Supabase Auth
- 部署：Vercel Serverless

---

## 使用说明

本文档按照优先级（P0 → P1 → P2）组织改进任务。每个任务都包含：
- 📋 **问题描述**：当前存在的问题
- 🎯 **期望效果**：改进后应达到的状态
- 💻 **技术实现**：基于现有技术栈的具体实现方案
- ✅ **验收标准**：改完后需要检查的要点

建议按照顺序逐个完成，每完成一个任务就进行测试验收，确认无误后再进行下一个。

---

## P0 级任务 - 必须立即修复

### P0-1: 修复数据一致性问题

#### 📋 问题描述

经验值、排名等数据在不同页面显示不一致：
- 页面顶部显示经验值 120，但个人档案页显示 0
- 排行榜用户信息卡显示当前排名 #1，但下方列表显示 #3
- 关卡地图顶部显示"第1阶段，第3部分"，但实际在第1组

#### 🎯 期望效果

所有页面的用户数据（经验值、排名、进度等）保持完全一致，数据来源统一。

#### 💻 技术实现

**1. 排查数据源问题**

检查后端 API 返回的数据是否一致：
```typescript
// 检查以下 API 端点返回的用户数据
GET /api/user/profile
GET /api/user/stats
GET /api/leaderboard

// 确保它们返回的 experience、rank 等字段值一致
```

**2. 统一前端数据获取**

使用 TanStack Query 的缓存机制，确保所有组件从同一数据源获取：

```typescript
// hooks/useUserData.ts
import { useQuery } from '@tanstack/react-query';

export function useUserData() {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const res = await fetch('/api/user/profile');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5分钟内不重新请求
  });
}

// 在所有需要用户数据的组件中使用这个 hook
// 顶部导航栏、个人档案、排行榜等都调用 useUserData()
```

**3. 修复排名计算逻辑**

检查排行榜的排名计算：
```typescript
// 后端：确保排名计算逻辑正确
// server/routes/leaderboard.ts
const leaderboard = await db
  .select()
  .from(users)
  .orderBy(desc(users.experience))
  .limit(100);

// 添加排名字段
const rankedLeaderboard = leaderboard.map((user, index) => ({
  ...user,
  rank: index + 1,
}));
```

**4. 修复阶段/部分显示**

检查关卡进度的计算逻辑：
```typescript
// 确保前端显示的阶段/部分与用户实际进度匹配
// 可能需要修改进度计算函数
function getCurrentStage(completedLevels: number) {
  // 根据完成的关卡数计算当前阶段和部分
  const stage = Math.floor(completedLevels / 30) + 1;
  const part = Math.floor((completedLevels % 30) / 10) + 1;
  return { stage, part };
}
```

#### ✅ 验收标准

- [ ] 在顶部导航栏、个人档案、排行榜三个位置显示的经验值完全一致
- [ ] 排行榜中用户信息卡和列表中显示的排名一致
- [ ] 关卡地图顶部显示的阶段/部分与用户实际完成的关卡数匹配
- [ ] 打开浏览器开发者工具，检查 React Query DevTools，确认数据缓存正常
- [ ] 完成一次训练后，所有页面的经验值同步更新

---

### P0-2: 添加"忘记密码"功能

#### 📋 问题描述

登录页面缺少"忘记密码"功能，用户忘记密码后无法自助找回。

#### 🎯 期望效果

用户可以通过邮箱接收重置密码链接，自助完成密码重置。

#### 💻 技术实现

**1. 利用 Supabase Auth 的密码重置功能**

Supabase Auth 已经内置了密码重置功能，直接调用即可：

```typescript
// client/src/pages/ForgotPassword.tsx
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError('发送失败，请检查邮箱地址');
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <h2>邮件已发送</h2>
        <p>请查收邮箱中的密码重置链接</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>邮箱</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
      />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit">发送重置链接</button>
    </form>
  );
}
```

**2. 创建密码重置页面**

```typescript
// client/src/pages/ResetPassword.tsx
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLocation } from 'wouter';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('两次输入的密码不一致');
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      alert('密码重置失败');
    } else {
      alert('密码重置成功');
      setLocation('/login');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>重置密码</h2>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="新密码（至少8个字符）"
        minLength={8}
        required
      />
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="确认新密码"
        required
      />
      <button type="submit">重置密码</button>
    </form>
  );
}
```

**3. 在登录页面添加链接**

```typescript
// client/src/pages/Login.tsx
// 在登录按钮下方添加
<div className="text-center mt-4">
  <a href="/forgot-password" className="text-sm text-gray-600 hover:text-gray-900">
    忘记密码？
  </a>
</div>
```

**4. 添加路由**

```typescript
// client/src/App.tsx
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// 在路由配置中添加
<Route path="/forgot-password" component={ForgotPassword} />
<Route path="/reset-password" component={ResetPassword} />
```

#### ✅ 验收标准

- [ ] 登录页面显示"忘记密码？"链接
- [ ] 点击链接跳转到忘记密码页面
- [ ] 输入邮箱后能收到重置密码邮件（检查邮箱，包括垃圾邮件文件夹）
- [ ] 点击邮件中的链接能跳转到重置密码页面
- [ ] 输入新密码后能成功重置，并用新密码登录
- [ ] 整个流程的UI风格与现有页面一致

---

### P0-3: 添加密码可见性切换按钮

#### 📋 问题描述

登录和注册页面的密码输入框没有显示/隐藏密码的切换按钮，用户无法确认输入是否正确。

#### 🎯 期望效果

密码输入框右侧有眼睛图标，点击可以切换显示/隐藏密码。

#### 💻 技术实现

**1. 创建密码输入组件**

使用 shadcn/ui 的 Input 组件进行扩展：

```typescript
// client/src/components/ui/password-input.tsx
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from './input';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // 继承 Input 的所有属性
}

export function PasswordInput({ ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={showPassword ? 'text' : 'password'}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
      >
        {showPassword ? (
          <EyeOff className="h-5 w-5" />
        ) : (
          <Eye className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
```

**2. 在登录和注册页面使用**

```typescript
// client/src/pages/Login.tsx
import { PasswordInput } from '@/components/ui/password-input';

// 替换原来的密码输入框
<label>密码</label>
<PasswordInput
  placeholder="输入您的密码"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  required
/>
```

```typescript
// client/src/pages/Register.tsx
// 同样替换注册页面的密码和确认密码输入框
<label>密码 *</label>
<PasswordInput
  placeholder="至少8个字符"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  minLength={8}
  required
/>

<label>确认密码 *</label>
<PasswordInput
  placeholder="再次输入密码"
  value={confirmPassword}
  onChange={(e) => setConfirmPassword(e.target.value)}
  required
/>
```

#### ✅ 验收标准

- [ ] 登录页面的密码输入框右侧显示眼睛图标
- [ ] 注册页面的密码和确认密码输入框右侧都显示眼睛图标
- [ ] 点击眼睛图标，密码在明文和密文之间切换
- [ ] 图标状态正确（睁眼=显示密码，闭眼=隐藏密码）
- [ ] 切换时输入框内容不丢失
- [ ] 样式与整体设计一致

---

## P1 级任务 - 高优先级（提升用户体验）

### P1-1: 优化登录页面，增加产品介绍

#### 📋 问题描述

登录页面过于简单，新用户不了解产品是什么、有什么价值，缺少品牌标识和产品介绍。

#### 🎯 期望效果

登录页面左侧展示产品介绍和价值主张，右侧是登录表单，整体设计更有吸引力。

#### 💻 技术实现

**1. 设计双栏布局**

```typescript
// client/src/pages/Login.tsx
export default function Login() {
  return (
    <div className="min-h-screen flex">
      {/* 左侧：产品介绍 */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-500 to-green-700 p-12 flex-col justify-between">
        <div>
          <img src="/logo.svg" alt="耶氏台球" className="h-12 mb-8" />
          <h1 className="text-4xl font-bold text-white mb-4">
            科学训练，成就台球大师
          </h1>
          <p className="text-green-100 text-lg mb-8">
            耶氏台球为台球初学者提供系统化的训练课程，通过游戏化的学习方式，让你的球技稳步提升。
          </p>
          
          {/* 核心功能亮点 */}
          <div className="space-y-4">
            <FeatureItem 
              icon="🎯" 
              title="系统化训练课程" 
              description="从基础到进阶，循序渐进的学习路径"
            />
            <FeatureItem 
              icon="🤖" 
              title="AI 智能反馈" 
              description="专业的技术分析和个性化建议"
            />
            <FeatureItem 
              icon="🎮" 
              title="游戏化激励" 
              description="关卡、成就、排行榜，让训练更有趣"
            />
          </div>
        </div>
        
        {/* 底部统计数据（可选） */}
        <div className="flex gap-8 text-white">
          <div>
            <div className="text-3xl font-bold">1000+</div>
            <div className="text-green-100">活跃学员</div>
          </div>
          <div>
            <div className="text-3xl font-bold">50+</div>
            <div className="text-green-100">训练课程</div>
          </div>
        </div>
      </div>

      {/* 右侧：登录表单 */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* 移动端显示 Logo */}
          <div className="lg:hidden mb-8 text-center">
            <img src="/logo.svg" alt="耶氏台球" className="h-10 mx-auto mb-2" />
            <h2 className="text-2xl font-bold">耶氏台球</h2>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">登录</h2>
          <p className="text-gray-600 mb-6">登录您的耶氏台球账号</p>
          
          {/* 原有的登录表单 */}
          {/* ... */}
        </div>
      </div>
    </div>
  );
}

// 功能亮点组件
function FeatureItem({ icon, title, description }: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="text-2xl">{icon}</div>
      <div>
        <div className="text-white font-semibold">{title}</div>
        <div className="text-green-100 text-sm">{description}</div>
      </div>
    </div>
  );
}
```

**2. 添加 Logo**

如果还没有 Logo，可以先用文字 Logo：

```typescript
// 临时文字 Logo
<div className="flex items-center gap-2">
  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-green-600 font-bold text-xl">
    耶
  </div>
  <span className="text-white text-xl font-bold">耶氏台球</span>
</div>
```

**3. 注册页面同样处理**

注册页面也采用相同的双栏布局，保持视觉一致性。

#### ✅ 验收标准

- [ ] 桌面端显示双栏布局（左侧介绍，右侧表单）
- [ ] 移动端只显示表单，Logo 在顶部
- [ ] 产品介绍文案清晰，突出核心价值
- [ ] 三个功能亮点展示完整
- [ ] 整体视觉风格专业、有吸引力
- [ ] 响应式设计在不同屏幕尺寸下都正常显示

---

### P1-2: 增加新手引导流程

#### 📋 问题描述

新用户首次登录后不知道如何使用产品，缺少引导流程。

#### 🎯 期望效果

新用户首次登录后，看到简短的引导流程（3-4步），了解产品的核心功能和使用方法。

#### 💻 技术实现

**1. 创建引导流程组件**

使用 Framer Motion 制作引导动画：

```typescript
// client/src/components/Onboarding.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const steps = [
  {
    title: '欢迎来到耶氏台球！',
    description: '让我们用30秒了解如何开始你的台球大师之路',
    image: '/onboarding/welcome.svg',
  },
  {
    title: '关卡地图',
    description: '这是你的主要学习路径，跟随关卡循序渐进地提升球技',
    image: '/onboarding/levels.svg',
  },
  {
    title: '训练计划',
    description: '除了关卡，你还可以进行专项训练，针对性提升准度和力度',
    image: '/onboarding/training.svg',
  },
  {
    title: '开始训练吧！',
    description: '完成训练可以获得经验值和成就，冲击排行榜，与其他学员一较高下',
    image: '/onboarding/start.svg',
  },
];

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white rounded-2xl max-w-md w-full p-8 relative"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {/* 跳过按钮 */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 进度指示器 */}
        <div className="flex gap-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full ${
                index <= currentStep ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* 内容 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-center mb-6">
              <img
                src={steps[currentStep].image}
                alt={steps[currentStep].title}
                className="w-48 h-48 mx-auto mb-4"
              />
              <h3 className="text-2xl font-bold mb-2">
                {steps[currentStep].title}
              </h3>
              <p className="text-gray-600">
                {steps[currentStep].description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 按钮 */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              上一步
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            {currentStep < steps.length - 1 ? '下一步' : '开始训练'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
```

**2. 在主应用中集成**

```typescript
// client/src/App.tsx
import { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // 检查是否是新用户
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  return (
    <>
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      {/* 其他应用内容 */}
    </>
  );
}
```

**3. 准备引导图片**

如果暂时没有设计图片，可以使用简单的图标或文字占位：

```typescript
// 临时方案：用大图标代替图片
<div className="w-48 h-48 mx-auto mb-4 flex items-center justify-center bg-green-50 rounded-2xl">
  <span className="text-6xl">{steps[currentStep].icon}</span>
</div>

// 在 steps 数组中添加 icon 字段
const steps = [
  { icon: '👋', title: '欢迎...', ... },
  { icon: '🗺️', title: '关卡地图...', ... },
  { icon: '💪', title: '训练计划...', ... },
  { icon: '🚀', title: '开始训练...', ... },
];
```

#### ✅ 验收标准

- [ ] 新用户首次登录后自动显示引导流程
- [ ] 引导流程包含4个步骤，内容清晰
- [ ] 可以点击"下一步"/"上一步"切换步骤
- [ ] 可以点击"跳过"或"X"关闭引导
- [ ] 进度指示器正确显示当前步骤
- [ ] 完成引导后不再自动显示（除非清除 localStorage）
- [ ] 动画流畅，视觉效果良好

---

### P1-3: 优化关卡信息展示

#### 📋 问题描述

关卡卡片只显示星标状态，缺少关卡名称、难度、预计时长等信息，用户需要点击才能看到详情。

#### 🎯 期望效果

关卡卡片直接显示关卡编号、名称、难度、预计时长，用户一眼就能了解关卡内容。

#### 💻 技术实现

**1. 修改关卡卡片组件**

```typescript
// client/src/components/LevelCard.tsx
interface Level {
  id: number;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // 分钟
  status: 'completed' | 'current' | 'locked';
  stars: number; // 获得的星数 (0-3)
}

export function LevelCard({ level, onClick }: { 
  level: Level; 
  onClick: () => void;
}) {
  const difficultyColors = {
    easy: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50',
    hard: 'text-red-600 bg-red-50',
  };

  const difficultyLabels = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
  };

  return (
    <button
      onClick={onClick}
      disabled={level.status === 'locked'}
      className={`
        relative w-full p-4 rounded-xl border-2 transition-all
        ${level.status === 'locked' 
          ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed' 
          : 'bg-white border-green-200 hover:border-green-400 hover:shadow-lg cursor-pointer'
        }
      `}
    >
      {/* 关卡编号 */}
      <div className="absolute -top-3 -left-3 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
        {level.id}
      </div>

      {/* 锁定图标 */}
      {level.status === 'locked' && (
        <div className="absolute top-4 right-4">
          <Lock className="w-5 h-5 text-gray-400" />
        </div>
      )}

      {/* 星标（已完成的关卡） */}
      {level.status === 'completed' && (
        <div className="absolute top-4 right-4 flex gap-1">
          {[1, 2, 3].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= level.stars
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      )}

      {/* 关卡名称 */}
      <h3 className="text-lg font-semibold mb-2 pr-8">{level.name}</h3>

      {/* 难度和时长 */}
      <div className="flex items-center gap-2 text-sm">
        <span className={`px-2 py-1 rounded ${difficultyColors[level.difficulty]}`}>
          {difficultyLabels[level.difficulty]}
        </span>
        <span className="text-gray-500 flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {level.estimatedTime} 分钟
        </span>
      </div>
    </button>
  );
}
```

**2. 更新关卡数据结构**

确保后端返回的关卡数据包含这些字段：

```typescript
// server/db/schema.ts
export const levels = pgTable('levels', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  difficulty: text('difficulty').notNull(), // 'easy' | 'medium' | 'hard'
  estimatedTime: integer('estimated_time').notNull(), // 分钟
  // ... 其他字段
});
```

**3. 在关卡地图页面使用**

```typescript
// client/src/pages/Levels.tsx
export default function Levels() {
  const { data: levels } = useQuery({
    queryKey: ['levels'],
    queryFn: async () => {
      const res = await fetch('/api/levels');
      return res.json();
    },
  });

  return (
    <div className="space-y-4">
      {levels?.map((level) => (
        <LevelCard
          key={level.id}
          level={level}
          onClick={() => handleLevelClick(level)}
        />
      ))}
    </div>
  );
}
```

#### ✅ 验收标准

- [ ] 关卡卡片显示关卡编号（左上角圆形徽章）
- [ ] 显示关卡名称（如"第1集：握杆"）
- [ ] 显示难度标签（简单/中等/困难，不同颜色）
- [ ] 显示预计时长（带时钟图标）
- [ ] 已完成的关卡显示星标（1-3颗星）
- [ ] 锁定的关卡显示锁图标，且置灰不可点击
- [ ] 当前可玩的关卡有明显的视觉强调（如边框高亮）
- [ ] 鼠标悬停时有交互反馈（阴影、边框变化等）

---

### P1-4: 增加总体进度指示

#### 📋 问题描述

用户不知道总共有多少关卡、自己完成了多少，缺少整体进度感知。

#### 🎯 期望效果

在关卡地图页面顶部显示总体进度条和统计信息，如"已完成 2/35 关"。

#### 💻 技术实现

**1. 创建进度组件**

```typescript
// client/src/components/ProgressHeader.tsx
interface ProgressHeaderProps {
  completedLevels: number;
  totalLevels: number;
  currentStage: number;
  currentPart: number;
}

export function ProgressHeader({
  completedLevels,
  totalLevels,
  currentStage,
  currentPart,
}: ProgressHeaderProps) {
  const percentage = (completedLevels / totalLevels) * 100;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
      {/* 阶段信息 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">中八大师之路</h2>
          <p className="text-gray-600">
            第 {currentStage} 阶段，第 {currentPart} 部分
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-green-600">
            {completedLevels}/{totalLevels}
          </div>
          <div className="text-sm text-gray-600">已完成关卡</div>
        </div>
      </div>

      {/* 进度条 */}
      <div className="relative">
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 to-green-600"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <div className="mt-2 text-sm text-gray-600 text-right">
          {percentage.toFixed(1)}% 完成
        </div>
      </div>

      {/* 里程碑提示（可选） */}
      {percentage >= 25 && percentage < 50 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          💡 再完成 {Math.ceil(totalLevels * 0.5 - completedLevels)} 个关卡，你就达到50%里程碑了！
        </div>
      )}
    </div>
  );
}
```

**2. 在关卡地图页面使用**

```typescript
// client/src/pages/Levels.tsx
export default function Levels() {
  const { data: progress } = useQuery({
    queryKey: ['user', 'progress'],
    queryFn: async () => {
      const res = await fetch('/api/user/progress');
      return res.json();
    },
  });

  return (
    <div className="container mx-auto p-4">
      <ProgressHeader
        completedLevels={progress?.completedLevels || 0}
        totalLevels={progress?.totalLevels || 35}
        currentStage={progress?.currentStage || 1}
        currentPart={progress?.currentPart || 1}
      />
      
      {/* 关卡列表 */}
      {/* ... */}
    </div>
  );
}
```

**3. 后端提供进度数据**

```typescript
// server/routes/user.ts
router.get('/progress', async (req, res) => {
  const userId = req.user.id;
  
  // 查询用户完成的关卡数
  const completedLevels = await db
    .select({ count: sql<number>`count(*)` })
    .from(userLevels)
    .where(eq(userLevels.userId, userId))
    .where(eq(userLevels.completed, true));

  // 查询总关卡数
  const totalLevels = await db
    .select({ count: sql<number>`count(*)` })
    .from(levels);

  // 计算当前阶段和部分
  const completed = completedLevels[0].count;
  const currentStage = Math.floor(completed / 30) + 1;
  const currentPart = Math.floor((completed % 30) / 10) + 1;

  res.json({
    completedLevels: completed,
    totalLevels: totalLevels[0].count,
    currentStage,
    currentPart,
  });
});
```

#### ✅ 验收标准

- [ ] 关卡地图页面顶部显示进度组件
- [ ] 显示"已完成 X/总共 Y 关"
- [ ] 显示百分比进度（如"5.7% 完成"）
- [ ] 进度条有动画效果，从0%动画到实际进度
- [ ] 进度条颜色使用品牌色（绿色）
- [ ] 完成关卡后，进度数据实时更新
- [ ] 里程碑提示在合适的时机显示（可选）

---

### P1-5: 优化 AI 反馈展示

#### 📋 问题描述

练球日志中的 AI 教练反馈文本很长，全部展示在一个段落中，阅读体验不佳。

#### 🎯 期望效果

AI 反馈分类展示（技术建议、鼓励、下一步），使用卡片或标签形式，提高可读性。

#### 💻 技术实现

**1. 解析 AI 反馈内容**

假设 AI 反馈是结构化的 JSON 或包含特定标记的文本：

```typescript
// client/src/utils/parseAIFeedback.ts
interface AIFeedback {
  技术建议: string[];
  鼓励: string;
  下一步: string;
}

export function parseAIFeedback(rawFeedback: string): AIFeedback {
  // 如果后端已经返回结构化数据，直接使用
  try {
    return JSON.parse(rawFeedback);
  } catch {
    // 否则，尝试从文本中提取
    // 这里需要根据实际的 AI 反馈格式进行解析
    return {
      技术建议: extractTips(rawFeedback),
      鼓励: extractEncouragement(rawFeedback),
      下一步: extractNextSteps(rawFeedback),
    };
  }
}

function extractTips(text: string): string[] {
  // 提取技术建议部分
  // 示例：查找 "技术建议：" 后的内容
  const match = text.match(/技术建议[：:](.*?)(?=鼓励|下一步|$)/s);
  if (match) {
    return match[1].split(/[。.]\s*/).filter(Boolean);
  }
  return [];
}

// 类似地实现 extractEncouragement 和 extractNextSteps
```

**2. 创建反馈展示组件**

```typescript
// client/src/components/AIFeedbackCard.tsx
import { Lightbulb, Heart, ArrowRight } from 'lucide-react';

interface AIFeedbackCardProps {
  feedback: {
    技术建议: string[];
    鼓励: string;
    下一步: string;
  };
}

export function AIFeedbackCard({ feedback }: AIFeedbackCardProps) {
  return (
    <div className="space-y-3">
      {/* 技术建议 */}
      {feedback.技术建议.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2 text-blue-800 font-semibold">
            <Lightbulb className="w-5 h-5" />
            技术建议
          </div>
          <ul className="space-y-1 text-sm text-blue-900">
            {feedback.技术建议.map((tip, index) => (
              <li key={index} className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 鼓励 */}
      {feedback.鼓励 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2 text-green-800 font-semibold">
            <Heart className="w-5 h-5" />
            鼓励
          </div>
          <p className="text-sm text-green-900">{feedback.鼓励}</p>
        </div>
      )}

      {/* 下一步 */}
      {feedback.下一步 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2 text-purple-800 font-semibold">
            <ArrowRight className="w-5 h-5" />
            下一步
          </div>
          <p className="text-sm text-purple-900">{feedback.下一步}</p>
        </div>
      )}
    </div>
  );
}
```

**3. 在练球日志中使用**

```typescript
// client/src/pages/Tasks.tsx (或相应的日志展示页面)
import { parseAIFeedback } from '@/utils/parseAIFeedback';
import { AIFeedbackCard } from '@/components/AIFeedbackCard';

export default function Tasks() {
  const { data: logs } = useQuery({
    queryKey: ['training', 'logs'],
    queryFn: async () => {
      const res = await fetch('/api/training/logs');
      return res.json();
    },
  });

  return (
    <div>
      {logs?.map((log) => {
        const feedback = parseAIFeedback(log.aiFeedback);
        
        return (
          <div key={log.id} className="mb-6">
            <h3>{log.title}</h3>
            <p>完成时间: {log.completedAt}</p>
            
            {/* AI 反馈 */}
            <div className="mt-4">
              <h4 className="font-semibold mb-2">AI 教练反馈</h4>
              <AIFeedbackCard feedback={feedback} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

**4. 优化后端 AI 反馈生成**

建议让 AI 直接返回结构化数据：

```typescript
// server/services/ai.ts
export async function generateFeedback(trainingData: any) {
  const prompt = `
    请分析用户的训练数据，并提供结构化反馈。
    返回 JSON 格式：
    {
      "技术建议": ["建议1", "建议2"],
      "鼓励": "鼓励的话",
      "下一步": "下一步建议"
    }
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content);
}
```

#### ✅ 验收标准

- [ ] AI 反馈分为三个部分：技术建议、鼓励、下一步
- [ ] 每个部分使用不同颜色的卡片展示（蓝色、绿色、紫色）
- [ ] 每个部分有对应的图标（灯泡、爱心、箭头）
- [ ] 技术建议以列表形式展示，每条建议单独一行
- [ ] 整体布局清晰，易于阅读
- [ ] 如果某个部分没有内容，不显示该卡片

---

## P2 级任务 - 中优先级（增强产品竞争力）

### P2-1: 完善成就系统

#### 📋 问题描述

个人档案中的"成就徽章"模块是空的，功能未实现。

#### 🎯 期望效果

设计一套完整的成就体系，包括里程碑成就、技能成就等，每个成就有图标、获取条件、奖励。

#### 💻 技术实现

**1. 定义成就数据结构**

```typescript
// server/db/schema.ts
export const achievements = pgTable('achievements', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(), // 'milestone' | 'skill' | 'social'
  icon: text('icon').notNull(), // emoji 或图标名称
  condition: text('condition').notNull(), // JSON 格式的获取条件
  reward: integer('reward').notNull(), // 经验值奖励
  createdAt: timestamp('created_at').defaultNow(),
});

export const userAchievements = pgTable('user_achievements', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  achievementId: integer('achievement_id').references(() => achievements.id),
  unlockedAt: timestamp('unlocked_at').defaultNow(),
  progress: integer('progress').default(0), // 当前进度
  total: integer('total').notNull(), // 总目标
});
```

**2. 初始化成就数据**

```typescript
// server/db/seed-achievements.ts
const achievementsData = [
  {
    name: '初次尝试',
    description: '完成第一次训练',
    category: 'milestone',
    icon: '🎯',
    condition: JSON.stringify({ type: 'complete_training', count: 1 }),
    reward: 10,
  },
  {
    name: '坚持不懈',
    description: '连续训练7天',
    category: 'milestone',
    icon: '🔥',
    condition: JSON.stringify({ type: 'streak_days', count: 7 }),
    reward: 50,
  },
  {
    name: '准度大师',
    description: '完成10次准度训练',
    category: 'skill',
    icon: '🎱',
    condition: JSON.stringify({ type: 'accuracy_training', count: 10 }),
    reward: 30,
  },
  {
    name: '力度专家',
    description: '完成10次力度训练',
    category: 'skill',
    icon: '💪',
    condition: JSON.stringify({ type: 'power_training', count: 10 }),
    reward: 30,
  },
  {
    name: '阶段完成',
    description: '完成第一阶段所有关卡',
    category: 'milestone',
    icon: '🏆',
    condition: JSON.stringify({ type: 'complete_stage', stage: 1 }),
    reward: 100,
  },
];

// 插入数据库
await db.insert(achievements).values(achievementsData);
```

**3. 创建成就展示组件**

```typescript
// client/src/components/AchievementGrid.tsx
interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  total?: number;
  unlockedAt?: string;
}

export function AchievementGrid({ achievements }: { achievements: Achievement[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {achievements.map((achievement) => (
        <AchievementCard key={achievement.id} achievement={achievement} />
      ))}
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <div
      className={`
        relative p-4 rounded-xl border-2 transition-all
        ${achievement.unlocked
          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300'
          : 'bg-gray-50 border-gray-200 opacity-60'
        }
      `}
    >
      {/* 图标 */}
      <div className="text-4xl mb-2 text-center">
        {achievement.icon}
      </div>

      {/* 名称 */}
      <h4 className="font-semibold text-center mb-1">
        {achievement.name}
      </h4>

      {/* 描述 */}
      <p className="text-xs text-gray-600 text-center mb-2">
        {achievement.description}
      </p>

      {/* 进度条（未解锁的成就） */}
      {!achievement.unlocked && achievement.progress !== undefined && (
        <div className="mt-2">
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500"
              style={{ width: `${(achievement.progress / achievement.total!) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 text-center mt-1">
            {achievement.progress}/{achievement.total}
          </div>
        </div>
      )}

      {/* 解锁时间 */}
      {achievement.unlocked && achievement.unlockedAt && (
        <div className="text-xs text-gray-500 text-center mt-2">
          {new Date(achievement.unlockedAt).toLocaleDateString()}
        </div>
      )}

      {/* 解锁标记 */}
      {achievement.unlocked && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
}
```

**4. 成就检查和解锁逻辑**

```typescript
// server/services/achievements.ts
export async function checkAndUnlockAchievements(userId: number, action: string, data: any) {
  // 获取所有未解锁的成就
  const unlockedAchievementIds = await db
    .select({ achievementId: userAchievements.achievementId })
    .from(userAchievements)
    .where(eq(userAchievements.userId, userId));

  const unlockedIds = unlockedAchievementIds.map(a => a.achievementId);

  const availableAchievements = await db
    .select()
    .from(achievements)
    .where(notInArray(achievements.id, unlockedIds));

  const newlyUnlocked: number[] = [];

  for (const achievement of availableAchievements) {
    const condition = JSON.parse(achievement.condition);
    
    // 检查是否满足条件
    const isMet = await checkCondition(userId, condition, action, data);
    
    if (isMet) {
      // 解锁成就
      await db.insert(userAchievements).values({
        userId,
        achievementId: achievement.id,
        progress: condition.count || 1,
        total: condition.count || 1,
      });

      // 奖励经验值
      await db
        .update(users)
        .set({ experience: sql`${users.experience} + ${achievement.reward}` })
        .where(eq(users.id, userId));

      newlyUnlocked.push(achievement.id);
    }
  }

  return newlyUnlocked;
}

async function checkCondition(userId: number, condition: any, action: string, data: any): Promise<boolean> {
  switch (condition.type) {
    case 'complete_training':
      // 检查完成训练次数
      const trainingCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(trainingLogs)
        .where(eq(trainingLogs.userId, userId));
      return trainingCount[0].count >= condition.count;

    case 'streak_days':
      // 检查连续天数
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      return user[0].streakDays >= condition.count;

    // 其他条件...
    default:
      return false;
  }
}
```

**5. 在完成训练后触发成就检查**

```typescript
// server/routes/training.ts
router.post('/complete', async (req, res) => {
  const userId = req.user.id;
  const { levelId, duration } = req.body;

  // 记录训练完成
  await db.insert(trainingLogs).values({
    userId,
    levelId,
    duration,
    completedAt: new Date(),
  });

  // 检查并解锁成就
  const newAchievements = await checkAndUnlockAchievements(
    userId,
    'complete_training',
    { levelId, duration }
  );

  res.json({
    success: true,
    newAchievements, // 返回新解锁的成就，前端可以显示庆祝动画
  });
});
```

**6. 成就解锁动画**

```typescript
// client/src/components/AchievementUnlockModal.tsx
import { motion } from 'framer-motion';

export function AchievementUnlockModal({ 
  achievement, 
  onClose 
}: { 
  achievement: Achievement; 
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        className="bg-white rounded-2xl p-8 max-w-md text-center"
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 0.5 }}
      >
        <motion.div
          className="text-6xl mb-4"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          {achievement.icon}
        </motion.div>

        <h2 className="text-2xl font-bold mb-2">成就解锁！</h2>
        <h3 className="text-xl font-semibold text-green-600 mb-2">
          {achievement.name}
        </h3>
        <p className="text-gray-600 mb-4">{achievement.description}</p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <span className="text-yellow-800">
            +{achievement.reward} 经验值
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          太棒了！
        </button>
      </motion.div>
    </div>
  );
}
```

#### ✅ 验收标准

- [ ] 个人档案页面显示成就网格
- [ ] 已解锁的成就有金色背景和勾选标记
- [ ] 未解锁的成就显示进度条
- [ ] 完成训练后，如果解锁新成就，显示庆祝动画
- [ ] 成就分类清晰（里程碑、技能等）
- [ ] 至少有5-10个不同的成就
- [ ] 成就解锁后，经验值正确增加

---

### P2-2: 增加数据可视化

#### 📋 问题描述

个人档案中的训练统计只有简单的数字，缺少图表、趋势分析等数据可视化。

#### 🎯 期望效果

在个人档案中增加训练时长趋势图、经验值增长曲线、各项能力雷达图等可视化内容。

#### 💻 技术实现

由于这个任务较大，建议分成几个子任务：

**子任务 2-2-1：训练时长趋势图**

使用 Recharts 库（轻量级图表库）：

```bash
pnpm add recharts
```

```typescript
// client/src/components/TrainingTrendChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TrainingTrendChartProps {
  data: Array<{ date: string; duration: number }>;
}

export function TrainingTrendChart({ data }: TrainingTrendChartProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">训练时长趋势</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            label={{ value: '分钟', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="duration" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

**子任务 2-2-2：能力雷达图**

```typescript
// client/src/components/SkillRadarChart.tsx
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface SkillRadarChartProps {
  skills: Array<{ name: string; value: number; fullMark: number }>;
}

export function SkillRadarChart({ skills }: SkillRadarChartProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">能力分析</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={skills}>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" />
          <PolarRadiusAxis />
          <Radar 
            name="能力值" 
            dataKey="value" 
            stroke="#10b981" 
            fill="#10b981" 
            fillOpacity={0.6} 
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// 使用示例
const skills = [
  { name: '准度', value: 70, fullMark: 100 },
  { name: '力度', value: 60, fullMark: 100 },
  { name: '走位', value: 50, fullMark: 100 },
  { name: '策略', value: 40, fullMark: 100 },
  { name: '心态', value: 80, fullMark: 100 },
];
```

**子任务 2-2-3：后端提供数据**

```typescript
// server/routes/user.ts
router.get('/stats/trend', async (req, res) => {
  const userId = req.user.id;
  const days = parseInt(req.query.days as string) || 30;

  // 获取最近N天的训练数据
  const trend = await db
    .select({
      date: sql<string>`DATE(${trainingLogs.completedAt})`,
      duration: sql<number>`SUM(${trainingLogs.duration})`,
    })
    .from(trainingLogs)
    .where(eq(trainingLogs.userId, userId))
    .where(sql`${trainingLogs.completedAt} >= NOW() - INTERVAL '${days} days'`)
    .groupBy(sql`DATE(${trainingLogs.completedAt})`)
    .orderBy(sql`DATE(${trainingLogs.completedAt})`);

  res.json(trend);
});

router.get('/stats/skills', async (req, res) => {
  const userId = req.user.id;

  // 计算各项能力值
  // 这里需要根据实际的能力评估逻辑来计算
  const skills = [
    { name: '准度', value: await calculateAccuracy(userId), fullMark: 100 },
    { name: '力度', value: await calculatePower(userId), fullMark: 100 },
    // ... 其他能力
  ];

  res.json(skills);
});
```

**子任务 2-2-4：在个人档案中集成**

```typescript
// client/src/pages/Profile.tsx
export default function Profile() {
  const { data: trendData } = useQuery({
    queryKey: ['stats', 'trend'],
    queryFn: async () => {
      const res = await fetch('/api/user/stats/trend?days=30');
      return res.json();
    },
  });

  const { data: skillsData } = useQuery({
    queryKey: ['stats', 'skills'],
    queryFn: async () => {
      const res = await fetch('/api/user/stats/skills');
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      {/* 其他内容 */}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrainingTrendChart data={trendData || []} />
        <SkillRadarChart skills={skillsData || []} />
      </div>
    </div>
  );
}
```

#### ✅ 验收标准

- [ ] 个人档案页面显示训练时长趋势图
- [ ] 趋势图显示最近30天的数据
- [ ] 显示能力雷达图，包含至少5个维度
- [ ] 图表响应式设计，在不同屏幕尺寸下正常显示
- [ ] 图表有交互提示（鼠标悬停显示具体数值）
- [ ] 数据准确，与实际训练记录一致

---

### P2-3: 增加完成训练后的即时反馈动画

#### 📋 问题描述

用户完成训练后，没有即时的成就感反馈，缺少动画效果和经验值增加的动态展示。

#### 🎯 期望效果

完成训练后，显示庆祝动画、经验值增加的数字动画、等级提升的提示等。

#### 💻 技术实现

**1. 创建完成训练的庆祝组件**

```typescript
// client/src/components/TrainingCompleteModal.tsx
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/useWindowSize';

interface TrainingCompleteModalProps {
  levelName: string;
  earnedExp: number;
  stars: number;
  onClose: () => void;
}

export function TrainingCompleteModal({
  levelName,
  earnedExp,
  stars,
  onClose,
}: TrainingCompleteModalProps) {
  const { width, height } = useWindowSize();

  return (
    <>
      {/* 彩纸效果 */}
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={200}
      />

      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <motion.div
          className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
          initial={{ scale: 0, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          {/* 标题 */}
          <motion.h2
            className="text-3xl font-bold text-green-600 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            训练完成！
          </motion.h2>

          {/* 关卡名称 */}
          <p className="text-lg text-gray-700 mb-6">{levelName}</p>

          {/* 星标 */}
          <motion.div
            className="flex justify-center gap-2 mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            {[1, 2, 3].map((star) => (
              <motion.div
                key={star}
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ delay: 0.3 + star * 0.1 }}
              >
                <Star
                  className={`w-12 h-12 ${
                    star <= stars
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* 经验值增加动画 */}
          <motion.div
            className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring' }}
          >
            <div className="text-sm text-gray-600 mb-1">获得经验值</div>
            <motion.div
              className="text-4xl font-bold text-green-600"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              +{earnedExp}
            </motion.div>
          </motion.div>

          {/* 继续按钮 */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
          >
            继续训练
          </button>
        </motion.div>
      </div>
    </>
  );
}
```

**2. 安装依赖**

```bash
pnpm add react-confetti
```

**3. 创建窗口尺寸 Hook**

```typescript
// client/src/hooks/useWindowSize.ts
import { useState, useEffect } from 'react';

export function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function updateSize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
    
    window.addEventListener('resize', updateSize);
    updateSize();
    
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return size;
}
```

**4. 在关卡页面中使用**

```typescript
// client/src/pages/Levels.tsx
export default function Levels() {
  const [showComplete, setShowComplete] = useState(false);
  const [completeData, setCompleteData] = useState(null);

  const handleCompleteTraining = async (levelId: number, duration: number) => {
    const res = await fetch('/api/training/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ levelId, duration }),
    });

    const data = await res.json();
    
    // 显示完成动画
    setCompleteData(data);
    setShowComplete(true);

    // 如果有新成就，也显示成就解锁动画
    if (data.newAchievements?.length > 0) {
      // ... 显示成就解锁
    }
  };

  return (
    <>
      {/* 关卡列表 */}
      {/* ... */}

      {/* 完成动画 */}
      {showComplete && completeData && (
        <TrainingCompleteModal
          levelName={completeData.levelName}
          earnedExp={completeData.earnedExp}
          stars={completeData.stars}
          onClose={() => {
            setShowComplete(false);
            // 刷新用户数据
            queryClient.invalidateQueries(['user', 'profile']);
          }}
        />
      )}
    </>
  );
}
```

#### ✅ 验收标准

- [ ] 完成训练后显示庆祝动画
- [ ] 有彩纸效果（可选，如果性能允许）
- [ ] 显示获得的星数（1-3颗星）
- [ ] 经验值增加有数字动画效果
- [ ] 整体动画流畅，不卡顿
- [ ] 点击"继续训练"后，用户数据（经验值等）已更新

---

## 附录：检查清单模板

每完成一个任务后，使用以下清单进行自检：

### 功能检查
- [ ] 功能按照需求正常工作
- [ ] 边界情况处理正确（如空数据、网络错误等）
- [ ] 与现有功能没有冲突

### 用户体验检查
- [ ] 界面响应速度快（< 100ms）
- [ ] 有适当的加载状态提示
- [ ] 有错误提示和处理
- [ ] 移动端和桌面端都能正常使用

### 代码质量检查
- [ ] TypeScript 类型定义完整
- [ ] 没有 console.log 等调试代码
- [ ] 代码格式符合项目规范
- [ ] 组件和函数命名清晰

### 数据检查
- [ ] 数据库查询优化（避免 N+1 问题）
- [ ] 数据验证完整（前端 + 后端）
- [ ] 敏感数据处理安全

### 测试检查
- [ ] 手动测试所有功能路径
- [ ] 测试不同用户角色（新用户、老用户）
- [ ] 测试不同数据状态（有数据、无数据）

---

## 下一步建议

完成以上 P0 和 P1 任务后，建议：

1. **收集用户反馈**：邀请一些初学者试用，收集真实反馈
2. **数据分析**：观察用户行为数据，找出流失点和改进方向
3. **付费转化准备**：设计付费关卡的解锁机制和定价策略
4. **性能优化**：使用 Lighthouse 等工具进行性能测试和优化
5. **SEO 优化**：优化网站的搜索引擎可见性，吸引自然流量

祝开发顺利！如有问题随时沟通。
