/// User login page for email/password authentication
/// Allows users to authenticate with their email and password

import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      // Use migrate-login endpoint for seamless Supabase Auth migration
      const res = await fetch("/api/auth/migrate-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Important for session cookies
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || json.message || "Login failed");
      }

      return json;
    },
    onSuccess: async (data) => {
      // Save Supabase session to localStorage for JWT-based auth
      if (data.session?.access_token) {
        localStorage.setItem('supabase_access_token', data.session.access_token);
        localStorage.setItem('supabase_refresh_token', data.session.refresh_token);
        console.log('✅ Supabase session saved to localStorage');
      }

      // Invalidate and refetch auth query to update user data
      // IMPORTANT: useAuth uses "/api/auth/user" query key
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });

      // Wait for the query to refetch before redirecting
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });

      // Show special message if user was migrated to Supabase Auth
      const title = data.migrated && data.message
        ? "账号已升级！"
        : "登录成功！";
      const description = data.migrated && data.message
        ? data.message
        : "欢迎回来";

      toast({
        title,
        description,
      });

      // Redirect to levels page after auth state is updated
      setLocation("/levels");
    },
    onError: (error: Error) => {
      toast({
        title: "登录失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!form.email || !form.password) {
      toast({
        title: "请填写所有字段",
        description: "邮箱和密码都是必填的",
        variant: "destructive",
      });
      return;
    }

    loginMutation.mutate(form);
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
            <span className="text-white text-2xl font-bold">耶氏台球</span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            科学训练<br />成就台球大师
          </h1>
          <p className="text-green-50 text-lg mb-12 leading-relaxed">
            为台球初学者提供系统化的训练课程，通过游戏化的学习方式，让你的球技稳步提升
          </p>

          {/* Feature highlights */}
          <div className="space-y-6">
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

        {/* Bottom stats */}
        <div className="relative z-10 flex gap-12 text-white">
          <div>
            <div className="text-3xl font-bold mb-1">1000+</div>
            <div className="text-green-100">活跃学员</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">35+</div>
            <div className="text-green-100">训练关卡</div>
          </div>
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-gray-50">
        <Card className="w-full max-w-md p-8 space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold text-white">耶</span>
              </div>
              <span className="text-green-800 text-xl font-bold">耶氏台球</span>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-green-800">登录</h1>
            <p className="text-gray-600">登录您的耶氏台球账号</p>
          </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">密码</Label>
              <a
                href="/forgot-password"
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                忘记密码？
              </a>
            </div>
            <PasswordInput
              id="password"
              placeholder="输入您的密码"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "登录中..." : "登录"}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-600">还没有账号？</span>{" "}
          <a
            href="/register"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            立即注册
          </a>
        </div>
      </Card>
      </div>
    </div>
  );
}

/**
 * FeatureItem component for displaying product highlights
 * Used in the login page left panel
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
