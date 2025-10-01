/// User registration page for Supabase Auth
/// Allows new users to create an account with email and password
/// New users are automatically added to both auth.users and public.users via database trigger

import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

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
  const [form, setForm] = useState<RegisterForm>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

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

      // If session exists, user is automatically logged in, redirect to levels
      // Otherwise, redirect to login page
      if (data.session) {
        setLocation("/levels");
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
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-green-800">注册账号</h1>
          <p className="text-gray-600">创建您的叶式台球账号</p>
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
            <Input
              id="password"
              type="password"
              placeholder="至少8个字符"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <p className="text-xs text-gray-500">密码至少需要8个字符</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              确认密码 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="再次输入密码"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
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
  );
}
