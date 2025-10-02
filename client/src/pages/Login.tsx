/// User login page for email/password authentication
/// Allows users to authenticate with their email and password

import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
              placeholder="your@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
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
  );
}
