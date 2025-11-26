/// User registration page for Supabase Auth
/// Allows new users to create an account with email and password
/// New users are automatically added to both auth.users and public.users via database trigger

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [form, setForm] = useState<RegisterForm>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  // CRITICAL: Redirect already authenticated users away from register page
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log('[Register] User already authenticated, redirecting to home...');
      setLocation('/');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Avoid flashing form for authenticated users
  if (isAuthenticated) {
    return null;
  }

  const registerMutation = useMutation({
    mutationFn: async (data: Omit<RegisterForm, "confirmPassword">) => {
      // Register user directly with Supabase Auth
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            firstName: data.firstName,
            lastName: data.lastName || null,
          },
        },
      });

      if (error) {
        throw new Error(error.message || "Registration failed");
      }

      if (!authData.user) {
        throw new Error("Failed to create user account");
      }

      return authData;
    },
    onSuccess: (data) => {
      // Check if email confirmation is required
      const needsEmailConfirmation = !data.session && data.user?.identities?.length === 0;

      toast({
        title: "注册成功！",
        description: needsEmailConfirmation
          ? "请检查您的邮箱以确认账号"
          : "您的账号已创建，请登录",
      });

      // If session exists, user is automatically logged in, redirect home (守卫会决定挑战/引导)
      // Otherwise, redirect to login page
      if (data.session) {
        setLocation("/");
      } else {
        setLocation("/login");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "注册失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!form.email || !form.password || !form.firstName) {
      toast({
        title: "请填写所有必填项",
        description: "邮箱、密码和名字是必填的",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast({
        title: "邮箱格式不正确",
        description: "请输入有效的邮箱地址",
        variant: "destructive",
      });
      return;
    }

    // Validate password length
    if (form.password.length < 8) {
      toast({
        title: "密码太短",
        description: "密码至少需要8个字符",
        variant: "destructive",
      });
      return;
    }

    // Validate password confirmation
    if (form.password !== form.confirmPassword) {
      toast({
        title: "密码不匹配",
        description: "两次输入的密码不一致",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate({
      email: form.email,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName,
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side: Product introduction (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-emerald-700 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center border border-white/20">
              <span className="text-2xl font-bold text-white">耶</span>
            </div>
            <span className="text-white text-2xl font-bold">三个月一杆清台</span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            开启你的<br />台球大师之路
          </h1>
          <p className="text-green-50 text-lg mb-12 leading-relaxed">
            加入我们的学习社区，与上千名学员一起，在专业指导下快速提升台球技能
          </p>

          {/* Feature highlights */}
          <div className="space-y-6">
            <FeatureItem
              icon="⚡"
              title="快速入门"
              description="注册即可免费开始前35关的训练课程"
            />
            <FeatureItem
              icon="📈"
              title="科学进阶"
              description="基于你的训练数据，AI 为你定制学习计划"
            />
            <FeatureItem
              icon="🏆"
              title="竞技成长"
              description="与其他学员切磋，在竞争中快速进步"
            />
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 flex gap-12 text-white">
          <div>
            <div className="text-3xl font-bold mb-1">免费</div>
            <div className="text-green-100">前35关</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">30天</div>
            <div className="text-green-100">入门周期</div>
          </div>
        </div>
      </div>

      {/* Right side: Registration form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-gray-50">
        <Card className="w-full max-w-md p-8 space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold text-white">耶</span>
              </div>
              <span className="text-green-800 text-xl font-bold">三个月一杆清台</span>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-green-800">注册账号</h1>
            <p className="text-gray-600">创建您的三个月一杆清台账号</p>
          </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              邮箱 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstName">
              名字 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              type="text"
              placeholder="请输入您的名字"
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
              placeholder="请输入您的姓氏（可选）"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              密码 <span className="text-red-500">*</span>
            </Label>
            <PasswordInput
              id="password"
              placeholder="至少8个字符"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="new-password"
            />
            <p className="text-xs text-gray-500">密码至少需要8个字符</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              确认密码 <span className="text-red-500">*</span>
            </Label>
            <PasswordInput
              id="confirmPassword"
              placeholder="再次输入密码"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
              autoComplete="new-password"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? "注册中..." : "注册"}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-600">已有账号？</span>{" "}
          <a
            href="/login"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            立即登录
          </a>
        </div>
      </Card>
      </div>
    </div>
  );
}

/**
 * FeatureItem component for displaying product highlights
 * Used in the registration page left panel
 */
function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 items-start">
      <div className="text-3xl flex-shrink-0">{icon}</div>
      <div>
        <div className="text-white font-semibold text-lg mb-1">{title}</div>
        <div className="text-green-100 text-sm leading-relaxed">{description}</div>
      </div>
    </div>
  );
}
