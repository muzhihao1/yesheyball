/// Forgot password page - allows users to request password reset email
/// Uses Supabase Auth's resetPasswordForEmail to send reset link

import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  /**
   * Handle password reset request
   * Uses Supabase Auth's resetPasswordForEmail API
   * Sends email with magic link to /reset-password page
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email format
    if (!email || !email.includes("@")) {
      toast({
        title: "邮箱格式错误",
        description: "请输入有效的邮箱地址",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Send password reset email via Supabase Auth
      // The reset link will redirect to /reset-password with a token
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setEmailSent(true);
      toast({
        title: "重置邮件已发送！",
        description: "请检查您的邮箱，点击邮件中的链接重置密码",
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        title: "发送失败",
        description: error.message || "无法发送重置邮件，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Success state - show confirmation message
  if (emailSent) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-green-800">邮件已发送</h1>
            <p className="text-gray-600">
              我们已向 <span className="font-medium">{email}</span> 发送了密码重置邮件
            </p>
            <p className="text-sm text-gray-500">
              请检查您的收件箱（包括垃圾邮件文件夹），点击邮件中的链接重置密码
            </p>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setLocation("/login")}
            >
              返回登录
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setEmailSent(false);
                setEmail("");
              }}
            >
              重新发送
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Form state - show email input form
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/login")}
            className="mb-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回登录
          </Button>
          <h1 className="text-3xl font-bold text-green-800">忘记密码？</h1>
          <p className="text-gray-600">
            输入您的邮箱地址，我们将向您发送重置密码的链接
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "发送中..." : "发送重置邮件"}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-600">记起密码了？</span>{" "}
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
