# 🚀 Supabase Auth 迁移实施计划

## 📋 执行概览

**目标：** 从自建认证系统迁移到 Supabase Auth，实现零停机迁移，保留所有用户数据。

**预计时间：** 2-3 天（总计 12-15 工作小时）

**关键策略：** 懒迁移（Lazy Migration）- 用户首次登录时自动迁移密码

---

## 🏗️ 架构对比

### 当前架构（自建）
```
┌─────────────────────────────────────────┐
│  Frontend (React + TanStack Query)     │
│  - 调用 /api/auth/login                │
│  - 管理 session cookie                 │
└────────────────┬────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────┐
│  Backend (Express + express-session)   │
│  - bcrypt 密码验证                     │
│  - Session 存储在 PostgreSQL           │
└────────────────┬────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────┐
│  Database (Supabase PostgreSQL)        │
│  - public.users (含 password_hash)     │
│  - public.sessions                     │
└─────────────────────────────────────────┘
```

### 目标架构（Supabase Auth）
```
┌─────────────────────────────────────────┐
│  Frontend (React + supabase-js)        │
│  - supabase.auth.signIn()              │
│  - 自动管理 JWT tokens                 │
└────────────────┬────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────┐
│  Supabase Auth Service                 │
│  - 内置密码验证                         │
│  - JWT token 生成                      │
│  - OAuth、2FA、邮件验证                │
└────────────────┬────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────┐
│  Database (Supabase PostgreSQL)        │
│  - auth.users (Supabase 管理)          │
│  - public.users (业务数据 + RLS)       │
└─────────────────────────────────────────┘
```

---

## 📅 分阶段实施计划

### Phase 1: 准备阶段（2-3 小时）

#### 1.1 在 Supabase Dashboard 启用 Auth
1. 登录 Supabase Dashboard
2. 进入 **Authentication** → **Providers**
3. 启用 **Email** provider
4. 配置密码要求：
   - ✅ Minimum password length: 8
   - ✅ Enable email confirmations: **关闭**（避免迁移时需要验证）
5. 获取项目配置：
   - `SUPABASE_URL`: `https://xxx.supabase.co`
   - `SUPABASE_ANON_KEY`: `eyJ...`（公开密钥）
   - `SUPABASE_SERVICE_ROLE_KEY`: `eyJ...`（管理密钥，保密！）

#### 1.2 理解 Supabase Auth 表结构
```sql
-- Supabase 自动创建的表
auth.users (
  id uuid PRIMARY KEY,           -- 用户唯一 ID
  email text UNIQUE,             -- 邮箱
  encrypted_password text,       -- Supabase 管理的密码哈希
  email_confirmed_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  raw_user_meta_data jsonb,     -- 自定义元数据（firstName, lastName 等）
  ...
)
```

#### 1.3 规划数据模型关联
```
auth.users (Supabase 管理)
    ↓ (1:1 关系，通过 id)
public.users (你的业务数据)
    - id uuid PRIMARY KEY REFERENCES auth.users(id)
    - level, exp, streak, totalDays, etc.
```

---

### Phase 2: 数据库架构调整（2-3 小时）

#### 2.1 修改 users 表 Schema

**当前 public.users 结构问题：**
- `id` 是 `varchar` 类型
- `password_hash` 存储在这个表中
- 没有与 `auth.users` 的关联

**目标结构：**
```sql
-- 1. 创建临时迁移标记列
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS supabase_user_id uuid,
ADD COLUMN IF NOT EXISTS migrated_to_supabase boolean DEFAULT false;

-- 2. 创建索引加速查询
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON public.users(supabase_user_id);
```

#### 2.2 创建自动同步触发器

当新用户通过 Supabase Auth 注册时，自动在 `public.users` 创建记录：

```sql
-- 创建触发器函数
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger AS $$
BEGIN
  -- 在 public.users 创建对应记录
  INSERT INTO public.users (
    id,
    supabase_user_id,
    email,
    first_name,
    last_name,
    username,
    migrated_to_supabase
  )
  VALUES (
    gen_random_uuid(), -- 保持现有的 varchar id 结构
    new.id,            -- 关联到 auth.users.id
    new.email,
    COALESCE(new.raw_user_meta_data->>'firstName', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'lastName',
    lower(split_part(new.email, '@', 1)) || '-' || substring(new.id::text, 1, 8),
    true
  )
  ON CONFLICT (email) DO UPDATE
  SET supabase_user_id = new.id,
      migrated_to_supabase = true;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();
```

#### 2.3 验证触发器

```sql
-- 测试：创建一个测试用户（通过 Supabase Auth）
-- 然后检查 public.users 是否自动创建了记录

SELECT
  au.id as auth_id,
  au.email as auth_email,
  pu.id as public_id,
  pu.supabase_user_id,
  pu.migrated_to_supabase
FROM auth.users au
LEFT JOIN public.users pu ON pu.supabase_user_id = au.id
LIMIT 5;
```

---

### Phase 3: 懒迁移逻辑实现（3-4 小时）

#### 3.1 安装依赖

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

#### 3.2 创建 Supabase Admin Client

```typescript
// server/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// 管理员客户端，可以绕过 RLS
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
```

#### 3.3 实现懒迁移 API

```typescript
// server/routes.ts 或 api/auth/migrate-login.ts
import { supabaseAdmin } from './supabaseAdmin.js';
import { comparePassword } from './passwordService.js';
import { storage } from './storage.js';

app.post('/api/auth/migrate-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Step 1: 尝试直接用 Supabase Auth 登录
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (signInData?.user && signInData?.session) {
      // 成功：用户已经迁移过了
      console.log(`User ${email} already migrated, login successful`);
      return res.json({
        success: true,
        session: signInData.session,
        user: signInData.user,
        migrated: true,
      });
    }

    // Step 2: Supabase 登录失败，检查是否是旧用户
    const oldUser = await storage.getUserByEmail(normalizedEmail);

    if (!oldUser || !oldUser.passwordHash) {
      console.log(`User ${email} not found or no password`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Step 3: 验证旧密码
    const isValidPassword = await comparePassword(password, oldUser.passwordHash);

    if (!isValidPassword) {
      console.log(`Invalid password for ${email}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Step 4: 旧密码正确，迁移到 Supabase Auth
    console.log(`Migrating user ${email} to Supabase Auth...`);

    const { data: newUserData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true, // 跳过邮件验证
      user_metadata: {
        firstName: oldUser.firstName,
        lastName: oldUser.lastName,
      },
    });

    if (createError) {
      console.error(`Failed to create Supabase user for ${email}:`, createError);
      return res.status(500).json({ error: 'Migration failed' });
    }

    // Step 5: 更新 public.users 表，关联 Supabase user ID
    await storage.updateUser(oldUser.id, {
      supabaseUserId: newUserData.user.id,
      migratedToSupabase: true,
      passwordHash: null, // 清空旧密码
    });

    // Step 6: 创建新的 session token
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: normalizedEmail,
    });

    if (sessionError) {
      console.error(`Failed to generate session for ${email}:`, sessionError);
      return res.status(500).json({ error: 'Session generation failed' });
    }

    console.log(`✅ User ${email} successfully migrated to Supabase Auth`);

    return res.json({
      success: true,
      user: newUserData.user,
      migrated: true,
      message: 'Account migrated successfully',
    });
  } catch (error) {
    console.error('Migration login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
```

#### 3.4 更新 storage.ts 类型

```typescript
// server/storage.ts
export interface IStorage {
  // ... 现有方法
  updateUser(id: string, updates: Partial<User> & {
    supabaseUserId?: string;
    migratedToSupabase?: boolean;
  }): Promise<User>;
}
```

---

### Phase 4: 前端重构（3-4 小时）

#### 4.1 安装 Supabase Client

```bash
npm install @supabase/supabase-js
```

#### 4.2 创建 Supabase Client

```typescript
// client/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
```

#### 4.3 创建环境变量

```bash
# .env.local (开发环境)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

**Vercel 环境变量：**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (后端使用，不要暴露给前端!)

#### 4.4 更新 useAuth Hook

```typescript
// client/src/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 获取当前 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // 监听 auth 状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
  };
}
```

#### 4.5 重构 Login 页面

```typescript
// client/src/pages/Login.tsx
import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ email: '', password: '' });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      // 尝试懒迁移登录
      const migrateRes = await fetch('/api/auth/migrate-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (migrateRes.ok) {
        const migrateData = await migrateRes.json();
        if (migrateData.migrated) {
          // 迁移成功，现在用 Supabase 登录
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;
          return { data, migrated: true };
        }
      }

      // 如果迁移端点失败，尝试直接 Supabase 登录
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, migrated: false };
    },
    onSuccess: ({ migrated }) => {
      queryClient.invalidateQueries();
      toast({
        title: '登录成功！',
        description: migrated ? '您的账号已升级到新的认证系统' : '欢迎回来',
      });
      setLocation('/levels');
    },
    onError: (error: Error) => {
      toast({
        title: '登录失败',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast({
        title: '请填写所有字段',
        description: '邮箱和密码都是必填的',
        variant: 'destructive',
      });
      return;
    }
    loginMutation.mutate(form);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-green-800">登录</h1>
          <p className="text-gray-600">登录您的叶式台球账号</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? '登录中...' : '登录'}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-600">还没有账号？</span>{' '}
          <a href="/register" className="text-green-600 hover:text-green-700 font-medium">
            立即注册
          </a>
        </div>
      </Card>
    </div>
  );
}
```

#### 4.6 重构 Register 页面

```typescript
// client/src/pages/Register.tsx
import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });

  const registerMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
          },
        },
      });

      if (error) throw error;
      return signUpData;
    },
    onSuccess: () => {
      toast({
        title: '注册成功！',
        description: '请使用您的账号登录',
      });
      setLocation('/login');
    },
    onError: (error: Error) => {
      toast({
        title: '注册失败',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 验证
    if (!form.email || !form.password || !form.firstName) {
      toast({
        title: '请填写所有必填项',
        variant: 'destructive',
      });
      return;
    }

    if (form.password.length < 8) {
      toast({
        title: '密码太短',
        description: '密码至少需要8个字符',
        variant: 'destructive',
      });
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast({
        title: '密码不匹配',
        variant: 'destructive',
      });
      return;
    }

    registerMutation.mutate(form);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-green-800">注册账号</h1>
          <p className="text-gray-600">创建您的叶式台球账号</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱 *</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstName">名字 *</Label>
            <Input
              id="firstName"
              type="text"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">姓氏</Label>
            <Input
              id="lastName"
              type="text"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码 *</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">确认密码 *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? '注册中...' : '注册'}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-600">已有账号？</span>{' '}
          <a href="/login" className="text-green-600 hover:text-green-700 font-medium">
            立即登录
          </a>
        </div>
      </Card>
    </div>
  );
}
```

---

### Phase 5: Row Level Security 设置（2 小时）

#### 5.1 启用 RLS

```sql
-- 为所有业务表启用 RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
```

#### 5.2 创建基础策略

```sql
-- 用户只能读取自己的数据
CREATE POLICY "Users can read own profile"
ON public.users
FOR SELECT
USING (
  supabase_user_id = auth.uid()
  OR
  auth.uid() IS NULL -- 允许未登录用户读取（如果需要）
);

-- 用户只能更新自己的数据
CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
USING (supabase_user_id = auth.uid())
WITH CHECK (supabase_user_id = auth.uid());

-- 训练记录策略
CREATE POLICY "Users can read own training sessions"
ON public.training_sessions
FOR SELECT
USING (
  user_id IN (
    SELECT id FROM public.users WHERE supabase_user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own training sessions"
ON public.training_sessions
FOR INSERT
WITH CHECK (
  user_id IN (
    SELECT id FROM public.users WHERE supabase_user_id = auth.uid()
  )
);

-- 日记策略
CREATE POLICY "Users can manage own diary entries"
ON public.diary_entries
FOR ALL
USING (
  user_id IN (
    SELECT id FROM public.users WHERE supabase_user_id = auth.uid()
  )
);
```

#### 5.3 测试 RLS

```sql
-- 以特定用户身份测试（在 Supabase SQL Editor）
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claim.sub TO 'user-uuid-here';

-- 尝试查询数据
SELECT * FROM public.training_sessions LIMIT 10;
-- 应该只返回该用户的记录
```

---

### Phase 6: 清理和测试（2 小时）

#### 6.1 移除旧代码

**删除文件：**
- `server/passwordService.ts`
- 旧版 `client/src/pages/Login.tsx` 和 `Register.tsx`（已被新版本替换）

**修改文件：**
```typescript
// server/auth.ts - 移除自建认证逻辑
// 保留 isAuthenticated 中间件，但改为验证 Supabase JWT

import { supabase } from './supabaseAdmin.js';

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  // 将用户信息附加到 request
  (req as any).user = user;
  next();
};
```

#### 6.2 更新 package.json

```bash
# 移除不再需要的依赖
npm uninstall express-session connect-pg-simple bcryptjs @types/bcryptjs

# 确认新依赖已安装
npm list @supabase/supabase-js
```

#### 6.3 端到端测试清单

- [ ] **新用户注册**
  - 访问 `/register`
  - 填写表单并提交
  - 检查 `auth.users` 表有记录
  - 检查 `public.users` 表自动创建记录
  - 检查 `supabase_user_id` 正确关联

- [ ] **新用户登录**
  - 使用刚注册的账号登录
  - 检查是否跳转到 `/levels`
  - 检查 localStorage 有 JWT token
  - 刷新页面，session 应该保持

- [ ] **旧用户迁移**
  - 使用旧系统中的账号登录
  - 应该自动触发迁移
  - 检查 `auth.users` 表新增记录
  - 检查 `public.users` 表的 `supabase_user_id` 已更新
  - 检查 `password_hash` 已清空

- [ ] **RLS 策略验证**
  - 登录用户 A
  - 尝试访问用户 B 的数据（通过直接查询）
  - 应该被 RLS 阻止

- [ ] **退出登录**
  - 点击退出
  - 检查 token 被清除
  - 访问 `/levels` 应该跳转到 `/login`

---

## 🚨 回滚计划

如果迁移出现严重问题：

### 快速回滚（5 分钟）
```bash
# 1. Git 回滚到迁移前的 commit
git revert HEAD
git push origin main

# 2. Vercel 会自动部署旧版本
```

### 数据库回滚（10 分钟）
```sql
-- 1. 禁用触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. 移除迁移列
ALTER TABLE public.users
DROP COLUMN IF EXISTS supabase_user_id,
DROP COLUMN IF EXISTS migrated_to_supabase;

-- 3. 禁用 RLS（如果影响查询）
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_sessions DISABLE ROW LEVEL SECURITY;
-- ... 其他表
```

---

## 📊 迁移监控

### 关键指标
- 迁移用户数：`SELECT COUNT(*) FROM public.users WHERE migrated_to_supabase = true;`
- 未迁移用户数：`SELECT COUNT(*) FROM public.users WHERE migrated_to_supabase = false;`
- 登录成功率：监控 `/api/auth/migrate-login` 的响应状态码
- RLS 策略阻止次数：检查 Supabase 日志

---

## ✅ 成功标准

迁移成功当：
1. ✅ 所有活跃用户已迁移到 Supabase Auth
2. ✅ 新用户可以注册和登录
3. ✅ RLS 策略正确保护数据
4. ✅ 旧认证代码已完全移除
5. ✅ 无用户报告登录问题
6. ✅ 性能指标与迁移前相当或更好

---

**准备开始实施了吗？** 🚀

建议从 Phase 1 开始，我可以帮你逐步执行每个阶段！
