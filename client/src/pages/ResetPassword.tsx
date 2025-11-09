/// Reset password page - allows users to set new password after clicking email link
/// Uses Supabase Auth's updateUser to change password with session from magic link

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { CheckCircle2 } from "lucide-react";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  /**
   * Check if user has valid session from password reset email
   * The magic link in email sets up a temporary session
   */
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setHasSession(true);
      } else {
        // No session means invalid or expired reset link
        toast({
          title: "链接无效或已过期",
          description: "请重新请求密码重置邮件",
          variant: "destructive",
        });
        setTimeout(() => setLocation("/forgot-password"), 3000);
      }
    };

    checkSession();
  }, [setLocation, toast]);

  /**
   * Handle password reset submission
   * Uses Supabase Auth's updateUser to change password
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password length
    if (password.length < 8) {
      toast({
        title: "密码太短",
        description: "密码至少需要8个字符",
        variant: "destructive",
      });
      return;
    }

    // Validate password confirmation match
    if (password !== confirmPassword) {
      toast({
        title: "密码不匹配",
        description: "两次输入的密码不一致，请重新输入",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Update password using Supabase Auth
      // The session from the magic link provides authentication
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      setResetSuccess(true);
      toast({
        title: "密码重置成功！",
        description: "您可以使用新密码登录了",
      });

      // Redirect to login after 2 seconds
      setTimeout(() => setLocation("/login"), 2000);
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        title: "重置失败",
        description: error.message || "无法重置密码，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render form until we verify session exists
  if (!hasSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Success state - show confirmation
  if (resetSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-green-800">密码已重置</h1>
            <p className="text-gray-600">
              您的密码已成功重置，正在跳转到登录页面...
            </p>
          </div>

          <Button
            className="w-full"
            onClick={() => setLocation("/login")}
          >
            立即登录
          </Button>
        </Card>
      </div>
    );
  }

  // Form state - show password reset form
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-green-800">设置新密码</h1>
          <p className="text-gray-600">请输入您的新密码</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">新密码</Label>
            <PasswordInput
              id="password"
              placeholder="至少8个字符"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              autoFocus
            />
            <p className="text-xs text-gray-500">密码至少需要8个字符</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">确认新密码</Label>
            <PasswordInput
              id="confirmPassword"
              placeholder="再次输入新密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "重置中..." : "重置密码"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
